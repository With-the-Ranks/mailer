import { NextRequest, NextResponse } from "next/server";
import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 },
      );
    }

    // Check if user has access to this organization
    const hasAccess = await isOrgMember(
      session.user.id as string,
      organizationId,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the first audience list for this organization
    const audienceList = await prisma.audienceList.findFirst({
      where: { organizationId },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (!audienceList) {
      return NextResponse.json(
        { error: "No audience list found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ id: audienceList.id });
  } catch (error) {
    logError("Error fetching audience list", error);
    return NextResponse.json(
      { error: "Failed to fetch audience list" },
      { status: 500 },
    );
  }
}
