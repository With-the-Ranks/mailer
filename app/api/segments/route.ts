import { type NextRequest, NextResponse } from "next/server";

import { segmentSchema } from "@/lib/validations";

// Mock session and prisma for demo
const getSession = async () => ({ user: { organizationId: "org-1" } });
const prisma = {
  audienceList: {
    findFirst: async (query: any) => ({
      id: query.where.id,
      organizationId: "org-1",
    }),
  },
  segment: {
    findMany: async (query: any) => [],
    create: async (data: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  },
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const audienceListId = searchParams.get("audienceListId");

    if (!audienceListId) {
      return NextResponse.json(
        { error: "audienceListId is required" },
        { status: 400 },
      );
    }

    const audienceList = await prisma.audienceList.findFirst({
      where: {
        id: audienceListId,
        organizationId: session.user.organizationId,
      },
    });

    if (!audienceList) {
      return NextResponse.json(
        { error: "Audience list not found" },
        { status: 404 },
      );
    }

    const segments = await prisma.segment.findMany({
      where: { audienceListId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(segments);
  } catch (error) {
    console.error("Error fetching segments:", error);
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
          details: result.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    const validatedData = result.data;

    // Verify the audience list belongs to the user's organization
    const audienceList = await prisma.audienceList.findFirst({
      where: {
        id: validatedData.audienceListId,
        organizationId: session.user.organizationId,
      },
    });

    if (!audienceList) {
      return NextResponse.json(
        { error: "Audience list not found" },
        { status: 404 },
      );
    }

    const segment = await prisma.segment.create({
      data: validatedData,
    });

    return NextResponse.json(segment, { status: 201 });
  } catch (error) {
    console.error("Error creating segment:", error);

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
