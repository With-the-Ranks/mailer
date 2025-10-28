import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { twoFactorEnabled: true },
    });

    return NextResponse.json({
      twoFactorRequired: user?.twoFactorEnabled || false,
    });
  } catch (error) {
    console.error("2FA check error:", error);
    return NextResponse.json(
      { error: "Failed to check 2FA status" },
      { status: 500 },
    );
  }
}
