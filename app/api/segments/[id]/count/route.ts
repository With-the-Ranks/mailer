import { NextResponse } from "next/server";

import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildAudienceWhere, logError } from "@/lib/utils";

function safeFilterCriteria(filterCriteria: unknown): Record<string, any> {
  return filterCriteria &&
    typeof filterCriteria === "object" &&
    !Array.isArray(filterCriteria)
    ? (filterCriteria as Record<string, any>)
    : {};
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const segment = await prisma.segment.findUnique({
      where: { id },
      select: {
        id: true,
        audienceListId: true,
        organizationId: true,
        filterCriteria: true,
      },
    });

    if (!segment || !segment.organizationId) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    const hasAccess = await isOrgMember(
      session.user.id as string,
      segment.organizationId,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const count = await prisma.audience.count({
      where: buildAudienceWhere(
        segment.audienceListId,
        safeFilterCriteria(segment.filterCriteria),
      ),
    });

    return NextResponse.json({ count });
  } catch (error) {
    logError("Failed to get segment contact count", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
