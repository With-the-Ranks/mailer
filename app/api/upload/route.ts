import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "edge";

// Enforce a 50MB file size limit to prevent storage abuse
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      {
        status: 401,
      },
    );
  }

  try {
    // Check authentication
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | Blob;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    // Validate file size
    if (typeof file.size === "number" && file.size > MAX_FILE_SIZE) {
      return new Response("File size exceeds 50MB limit", { status: 413 });
    }

    // Validate file type (only allow images)
    if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return new Response("Only image files are allowed", { status: 400 });
    }

    // Get file extension from name (if File) or content type
    let fileExtension = "bin";
    if (file instanceof File && file.name) {
      const nameParts = file.name.split(".");
      const extCandidate =
        nameParts.length > 1 ? (nameParts.pop() || "").trim() : "";
      fileExtension = extCandidate !== "" ? extCandidate : "bin";
    } else if (file.type) {
      fileExtension = file.type.split("/")[1] || "bin";
    }

    const filename = `${nanoid()}.${fileExtension}`;

    const blob = await put(filename, file, {
      contentType: file.type || "application/octet-stream",
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      "An internal error occurred while processing the request.",
      { status: 500 },
    );
  }
}
