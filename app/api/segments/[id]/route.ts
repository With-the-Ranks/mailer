import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Mock database - replace with your actual database
const segments: any[] = [];

const updateSegmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
  filterCriteria: z.record(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const segment = segments.find((s) => s.id === params.id);

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    return NextResponse.json(segment);
  } catch (error) {
    console.error("Failed to get segment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const validatedData = updateSegmentSchema.parse(body);

    const segmentIndex = segments.findIndex((s) => s.id === params.id);

    if (segmentIndex === -1) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    const updatedSegment = {
      ...segments[segmentIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    segments[segmentIndex] = updatedSegment;

    return NextResponse.json(updatedSegment);
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

    console.error("Failed to update segment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const segmentIndex = segments.findIndex((s) => s.id === params.id);

    if (segmentIndex === -1) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    segments.splice(segmentIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete segment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
