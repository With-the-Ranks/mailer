import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

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

    // Create or update audience member
    const audienceData: any = {
      email: formData.email || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
    };

    // Map form data to audience fields
    Object.keys(formData).forEach((key) => {
      if (key !== "email" && key !== "firstName" && key !== "lastName") {
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

        const audienceField = fieldMapping[key];
        if (audienceField && formData[key]) {
          audienceData[audienceField] = formData[key];
        }
      }
    });

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
    console.error("Error submitting signup form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
