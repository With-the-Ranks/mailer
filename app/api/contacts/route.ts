import { type NextRequest, NextResponse } from "next/server";

import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";
import { contactSchema } from "@/lib/validations";

const normalizeText = (value: string | null | undefined) => value?.trim() || "";
const normalizeEmail = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const readString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const serializeContact = <T extends { email: string | null }>(contact: T) => ({
  ...contact,
  email: contact.email || "",
});
const extractSubmissionSource = (formData: unknown) => {
  if (!isRecord(formData)) return { source: "", sourceCode: "" };

  const meta = isRecord(formData._meta) ? formData._meta : {};
  const sourceCode =
    readString(meta.sourceCode) ||
    readString(formData.sourceCode) ||
    readString(formData.source_code);
  const source =
    sourceCode ||
    readString(meta.source) ||
    readString(formData.source) ||
    readString(formData.utm_source);

  return { source, sourceCode };
};

// GET: List contacts for a specific audience list owned by the user's org
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const audienceListId = searchParams.get("audienceListId");

    if (!audienceListId) {
      return NextResponse.json(
        { error: "audienceListId is required" },
        { status: 400 },
      );
    }

    // Make sure the audience list exists and user has access to the organization
    const audienceList = await prisma.audienceList.findUnique({
      where: { id: audienceListId },
    });
    if (!audienceList) {
      return NextResponse.json(
        { error: "Audience list not found" },
        { status: 404 },
      );
    }

    // Check if user is a member of the organization that owns this audience list
    const hasAccess = await isOrgMember(
      session.user.id as string,
      audienceList.organizationId,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch contacts for that list
    const contacts = await prisma.audience.findMany({
      where: { audienceListId },
      orderBy: { createdAt: "desc" },
      include: {
        signupSubmissions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            signupForm: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const contactsWithAttribution = contacts.map((contact) => {
      const { signupSubmissions, ...contactWithoutSubmissions } = contact;
      const latestSubmission = contact.signupSubmissions[0];
      const { source, sourceCode } = extractSubmissionSource(
        latestSubmission?.formData,
      );

      return serializeContact({
        ...contactWithoutSubmissions,
        signupFormId: latestSubmission?.signupForm?.id || "",
        signupFormName: latestSubmission?.signupForm?.name || "Dashboard",
        signupFormSlug: latestSubmission?.signupForm?.slug || "",
        signupSource: source || "",
        signupSourceCode: sourceCode,
      });
    });

    return NextResponse.json(contactsWithAttribution);
  } catch (error) {
    logError("Error fetching contacts", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 },
    );
  }
}

// POST: Add a new contact to an audience list, if email is unique in that list
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid data",
          details: result.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    const validatedData = result.data;
    const normalizedEmail = normalizeEmail(validatedData.email);
    const normalizedFirstName = normalizeText(validatedData.firstName);
    const normalizedLastName = normalizeText(validatedData.lastName);
    const normalizedPhone = validatedData.phone?.trim() || null;

    // Verify the audience list exists and user has access to the organization
    const audienceList = await prisma.audienceList.findUnique({
      where: { id: validatedData.audienceListId },
    });
    if (!audienceList) {
      return NextResponse.json(
        { error: "Audience list not found" },
        { status: 404 },
      );
    }

    // Check if user is a member of the organization that owns this audience list
    const hasAccess = await isOrgMember(
      session.user.id as string,
      audienceList.organizationId,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if contact with this email already exists in the list
    if (normalizedEmail) {
      const existingContact = await prisma.audience.findUnique({
        where: {
          audienceListId_email: {
            audienceListId: validatedData.audienceListId,
            email: normalizedEmail,
          },
        },
      });

      if (existingContact) {
        return NextResponse.json(
          { error: "Contact with this email already exists" },
          { status: 409 },
        );
      }
    }

    const contact = await prisma.audience.create({
      data: {
        ...validatedData,
        email: normalizedEmail,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        phone: normalizedPhone,
      } as any,
    });

    return NextResponse.json(serializeContact(contact), { status: 201 });
  } catch (error) {
    logError("Error creating contact", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Contact with this email already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 },
    );
  }
}
