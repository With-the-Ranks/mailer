import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TOTP_TIME_WINDOW } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get user's secret
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA not setup. Please setup 2FA first." },
        { status: 400 },
      );
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: TOTP_TIME_WINDOW,
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Enable 2FA for the user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA token" },
      { status: 500 },
    );
  }
}
