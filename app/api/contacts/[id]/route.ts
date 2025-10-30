import { type NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";
import { updateContactSchema } from "@/lib/validations";

// PUT: Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate the request body
    const result = updateContactSchema.safeParse(body);
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

    // Find the contact and verify ownership
    const contact = await prisma.audience.findUnique({
      where: { id },
      include: { audienceList: true },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Verify the audience list belongs to the user's organization
    if (contact.audienceList.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedContact = await prisma.audience.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    logError("Error updating contact", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find the contact and verify ownership
    const contact = await prisma.audience.findUnique({
      where: { id },
      include: { audienceList: true },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Verify the audience list belongs to the user's organization
    if (contact.audienceList.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.audience.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Error deleting contact", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 },
    );
  }
}
