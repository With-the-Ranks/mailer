import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getCurrentOnboardingState } from "@/lib/onboarding-state";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getCurrentOnboardingState(session.user.id);
  return NextResponse.json(state);
}
