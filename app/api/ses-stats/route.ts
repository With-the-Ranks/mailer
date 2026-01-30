import { NextRequest, NextResponse } from "next/server";

import { getSession, getUserOrgRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID required" },
      { status: 400 },
    );
  }

  const role = await getUserOrgRole(session.user.id, organizationId);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get all published emails for this organization
    const emails = await prisma.email.findMany({
      where: {
        organizationId,
        published: true,
      },
      select: {
        id: true,
        subject: true,
      },
    });

    if (emails.length === 0) {
      return NextResponse.json({
        stats: {
          total: 0,
          delivered: 0,
          bounced: 0,
          complained: 0,
          clicked: 0,
          opened: 0,
        },
        emailStats: [],
      });
    }

    const emailIds = emails.map((e) => e.id);

    const eventCounts = await prisma.emailEvent.groupBy({
      by: ["emailId", "eventType"],
      where: { emailId: { in: emailIds } },
      _count: { eventType: true },
    });

    // Aggregate overall stats
    const stats = {
      total: 0,
      delivered: 0,
      bounced: 0,
      complained: 0,
      clicked: 0,
      opened: 0,
    };

    // Aggregate per-email stats
    const emailStatsMap: Record<
      string,
      {
        total: number;
        delivered: number;
        bounced: number;
        complained: number;
        opened: number;
        clicked: number;
      }
    > = {};

    // Initialize email stats
    emails.forEach((email) => {
      emailStatsMap[email.id] = {
        total: 0,
        delivered: 0,
        bounced: 0,
        complained: 0,
        opened: 0,
        clicked: 0,
      };
    });

    eventCounts.forEach((item) => {
      const emailStat = emailStatsMap[item.emailId];
      const count = item._count.eventType;
      if (!emailStat) return;

      switch (item.eventType) {
        case "sent":
          stats.total += count;
          emailStat.total += count;
          break;
        case "delivered":
          stats.delivered += count;
          emailStat.delivered += count;
          break;
        case "bounced":
          stats.bounced += count;
          emailStat.bounced += count;
          break;
        case "complained":
          stats.complained += count;
          emailStat.complained += count;
          break;
        case "opened":
          stats.opened += count;
          emailStat.opened += count;
          break;
        case "clicked":
          stats.clicked += count;
          emailStat.clicked += count;
          break;
      }
    });

    // Build email stats array
    const emailStats = emails.map((email) => ({
      emailId: email.id,
      subject: email.subject || "Untitled",
      ...emailStatsMap[email.id],
    }));

    return NextResponse.json({ stats, emailStats });
  } catch (error) {
    console.error("Error fetching SES stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
