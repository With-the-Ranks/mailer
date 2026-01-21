import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      {
        status: 401,
      },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | Blob;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    // Get file extension from name (if File) or content type
    let fileExtension = "bin";
    if (file instanceof File && file.name) {
      const nameParts = file.name.split(".");
      fileExtension = nameParts.length > 1 ? nameParts.pop()! : "bin";
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
    return new Response("Failed to upload file", { status: 500 });
  }
}
