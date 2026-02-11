import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

function splitFullName(name: string | undefined) {
  const trimmed = name?.trim() || "";
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.json();

    // Get the signup form
    const signupForm = await prisma.signupForm.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
        audienceList: true,
      },
    });

    if (!signupForm) {
      return NextResponse.json(
        { error: "Signup form not found or inactive" },
        { status: 404 },
      );
    }

    if (!signupForm.audienceList) {
      return NextResponse.json(
        { error: "No audience list configured for this form" },
        { status: 400 },
      );
    }

    const normalizedEmail = formData.email?.trim() || "";
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email is required for signup submissions" },
        { status: 400 },
      );
    }

    // Create or update audience member
    const parsedName = splitFullName(formData.name);
    const audienceData: any = {
      email: normalizedEmail,
      firstName: formData.firstName?.trim() || parsedName.firstName,
      lastName: formData.lastName?.trim() || parsedName.lastName,
      customFields: {},
    };

    // Map form data to audience fields
    Object.keys(formData).forEach((key) => {
      if (
        key !== "email" &&
        key !== "name" &&
        key !== "firstName" &&
        key !== "lastName"
      ) {
        // Map to corresponding audience field
        const fieldMapping: Record<string, string> = {
          phone: "phone",
          defaultAddressZip: "defaultAddressZip",
          defaultAddressCity: "defaultAddressCity",
          defaultAddressProvinceCode: "defaultAddressProvinceCode",
          defaultAddressCountryCode: "defaultAddressCountryCode",
          defaultAddressAddress1: "defaultAddressAddress1",
          defaultAddressAddress2: "defaultAddressAddress2",
          defaultAddressCompany: "defaultAddressCompany",
          note: "note",
          tags: "tags",
        };

        if (key === "textarea" && formData[key]) {
          audienceData.customFields = {
            ...(audienceData.customFields || {}),
            [key]: formData[key],
          };
          return;
        }

        const audienceField = fieldMapping[key];
        if (audienceField && formData[key]) {
          audienceData[audienceField] = formData[key];
          return;
        }

        if (formData[key]) {
          audienceData.customFields = {
            ...(audienceData.customFields || {}),
            [key]: formData[key],
          };
        }
      }
    });

    if (!Object.keys(audienceData.customFields || {}).length) {
      delete audienceData.customFields;
    }

    // Upsert audience member
    const audience = await prisma.audience.upsert({
      where: {
        audienceListId_email: {
          audienceListId: signupForm.audienceListId!,
          email: audienceData.email,
        },
      },
      update: {
        ...audienceData,
        updatedAt: new Date(), // Explicitly update timestamp
      },
      create: {
        ...audienceData,
        audienceListId: signupForm.audienceListId!,
      },
    });

    // Create signup submission record
    const submission = await prisma.signupSubmission.create({
      data: {
        formData,
        signupFormId: signupForm.id,
        audienceId: audience.id,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      audienceId: audience.id,
      submissionId: submission.id,
    });
  } catch (error) {
    logError("Error submitting signup form", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
