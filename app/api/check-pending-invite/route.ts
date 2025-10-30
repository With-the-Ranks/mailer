import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Find the most recent pending invitation for this email
    const invitation = await (prisma as any).organizationInvitation.findFirst({
      where: {
        email: email.toLowerCase(),
        acceptedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (invitation) {
      return NextResponse.json({
        hasInvite: true,
        token: invitation.token,
      });
    }

    return NextResponse.json({ hasInvite: false });
  } catch (error) {
    console.error("Error checking pending invite:", error);
    return NextResponse.json(
      { error: "Failed to check invites" },
      { status: 500 },
    );
  }
}
