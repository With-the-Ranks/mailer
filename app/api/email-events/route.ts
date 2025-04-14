import prisma from "@/lib/prisma";

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emailId = searchParams.get('emailId');

  const whereClause = emailId ? { emailId } : {};

  const events = await prisma.emailEvent.findMany({
    where: whereClause,
    orderBy: { timestamp: 'asc' },
  });

  return NextResponse.json(events);
}
