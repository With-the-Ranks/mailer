import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, name, slug } = await request.json();

    // Verify user has access to organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        users: {
          some: {
            id: session.user.id as string,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Check if slug already exists for this organization
    const existingForm = await prisma.signupForm.findFirst({
      where: {
        organizationId,
        slug,
      },
    });

    if (existingForm) {
      return NextResponse.json(
        {
          error:
            "A signup form with this slug already exists for this organization",
        },
        { status: 400 },
      );
    }

    // Create signup form with default fields
    // Find the master audience list for this organization
    const masterAudienceList = await prisma.audienceList.findFirst({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "asc", // Get the first created list (likely the master)
      },
    });

    const signupForm = await prisma.signupForm.create({
      data: {
        name,
        slug,
        organizationId,
        isActive: false,
        audienceListId: masterAudienceList?.id,
        fields: {
          create: [
            {
              name: "email",
              label: "Email Address",
              type: "email",
              required: true,
              placeholder: "Enter your email address",
              order: 0,
            },
            {
              name: "firstName",
              label: "First Name",
              type: "firstName",
              required: true,
              placeholder: "Enter your first name",
              order: 1,
            },
            {
              name: "lastName",
              label: "Last Name",
              type: "lastName",
              required: true,
              placeholder: "Enter your last name",
              order: 2,
            },
          ],
        },
      },
      include: {
        fields: true,
      },
    });

    return NextResponse.json(signupForm);
  } catch (error) {
    logError("Error creating signup form", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 },
      );
    }

    // Verify user has access to organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        users: {
          some: {
            id: session.user.id as string,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    const signupForms = await prisma.signupForm.findMany({
      where: {
        organizationId,
      },
      include: {
        fields: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(signupForms);
  } catch (error) {
    logError("Error fetching signup forms", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
