import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const defaultReasons = [
  "I receive too many emails",
  "The content is not relevant to me",
  "I never signed up for this list",
  "The emails are too frequent",
  "I prefer other communication channels",
  "Other",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const listId = searchParams.get("list");
  const organizationId = searchParams.get("organization");

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 },
    );
  }

  if (!listId && !organizationId) {
    return NextResponse.json(
      { error: "Must include list or organization to look up subscription" },
      { status: 400 },
    );
  }

  try {
    const audience = await prisma.audience.findFirst({
      where: {
        email,
        ...(listId
          ? { audienceListId: listId }
          : organizationId
            ? {
                audienceList: {
                  organizationId,
                },
              }
            : {}),
      },
    });

    if (!audience) {
      return NextResponse.json(
        { error: "Email not found in the specified audience." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      email,
      listId: audience.audienceListId,
      alreadyUnsubscribed: audience.isUnsubscribed,
      reasons: defaultReasons,
    });
  } catch (error) {
    console.error("Error fetching unsubscribe data:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscribe request" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, listId, organizationId, reason, customReason } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!listId && !organizationId) {
      return NextResponse.json(
        { error: "Must include listId or organizationId" },
        { status: 400 },
      );
    }

    const audience = await prisma.audience.findFirst({
      where: {
        email,
        ...(listId
          ? { audienceListId: listId }
          : organizationId
            ? {
                audienceList: {
                  organizationId,
                },
              }
            : {}),
      },
    });

    if (!audience) {
      return NextResponse.json(
        { error: "Email not found for the provided subscription." },
        { status: 404 },
      );
    }

    if (audience.isUnsubscribed) {
      return NextResponse.json({
        message: "You have already unsubscribed from this list",
        alreadyUnsubscribed: true,
      });
    }

    const unsubscribeReason =
      reason === "Other" && customReason ? customReason : reason;

    await prisma.audience.update({
      where: { id: audience.id },
      data: {
        isUnsubscribed: true,
        unsubscribedAt: new Date(),
        unsubscribeReason,
      },
    });

    return NextResponse.json({
      message: "Successfully unsubscribed from the list",
      success: true,
    });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
}
