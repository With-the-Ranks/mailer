import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getBaseAppUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = getBaseAppUrl();

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?verify=invalid`);
  }

  const record = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(`${baseUrl}/login?verify=expired`);
  }

  const user = await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  if (!user.email) {
    return NextResponse.redirect(`${baseUrl}/login?verify=invalid`);
  }

  // Create a temporary auto-signin token
  const autoSigninToken = crypto.randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: autoSigninToken,
      expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  await prisma.verificationToken.deleteMany({
    where: { token },
  });

  // Create response with HttpOnly cookie containing the token
  const response = NextResponse.redirect(
    `${baseUrl}/auto-signin?email=${encodeURIComponent(user.email)}&verified=true`,
  );

  // Set auto-signin token in HttpOnly cookie
  response.cookies.set("auto-signin-token", autoSigninToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60, // 5 minutes
    path: "/",
  });

  return response;
}
