import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 },
      );
    }

    const isMember = await isOrgMember(session.user.id, organizationId);
    if (!isMember) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 },
      );
    }

    // Update user's currentOrganizationId
    await (prisma.user.update({
      where: { id: session.user.id },
      data: { currentOrganizationId: organizationId },
    }) as any);

    return NextResponse.json({ success: true, organizationId });
  } catch (error) {
    console.error("Error switching organization:", error);
    return NextResponse.json(
      { error: "Failed to switch organization" },
      { status: 500 },
    );
  }
}
