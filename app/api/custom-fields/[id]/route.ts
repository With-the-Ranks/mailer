import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

const updateCustomFieldSchema = z.object({
  name: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  type: z.enum(["text", "number", "date", "select", "textarea"]).optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  description: z.string().optional(),
});

// PUT /api/custom-fields/[id] - Update a custom field definition
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
    const validatedData = updateCustomFieldSchema.parse(body);

    // Verify the custom field belongs to the user's organization
    const existingField = await prisma.customFieldDefinition.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" },
        { status: 404 },
      );
    }

    // If name is being updated, check for duplicates
    if (validatedData.name && validatedData.name !== existingField.name) {
      const duplicateField = await prisma.customFieldDefinition.findUnique({
        where: {
          organizationId_name: {
            organizationId: session.user.organizationId,
            name: validatedData.name,
          },
        },
      });

      if (duplicateField) {
        return NextResponse.json(
          { error: "Custom field with this name already exists" },
          { status: 409 },
        );
      }
    }

    const updatedField = await prisma.customFieldDefinition.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedField);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 },
      );
    }
    logError("Error updating custom field", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/custom-fields/[id] - Delete a custom field definition
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

    // Verify the custom field belongs to the user's organization
    const existingField = await prisma.customFieldDefinition.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" },
        { status: 404 },
      );
    }

    await prisma.customFieldDefinition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Error deleting custom field", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
