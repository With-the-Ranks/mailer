import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

// GET - List suppression entries with optional search
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);
  let offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }

  try {
    const where = search
      ? { email: { contains: search.toLowerCase() } }
      : undefined;

    const [entries, total] = await Promise.all([
      prisma.emailSuppression.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.emailSuppression.count({ where }),
    ]);

    return NextResponse.json({
      entries,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching suppression list:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppression list" },
      { status: 500 },
    );
  }
}

// POST - Add email to suppression list
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, reason = "MANUAL" } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Use upsert to handle race conditions atomically
    // If the email already exists, we return a 409 conflict
    try {
      const entry = await prisma.emailSuppression.create({
        data: {
          email: email.toLowerCase(),
          reason,
        },
      });
      return NextResponse.json(entry, { status: 201 });
    } catch (createError: unknown) {
      if (
        createError &&
        typeof createError === "object" &&
        "code" in createError &&
        createError.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Email is already in the suppression list" },
          { status: 409 },
        );
      }
      throw createError;
    }
  } catch (error) {
    console.error("Error adding to suppression list:", error);
    return NextResponse.json(
      { error: "Failed to add email to suppression list" },
      { status: 500 },
    );
  }
}

// DELETE - Remove email from suppression list
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");

  if (!id && !email) {
    return NextResponse.json(
      { error: "Either id or email is required" },
      { status: 400 },
    );
  }

  try {
    if (id) {
      await prisma.emailSuppression.delete({
        where: { id },
      });
    } else if (email) {
      await prisma.emailSuppression.delete({
        where: { email: email.toLowerCase() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    console.error("Error removing from suppression list:", error);
    return NextResponse.json(
      { error: "Failed to remove email from suppression list" },
      { status: 500 },
    );
  }
}
