import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-resend-signature");
  if (signature !== process.env.RESEND_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("Received Resend event:", JSON.stringify(body));

  switch (body.type) {
    case "email.opened":
      console.log(`Email opened: ${body.data.emailId}`);
      break;

    case "email.clicked":
      console.log(`Email clicked: ${body.data.emailId}`);
      console.log(`Clicked URL: ${body.data.link}`);
      break;

    default:
      console.log(`Unhandled event type: ${body.type}`);
      break;
  }

  return NextResponse.json({ received: true });
}
