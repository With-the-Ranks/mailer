import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - List suppression entries with optional search
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

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

    // Check if already exists
    const existing = await prisma.emailSuppression.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email is already in the suppression list" },
        { status: 409 },
      );
    }

    const entry = await prisma.emailSuppression.create({
      data: {
        email: email.toLowerCase(),
        reason,
      },
    });

    return NextResponse.json(entry, { status: 201 });
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
  } catch (error) {
    console.error("Error removing from suppression list:", error);
    return NextResponse.json(
      { error: "Failed to remove email from suppression list" },
      { status: 500 },
    );
  }
}
