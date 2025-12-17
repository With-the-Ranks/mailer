import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildAudienceWhere } from "@/lib/utils";
import { logError } from "@/lib/utils";

// Zod schema for updating a segment
const updateSegmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional().nullable(),
  filterCriteria: z.record(z.any()).optional(),
});

function safeFilterCriteria(filterCriteria: unknown): Record<string, any> {
  return filterCriteria &&
    typeof filterCriteria === "object" &&
    !Array.isArray(filterCriteria)
    ? (filterCriteria as Record<string, any>)
    : {};
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const segment = await prisma.segment.findUnique({
      where: { id },
      include: {
        audienceList: { select: { id: true, name: true } },
      },
    });

    if (!segment || segment.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    // Dynamic contact count
    const contactCount = await prisma.audience.count({
      where: buildAudienceWhere(
        segment.audienceListId,
        safeFilterCriteria(segment.filterCriteria),
      ),
    });

    return NextResponse.json({ ...segment, contactCount });
  } catch (error) {
    logError("Failed to get segment", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateSegmentSchema.parse(body);

    // Check segment exists and belongs to org
    const segment = await prisma.segment.findUnique({
      where: { id },
    });

    if (!segment || segment.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    // Update segment
    const updatedSegment = await prisma.segment.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        audienceList: { select: { id: true, name: true } },
      },
    });

    // Dynamic contact count
    const contactCount = await prisma.audience.count({
      where: buildAudienceWhere(
        updatedSegment.audienceListId,
        safeFilterCriteria(updatedSegment.filterCriteria),
      ),
    });

    return NextResponse.json({ ...updatedSegment, contactCount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    logError("Failed to update segment", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check segment exists and belongs to org
    const segment = await prisma.segment.findUnique({
      where: { id },
    });

    if (!segment || segment.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    await prisma.segment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to delete segment", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
