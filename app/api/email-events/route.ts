import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emailId = searchParams.get("emailId");

  const whereClause = emailId ? { emailId } : {};

  const events = await prisma.emailEvent.findMany({
    where: whereClause,
    orderBy: { timestamp: "desc" },
  });

  return NextResponse.json(events);
}
