import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
        organization: true,
        audienceList: true,
        _count: {
          select: {
            submissions: true,
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

    return NextResponse.json(signupForm);
  } catch (error) {
    logError("Error fetching signup form", error);
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

    const { name, slug, isActive, audienceListId } = await request.json();

    // Basic validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Form name is required" },
        { status: 400 },
      );
    }

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { error: "Form slug is required" },
        { status: 400 },
      );
    }

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

    // Check for duplicate slug in the same organization
    const existingForm = await prisma.signupForm.findFirst({
      where: {
        slug: slug.trim(),
        organizationId: signupForm.organizationId,
        id: { not: id },
      },
    });

    if (existingForm) {
      return NextResponse.json(
        { error: "A form with this slug already exists" },
        { status: 400 },
      );
    }

    const updatedSignupForm = await prisma.signupForm.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        isActive,
        audienceListId,
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
        organization: true,
        audienceList: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    // Revalidate the public signup form page
    await revalidatePath(`/signup-forms/${updatedSignupForm.slug}`);

    // Also revalidate with the old slug if it changed
    if (signupForm.slug !== updatedSignupForm.slug) {
      await revalidatePath(`/signup-forms/${signupForm.slug}`);
    }

    return NextResponse.json(updatedSignupForm);
  } catch (error) {
    logError("Error updating signup form", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    await prisma.signupForm.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Error deleting signup form", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
