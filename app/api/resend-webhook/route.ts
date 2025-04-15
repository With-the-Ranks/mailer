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
            emailId: data.tags?.intrepidId,
            userId: data.tags?.userId,
            eventType: "opened",
            timestamp: new Date(data.timestamp ?? Date.now()),
            emailTo: data.to[0],
          },
        });
        break;

      case "email.clicked":
        await prisma.emailEvent.create({
          data: {
            emailId: data.tags?.intrepidId,
            userId: data.tags?.userId,
            eventType: "clicked",
            link: data.click?.link,
            timestamp: new Date(data.timestamp ?? Date.now()),
            emailTo: data.to[0],
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
