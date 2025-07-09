import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildAudienceWhere } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { audienceListId, filterCriteria } = await request.json();

  const where = buildAudienceWhere(audienceListId, filterCriteria);

  const contacts = await prisma.audience.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contacts);
}
