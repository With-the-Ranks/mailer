import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resendVerificationEmail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const result = await resendVerificationEmail(email);
  return NextResponse.json(result);
}
