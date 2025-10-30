import { Maily } from "@maily-to/render";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getUnsubscribeUrl } from "@/lib/utils";

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 },
    );
  }

  try {
    const session = await getSession();
    const { content, previewText, audienceListId, organizationId } =
      await request.json();
    const jsonContent =
      typeof content === "string" ? JSON.parse(content) : content;

    const maily = new Maily(jsonContent);
    if (previewText) {
      maily.setPreviewText(previewText);
    }

    // Set variables for preview, including unsubscribe_url
    const variables = {
      unsubscribe_url: getUnsubscribeUrl({
        email: session?.user?.email,
        listId: audienceListId,
        organizationId,
      }),
    };
    maily.setVariableValues(variables);

    let html = await maily.render();

    // Replace variable placeholders in href attributes (Maily doesn't do this automatically)
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      html = html.replaceAll(placeholder, value);
    }

    return NextResponse.json({ html });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Preview failed" },
      { status: 500 },
    );
  }
}
