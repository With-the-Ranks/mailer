import { NextResponse } from "next/server";

import { unscheduleEmail } from "@/lib/actions/send-email";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const emailId = decodeURIComponent(id);
  const email = await prisma.email.findUnique({
    where: { id: emailId },
    select: { resendId: true },
  });

  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }
  if (!email.resendId) {
    return NextResponse.json(
      { error: "No scheduled email to cancel" },
      { status: 400 },
    );
  }

  try {
    // cancel via Resend API
    await unscheduleEmail({ resendId: email.resendId });
    // mark back to draft
    await prisma.email.update({
      where: { id: emailId },
      data: { published: false },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logError("Error unscheduling email", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
