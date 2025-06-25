import { type NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";

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

    // Make sure the audience list belongs to the user's org
    const audienceList = await prisma.audienceList.findUnique({
      where: { id: audienceListId },
    });
    if (
      !audienceList ||
      audienceList.organizationId !== session.user.organizationId
    ) {
      return NextResponse.json(
        { error: "Audience list not found" },
        { status: 404 },
      );
    }

    // Fetch contacts for that list
    const contacts = await prisma.audience.findMany({
      where: { audienceListId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
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
          details: result.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    const validatedData = result.data;

    // Verify the audience list belongs to the user's organization
    const audienceList = await prisma.audienceList.findUnique({
      where: { id: validatedData.audienceListId },
    });
    if (
      !audienceList ||
      audienceList.organizationId !== session.user.organizationId
    ) {
      return NextResponse.json(
        { error: "Audience list not found" },
        { status: 404 },
      );
    }

    // Check if contact with this email already exists in the list
    const existingContact = await prisma.audience.findUnique({
      where: {
        audienceListId_email: {
          audienceListId: validatedData.audienceListId,
          email: validatedData.email,
        },
      },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: "Contact with this email already exists" },
        { status: 409 },
      );
    }

    const contact = await prisma.audience.create({
      data: validatedData,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 },
    );
  }
}
