import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const createCustomFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "number", "date", "select", "textarea"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  description: z.string().optional(),
});

// GET /api/custom-fields - Get all custom field definitions for organization
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customFields = await prisma.customFieldDefinition.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(customFields);
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/custom-fields - Create a new custom field definition
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCustomFieldSchema.parse(body);

    // Check if field name already exists for this organization
    const existingField = await prisma.customFieldDefinition.findUnique({
      where: {
        organizationId_name: {
          organizationId: session.user.organizationId,
          name: validatedData.name,
        },
      },
    });

    if (existingField) {
      return NextResponse.json(
        { error: "Custom field with this name already exists" },
        { status: 409 },
      );
    }

    const customField = await prisma.customFieldDefinition.create({
      data: {
        ...validatedData,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(customField, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Error creating custom field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
