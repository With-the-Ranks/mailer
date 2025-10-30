import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get auto-signin token from HttpOnly cookie
    const autoSigninToken = request.cookies.get("auto-signin-token")?.value;

    if (!autoSigninToken) {
      return NextResponse.json(
        { error: "No auto-signin token found" },
        { status: 401 },
      );
    }

    // Verify the token exists and is valid
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: autoSigninToken,
        expires: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Return the token for sign-in
    const response = NextResponse.json({ token: autoSigninToken });

    // Clear the cookie after use
    response.cookies.delete("auto-signin-token");

    return response;
  } catch (error) {
    console.error("Error in auto-signin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
