import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";
import { contactSchema } from "@/lib/validations";

const normalizeText = (value: string | null | undefined) => value?.trim() || "";
const normalizeEmail = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const bulkImportSchema = z.object({
  contacts: z.array(contactSchema),
  audienceListId: z.string().min(1, "Audience list ID is required"),
  skipDuplicates: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = bulkImportSchema.safeParse(body);
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

    const { contacts, audienceListId, skipDuplicates } = result.data;

    const audienceList = await prisma.audienceList.findUnique({
      where: {
        id: audienceListId,
      },
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

    const results = {
      successful: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const contactData of contacts) {
      try {
        const normalizedEmail = normalizeEmail(contactData.email);
        const normalizedFirstName = normalizeText(contactData.firstName);
        const normalizedLastName = normalizeText(contactData.lastName);
        const normalizedPhone = contactData.phone?.trim() || null;

        if (skipDuplicates && normalizedEmail) {
          const existingContact = await prisma.audience.findUnique({
            where: {
              audienceListId_email: {
                audienceListId,
                email: normalizedEmail,
              },
            },
          });
          if (existingContact) {
            results.skipped++;
            continue;
          }
        }
        await prisma.audience.create({
          data: {
            ...contactData,
            email: normalizedEmail,
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            phone: normalizedPhone,
            audienceListId,
          } as any,
        });
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Failed to import ${contactData.email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    logError("Error bulk importing contacts", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to import contacts" },
      { status: 500 },
    );
  }
}
