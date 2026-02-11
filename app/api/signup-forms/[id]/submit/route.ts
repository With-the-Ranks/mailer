import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

type JsonRecord = Record<string, unknown>;

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

function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSubmissionPayload(payload: unknown) {
  const data = isRecord(payload) ? payload : {};

  const metadata = {
    honeypot: toTrimmedString(data._hp),
    source: toTrimmedString(data._source),
    sourceCode: toTrimmedString(data._sourceCode),
    pageUrl: toTrimmedString(data._pageUrl),
    referrer: toTrimmedString(data._referrer),
  };

  const formData: JsonRecord = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith("_")) return;
    formData[key] = value;
  });

  return { metadata, formData };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const { metadata, formData } = parseSubmissionPayload(payload);

    // Bot submissions often fill hidden fields. Accept silently and skip writes.
    if (metadata.honeypot) {
      return NextResponse.json({ success: true });
    }

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

    const normalizedEmail = toTrimmedString(formData.email);
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email is required for signup submissions" },
        { status: 400 },
      );
    }

    const audienceListId = signupForm.audienceListId!;
    const existingAudience = await prisma.audience.findUnique({
      where: {
        audienceListId_email: {
          audienceListId,
          email: normalizedEmail,
        },
      },
      select: {
        customFields: true,
      },
    });

    const existingCustomFields = isRecord(existingAudience?.customFields)
      ? existingAudience.customFields
      : {};
    const mergedCustomFields: JsonRecord = { ...existingCustomFields };

    // Create or update audience member
    const parsedName = splitFullName(toTrimmedString(formData.name));
    const audienceData: any = {
      email: normalizedEmail,
      firstName: toTrimmedString(formData.firstName) || parsedName.firstName,
      lastName: toTrimmedString(formData.lastName) || parsedName.lastName,
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
          mergedCustomFields[key] = formData[key];
          return;
        }

        const audienceField = fieldMapping[key];
        if (audienceField && formData[key]) {
          audienceData[audienceField] = formData[key];
          return;
        }

        if (formData[key]) {
          mergedCustomFields[key] = formData[key];
        }
      }
    });

    if (Object.keys(mergedCustomFields).length > 0) {
      audienceData.customFields = mergedCustomFields;
    }

    // Upsert audience member
    const audience = await prisma.audience.upsert({
      where: {
        audienceListId_email: {
          audienceListId,
          email: audienceData.email,
        },
      },
      update: {
        ...audienceData,
        updatedAt: new Date(), // Explicitly update timestamp
      },
      create: {
        ...audienceData,
        audienceListId,
      },
    });

    const submissionMeta: JsonRecord = {};
    if (metadata.source) submissionMeta.source = metadata.source;
    if (metadata.sourceCode) submissionMeta.sourceCode = metadata.sourceCode;
    if (metadata.pageUrl) submissionMeta.pageUrl = metadata.pageUrl;
    if (metadata.referrer) submissionMeta.referrer = metadata.referrer;
    const hasSubmissionMeta = Object.keys(submissionMeta).length > 0;
    const submissionFormData: JsonRecord = { ...formData };
    if (hasSubmissionMeta) {
      submissionFormData._meta = submissionMeta;
    }

    // Create signup submission record
    const submission = await prisma.signupSubmission.create({
      data: {
        formData: submissionFormData as any,
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
