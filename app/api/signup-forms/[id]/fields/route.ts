import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, label, type, required, placeholder, options, order } =
      await request.json();

    // Verify user has access to signup form
    const signupForm = await prisma.signupForm.findFirst({
      where: {
        id,
        organization: {
          users: {
            some: {
              id: session.user.id as string,
            },
          },
        },
      },
    });

    if (!signupForm) {
      return NextResponse.json(
        { error: "Signup form not found" },
        { status: 404 },
      );
    }

    const field = await prisma.signupFormField.create({
      data: {
        name,
        label,
        type,
        required: required || false,
        placeholder,
        options: options || [],
        order: order || 0,
        signupFormId: id,
      },
    });

    // Revalidate the public signup form page
    await revalidatePath(`/signup-forms/${signupForm.slug}`);

    return NextResponse.json(field);
  } catch (error) {
    console.error("Error creating signup form field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fields } = await request.json();

    // Verify user has access to signup form
    const signupForm = await prisma.signupForm.findFirst({
      where: {
        id,
        organization: {
          users: {
            some: {
              id: session.user.id as string,
            },
          },
        },
      },
    });

    if (!signupForm) {
      return NextResponse.json(
        { error: "Signup form not found" },
        { status: 404 },
      );
    }

    // Update fields in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get existing field IDs to preserve them
      const existingFields = await tx.signupFormField.findMany({
        where: {
          signupFormId: id,
        },
        select: {
          id: true,
        },
      });

      const existingFieldIds = new Set(existingFields.map((f) => f.id));

      // Separate fields into existing and new
      const fieldsToUpdate = fields.filter(
        (field: any) => field.id && existingFieldIds.has(field.id),
      );
      const fieldsToCreate = fields.filter(
        (field: any) => !field.id || !existingFieldIds.has(field.id),
      );

      // Update existing fields
      const updatePromises = fieldsToUpdate.map((field: any, index: number) =>
        tx.signupFormField.update({
          where: { id: field.id },
          data: {
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required || false,
            placeholder: field.placeholder,
            options: field.options || [],
            order: index,
          },
        }),
      );

      // Create new fields
      const createPromises = fieldsToCreate.map((field: any, index: number) =>
        tx.signupFormField.create({
          data: {
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required || false,
            placeholder: field.placeholder,
            options: field.options || [],
            order: fieldsToUpdate.length + index,
            signupFormId: id,
          },
        }),
      );

      // Delete fields that are no longer in the form
      const fieldsToDelete = existingFields.filter(
        (existing) => !fields.some((field: any) => field.id === existing.id),
      );

      const deletePromises = fieldsToDelete.map((field) =>
        tx.signupFormField.delete({
          where: { id: field.id },
        }),
      );

      // Execute all operations
      const [updatedFields, createdFields] = await Promise.all([
        Promise.all(updatePromises),
        Promise.all(createPromises),
        ...deletePromises,
      ]);

      return [...updatedFields, ...createdFields];
    });

    // Revalidate the public signup form page
    await revalidatePath(`/signup-forms/${signupForm.slug}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating signup form fields:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
