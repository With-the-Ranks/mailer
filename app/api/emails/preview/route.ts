import { render } from "@maily-to/render";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 },
    );
  }

  try {
    const { content, previewText } = await request.json();
    const jsonContent =
      typeof content === "string" ? JSON.parse(content) : content;

    const html = await render(jsonContent, {
      preview: previewText,
      pretty: true,
    });

    return NextResponse.json({ html });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Preview failed" },
      { status: 500 },
    );
  }
}
