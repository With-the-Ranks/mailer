import { NextRequest, NextResponse } from "next/server";

import { getSession, getUserOrgRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Format date as ISO YYYY-MM-DD
function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Format date for display
function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

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
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get audience lists for this organization
    const audienceLists = await prisma.audienceList.findMany({
      where: { organizationId },
      select: { id: true },
    });
    const listIds = audienceLists.map((l) => l.id);

    // Current subscribed count
    const subscribedEmails = await prisma.audience.count({
      where: {
        audienceListId: { in: listIds },
        isUnsubscribed: false,
      },
    });

    // Subscribed count one week ago (approximate by subtracting new signups)
    const newSignupsThisWeek = await prisma.audience.count({
      where: {
        audienceListId: { in: listIds },
        isUnsubscribed: false,
        createdAt: { gte: oneWeekAgo },
      },
    });
    const subscribedChange = newSignupsThisWeek;

    // Get email events for open rate calculation
    const emails = await prisma.email.findMany({
      where: {
        organizationId,
        published: true,
      },
      select: { id: true },
    });
    const emailIds = emails.map((e) => e.id);

    // Current period stats (last 7 days)
    const [currentSent, currentOpened] = await Promise.all([
      prisma.emailEvent.count({
        where: {
          emailId: { in: emailIds },
          eventType: "sent",
          timestamp: { gte: oneWeekAgo },
        },
      }),
      prisma.emailEvent.count({
        where: {
          emailId: { in: emailIds },
          eventType: "opened",
          timestamp: { gte: oneWeekAgo },
        },
      }),
    ]);

    // Previous period stats (7-14 days ago)
    const [prevSent, prevOpened] = await Promise.all([
      prisma.emailEvent.count({
        where: {
          emailId: { in: emailIds },
          eventType: "sent",
          timestamp: { gte: twoWeeksAgo, lt: oneWeekAgo },
        },
      }),
      prisma.emailEvent.count({
        where: {
          emailId: { in: emailIds },
          eventType: "opened",
          timestamp: { gte: twoWeeksAgo, lt: oneWeekAgo },
        },
      }),
    ]);

    const currentOpenRate =
      currentSent > 0 ? (currentOpened / currentSent) * 100 : 0;
    const prevOpenRate = prevSent > 0 ? (prevOpened / prevSent) * 100 : 0;
    const openRateChange = currentOpenRate - prevOpenRate;

    // Conversion rate (clicked / opened)
    const [currentClicked, prevClicked] = await Promise.all([
      prisma.emailEvent.count({
        where: {
          emailId: { in: emailIds },
          eventType: "clicked",
          timestamp: { gte: oneWeekAgo },
        },
      }),
      prisma.emailEvent.count({
        where: {
          emailId: { in: emailIds },
          eventType: "clicked",
          timestamp: { gte: twoWeeksAgo, lt: oneWeekAgo },
        },
      }),
    ]);

    const currentConversionRate =
      currentOpened > 0 ? (currentClicked / currentOpened) * 100 : 0;
    const prevConversionRate =
      prevOpened > 0 ? (prevClicked / prevOpened) * 100 : 0;
    const conversionRateChange = currentConversionRate - prevConversionRate;

    // List growth over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const audienceGrowth = await prisma.audience.findMany({
      where: {
        audienceListId: { in: listIds },
        isUnsubscribed: false,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by date and calculate cumulative count using ISO date keys for deterministic matching
    const baseCount = subscribedEmails - audienceGrowth.length;
    const growthByDate: Record<
      string,
      { isoKey: string; displayDate: string; count: number }
    > = {};

    // Initialize with ISO date keys (deterministic)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isoKey = formatDateKey(date);
      const displayDate = formatDateDisplay(date);
      growthByDate[isoKey] = { isoKey, displayDate, count: 0 };
    }

    // Count signups per day using ISO date keys
    audienceGrowth.forEach((a) => {
      const isoKey = formatDateKey(a.createdAt);
      if (growthByDate[isoKey] !== undefined) {
        growthByDate[isoKey].count++;
      }
    });

    // Convert to cumulative with display-friendly dates
    let cumulative = baseCount;
    const listGrowth = Object.values(growthByDate).map(
      ({ displayDate, count }) => {
        cumulative += count;
        return { date: displayDate, count: cumulative };
      },
    );

    // Email stats - all time totals
    const emailStatsResults = await prisma.emailEvent.groupBy({
      by: ["eventType"],
      where: { emailId: { in: emailIds } },
      _count: true,
    });

    const emailStats = {
      total: 0,
      delivered: 0,
      bounced: 0,
      complained: 0,
      clicked: 0,
      opened: 0,
    };

    emailStatsResults.forEach((result) => {
      switch (result.eventType) {
        case "sent":
          emailStats.total = result._count;
          break;
        case "delivered":
          emailStats.delivered = result._count;
          break;
        case "bounced":
          emailStats.bounced = result._count;
          break;
        case "complained":
          emailStats.complained = result._count;
          break;
        case "clicked":
          emailStats.clicked = result._count;
          break;
        case "opened":
          emailStats.opened = result._count;
          break;
      }
    });

    // Email timeline for last 7 days
    const emailEvents = await prisma.emailEvent.findMany({
      where: {
        emailId: { in: emailIds },
        timestamp: { gte: oneWeekAgo },
      },
      select: {
        eventType: true,
        timestamp: true,
      },
    });

    // Initialize timeline with ISO date keys (deterministic, timezone-agnostic)
    const timelineByDate: Record<
      string,
      {
        isoKey: string;
        displayDate: string;
        delivered: number;
        bounced: number;
        complained: number;
        clicked: number;
        opened: number;
      }
    > = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isoKey = formatDateKey(date);
      const displayDate = formatDateDisplay(date);
      timelineByDate[isoKey] = {
        isoKey,
        displayDate,
        delivered: 0,
        bounced: 0,
        complained: 0,
        clicked: 0,
        opened: 0,
      };
    }

    // Aggregate events by date using ISO keys
    emailEvents.forEach((event) => {
      const isoKey = formatDateKey(event.timestamp);
      const dayData = timelineByDate[isoKey];
      if (dayData) {
        switch (event.eventType) {
          case "delivered":
            dayData.delivered++;
            break;
          case "bounced":
            dayData.bounced++;
            break;
          case "complained":
            dayData.complained++;
            break;
          case "clicked":
            dayData.clicked++;
            break;
          case "opened":
            dayData.opened++;
            break;
        }
      }
    });

    // Convert to display format
    const emailTimeline = Object.values(timelineByDate).map(
      ({ displayDate, delivered, bounced, complained, clicked, opened }) => ({
        date: displayDate,
        delivered,
        bounced,
        complained,
        clicked,
        opened,
      }),
    );

    return NextResponse.json({
      subscribedEmails,
      subscribedChange,
      openRate: currentOpenRate,
      openRateChange,
      conversionRate: currentConversionRate,
      conversionRateChange,
      listGrowth,
      emailStats,
      emailTimeline,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
