import { NextResponse } from "next/server";

import { getQueueStats, startEmailWorker } from "@/lib/queue";

const CRON_WAIT_MS = 15_000;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function runCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (
    cronSecret &&
    request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.REDIS_URL) {
    return NextResponse.json(
      { error: "REDIS_URL environment variable is not set" },
      { status: 503 },
    );
  }

  try {
    startEmailWorker();

    await new Promise((resolve) => {
      setTimeout(resolve, CRON_WAIT_MS);
    });

    const stats = await getQueueStats();

    return NextResponse.json(
      { ok: true, waitedMs: CRON_WAIT_MS, stats },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error running email queue cron:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to run email queue",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return runCron(request);
}
