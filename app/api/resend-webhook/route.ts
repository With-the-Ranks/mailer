import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

type ResendEventBody = {
  type: string;
  data: {
    timestamp?: string;
    to?: string[];
    tags?: { intrepidId?: string; userId?: string };
    click?: { link: string };
  };
};

export async function POST(req: NextRequest) {
  let body: ResendEventBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("Received Resend event:", JSON.stringify(body));
  const { type, data } = body;
  const emailId = data.tags?.intrepidId;
  const userId = data.tags?.userId;
  const emailTo = data.to?.[0] ?? null;
  const ts = data.timestamp ? new Date(data.timestamp) : new Date();

  if (!emailId || !emailTo) {
    console.warn("Missing emailId or to-address, skipping");
    return NextResponse.json({ received: false });
  }

  const eventTypeMap: Record<string, string> = {
    "email.sent": "sent",
    "email.delivered": "delivered",
    "email.delivery_delayed": "delivery_delayed",
    "email.complained": "complained",
    "email.bounced": "bounced",
    "email.opened": "opened",
    "email.clicked": "clicked",
  };

  const evt = eventTypeMap[type];
  if (!evt) {
    return NextResponse.json({ received: true });
  }

  try {
    await prisma.emailEvent.create({
      data: {
        emailId,
        userId,
        emailTo,
        eventType: evt,
        timestamp: ts,
        link: type === "email.clicked" ? data.click?.link : null,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      console.warn(`Duplicate event skipped: ${emailId}/${emailTo}/${evt}`);
    } else {
      logError("Error storing event", err);
      return NextResponse.json(
        { error: "Failed to store event" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
