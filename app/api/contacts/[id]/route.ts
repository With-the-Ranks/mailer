import { type NextRequest, NextResponse } from "next/server";

import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";
import {
  hasPrimaryContactIdentifier,
  updateContactSchema,
} from "@/lib/validations";

const normalizeText = (value: string | null | undefined) => value?.trim() || "";
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const serializeContact = <T extends { email: string }>(contact: T) => contact;

// PUT: Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const result = updateContactSchema.safeParse(body);
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

    // Find the contact and verify ownership
    const contact = await prisma.audience.findUnique({
      where: { id },
      include: { audienceList: true },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Check if user has access to the organization that owns this contact's audience list
    const hasAccess = await isOrgMember(
      session.user.id as string,
      contact.audienceList.organizationId,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, any> = { ...validatedData };

    if ("email" in validatedData && typeof validatedData.email === "string") {
      updateData.email = normalizeEmail(validatedData.email);
    }
    if ("firstName" in validatedData) {
      updateData.firstName = normalizeText(validatedData.firstName);
    }
    if ("lastName" in validatedData) {
      updateData.lastName = normalizeText(validatedData.lastName);
    }
    if ("phone" in validatedData) {
      updateData.phone = validatedData.phone?.trim() || null;
    }

    const nextIdentity = {
      email: "email" in updateData ? updateData.email : contact.email,
      firstName:
        "firstName" in updateData ? updateData.firstName : contact.firstName,
      lastName:
        "lastName" in updateData ? updateData.lastName : contact.lastName,
      phone: "phone" in updateData ? updateData.phone : contact.phone,
    };

    if (!hasPrimaryContactIdentifier(nextIdentity)) {
      return NextResponse.json(
        { error: "At least one of name, email, or phone is required" },
        { status: 400 },
      );
    }

    const updatedContact = await prisma.audience.update({
      where: { id },
      data: updateData as any,
    });

    return NextResponse.json(serializeContact(updatedContact));
  } catch (error) {
    logError("Error updating contact", error);

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
      { error: "Failed to update contact" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the contact and verify ownership
    const contact = await prisma.audience.findUnique({
      where: { id },
      include: { audienceList: true },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Check if user has access to the organization that owns this contact's audience list
    const hasAccess = await isOrgMember(
      session.user.id as string,
      contact.audienceList.organizationId,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
