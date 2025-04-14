import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("Received Resend event:", JSON.stringify(body));

  const { type, data } = body;

  try {
    switch (type) {
      case "email.opened":
        await prisma.emailEvent.create({
          data: {
            emailId: data.emailId,
            eventType: "opened",
            timestamp: new Date(data.timestamp ?? Date.now()),
          },
        });
        break;

      case "email.clicked":
        await prisma.emailEvent.create({
          data: {
            emailId: data.emailId,
            eventType: "clicked",
            link: data.link,
            timestamp: new Date(data.timestamp ?? Date.now()),
          },
        });
        break;

      default:
        console.log(`Unhandled event type: ${type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error storing event:", error);
    return NextResponse.json(
      { error: "Failed to store event" },
      { status: 500 },
    );
  }
}
