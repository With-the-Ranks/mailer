import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://app.localhost:3000";

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

  // Redirect to auto-signin page with token
  return NextResponse.redirect(
    `${baseUrl}/auto-signin?email=${encodeURIComponent(user.email)}&verified=true&token=${autoSigninToken}`,
  );
}
