import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = `https://${process.env.VERCEL_URL}`;

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?verify=invalid`);
  }

  const record = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(`${baseUrl}/login?verify=expired`);
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({
    where: { token },
  });

  return NextResponse.redirect(`${baseUrl}/login?verify=success`);
}
