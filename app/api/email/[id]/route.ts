import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = await prisma.email.findUnique({
    where: { id: decodeURIComponent(id) },
    select: { published: true },
  });

  if (!email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(email);
}
