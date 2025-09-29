import { hash } from "bcryptjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sendPasswordResetEmail } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, token, password } = await req.json();

  if (token && password) {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });
    if (!record || record.expires < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 400 },
      );
    }

    const hashed = await hash(password, 10);
    await prisma.user.update({
      where: { email: record.identifier },
      data: { password: hashed },
    });
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ success: true });
  }

  if (email) {
    const result = await sendPasswordResetEmail(email);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  }

  // missing required fields
  return NextResponse.json(
    { error: "Must provide either { email } or { token, password }." },
    { status: 400 },
  );
}
