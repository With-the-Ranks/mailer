import { type NextRequest, NextResponse } from "next/server";

import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildAudienceWhere } from "@/lib/utils";
import { logError } from "@/lib/utils";
import { segmentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const audienceListId = searchParams.get("audienceListId");

    if (!organizationId && !audienceListId) {
      return NextResponse.json(
        { error: "organizationId or audienceListId is required" },
        { status: 400 },
      );
    }

    let targetOrgId: string | null = null;

    if (audienceListId) {
      const audienceList = await prisma.audienceList.findUnique({
        where: { id: audienceListId },
      });
      if (!audienceList) {
        return NextResponse.json(
          { error: "Audience list not found" },
          { status: 404 },
        );
      }
      // Check if user has access to the organization that owns this audience list
      const hasAccess = await isOrgMember(
        session.user.id as string,
        audienceList.organizationId,
      );
      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetOrgId = audienceList.organizationId;
    } else if (organizationId) {
      // Check if user has access to this organization
      const hasAccess = await isOrgMember(
        session.user.id as string,
        organizationId,
      );
      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetOrgId = organizationId;
    }

    if (!targetOrgId) {
      return NextResponse.json(
        { error: "organizationId or audienceListId is required" },
        { status: 400 },
      );
    }

    const where: any = {
      organizationId: targetOrgId,
    };

    if (audienceListId) {
      where.audienceListId = audienceListId;
    }

    const segments = await prisma.segment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        audienceList: { select: { id: true, name: true } },
      },
    });

    // Dynamically count contacts for each segment
    const segmentsWithCounts = await Promise.all(
      segments.map(
        async (segment: {
          id: string;
          filterCriteria: any;
          audienceListId: string;
          audienceList: { id: string; name: string };
          [key: string]: any;
        }) => {
          const filterCriteria =
            segment.filterCriteria &&
            typeof segment.filterCriteria === "object" &&
            !Array.isArray(segment.filterCriteria)
              ? (segment.filterCriteria as Record<string, any>)
              : {};

          const count = await prisma.audience.count({
            where: buildAudienceWhere(segment.audienceListId, filterCriteria),
          });
          return { ...segment, contactCount: count };
        },
      ),
    );

    return NextResponse.json(segmentsWithCounts);
  } catch (error) {
    logError("Error fetching segments", error);
    return NextResponse.json(
      { error: "Failed to fetch segments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const result = segmentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid data",
          details: result.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    const validatedData = result.data;

    if (!validatedData.audienceListId) {
      return NextResponse.json(
        { error: "audienceListId is required" },
        { status: 400 },
      );
    }

    const audienceList = await prisma.audienceList.findUnique({
      where: { id: validatedData.audienceListId },
    });

    if (!audienceList) {
      return NextResponse.json(
        { error: "Audience list not found" },
        { status: 404 },
      );
    }

    // Check if user has access to the organization that owns this audience list
    const hasAccess = await isOrgMember(
      session.user.id as string,
      audienceList.organizationId,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate contactCount at creation (optional, for analytics)
    const contactCount = await prisma.audience.count({
      where: buildAudienceWhere(
        validatedData.audienceListId,
        validatedData.filterCriteria,
      ),
    });

    const segment = await prisma.segment.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        audienceListId: validatedData.audienceListId,
        filterCriteria: validatedData.filterCriteria as any,
        organizationId: audienceList.organizationId,
        contactCount, // store at creation, but always recalculate in GET
      },
      include: {
        audienceList: { select: { id: true, name: true } },
      },
    });

    // Return with dynamic count for consistency
    return NextResponse.json({ ...segment, contactCount }, { status: 201 });
  } catch (error) {
    logError("Error creating segment", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create segment" },
      { status: 500 },
    );
  }
}
