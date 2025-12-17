import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one contact ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = bulkDeleteSchema.safeParse(body);

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

    const { ids } = result.data;
    // 1. Fetch the contacts and their AudienceList's org
    const contacts = await prisma.audience.findMany({
      where: { id: { in: ids } },
      select: { id: true, audienceListId: true },
    });

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: "No contacts found", debug: { ids } },
        { status: 404 },
      );
    }

    // 2. Get all related audience lists and make sure they're all owned by the org
    const audienceListIds = Array.from(
      new Set(contacts.map((c) => c.audienceListId)),
    );
    const lists = await prisma.audienceList.findMany({
      where: {
        id: { in: audienceListIds },
        organizationId: session.user.organizationId,
      },
      select: { id: true },
    });

    if (lists.length !== audienceListIds.length) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deleteResult = await prisma.audience.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    logError("Error bulk deleting contacts", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete contacts" },
      { status: 500 },
    );
  }
}
