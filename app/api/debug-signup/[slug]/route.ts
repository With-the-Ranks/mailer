import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const slug = decodeURIComponent(params.slug);

    // Get all forms with this slug
    const allForms = await prisma.signupForm.findMany({
      where: {
        slug,
      },
      include: {
        fields: true,
        organization: true,
      },
    });

    // Get active form
    const activeForm = await prisma.signupForm.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        fields: true,
        organization: true,
      },
    });

    return NextResponse.json({
      slug,
      allFormsCount: allForms.length,
      allForms: allForms.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        isActive: f.isActive,
        createdAt: f.createdAt,
      })),
      activeForm: activeForm
        ? {
            id: activeForm.id,
            name: activeForm.name,
            slug: activeForm.slug,
            isActive: activeForm.isActive,
            fieldsCount: activeForm.fields.length,
          }
        : null,
    });
  } catch (error) {
    console.error("Error debugging signup form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
