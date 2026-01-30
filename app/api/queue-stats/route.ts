import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Try to import queue stats dynamically
    // This allows the app to work even if Redis is not configured
    const { getQueueStats } = await import("@/lib/queue");
    const stats = await getQueueStats();

    if (!stats) {
      return NextResponse.json(
        { error: "Queue not available" },
        { status: 503 },
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching queue stats:", error);

    // Return a meaningful error if Redis/queue is not configured
    if (
      error instanceof Error &&
      (error.message.includes("REDIS_URL") ||
        error.message.includes("Redis") ||
        error.message.includes("connect"))
    ) {
      return NextResponse.json(
        {
          error: "Redis not configured. Set REDIS_URL environment variable.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch queue stats" },
      { status: 500 },
    );
  }
}
