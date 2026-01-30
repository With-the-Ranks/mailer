import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
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

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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

    // New signups this week
    const newSignupsThisWeek = await prisma.audience.count({
      where: {
        audienceListId: { in: listIds },
        isUnsubscribed: false,
        createdAt: { gte: oneWeekAgo },
      },
    });

    // Get emails for this organization
    const emails = await prisma.email.findMany({
      where: {
        organizationId,
        published: true,
      },
      select: {
        id: true,
        subject: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    const emailIds = emails.map((e) => e.id);

    // Get all events for calculations
    const allEvents = await prisma.emailEvent.groupBy({
      by: ["emailId", "eventType"],
      where: { emailId: { in: emailIds } },
      _count: true,
    });

    // Calculate totals
    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalBounced = 0;
    let totalUnsubscribed = 0;

    const emailStatsMap: Record<
      string,
      {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
      }
    > = {};

    emailIds.forEach((id) => {
      emailStatsMap[id] = {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
      };
    });

    allEvents.forEach((event) => {
      const count = event._count;
      const stats = emailStatsMap[event.emailId];

      switch (event.eventType) {
        case "sent":
          totalSent += count;
          if (stats) stats.sent = count;
          break;
        case "delivered":
          totalDelivered += count;
          if (stats) stats.delivered = count;
          break;
        case "opened":
          totalOpened += count;
          if (stats) stats.opened = count;
          break;
        case "clicked":
          totalClicked += count;
          if (stats) stats.clicked = count;
          break;
        case "bounced":
          totalBounced += count;
          if (stats) stats.bounced = count;
          break;
        case "unsubscribed":
          totalUnsubscribed += count;
          break;
      }
    });

    // Current period stats (last 7 days)
    const currentPeriodEvents = await prisma.emailEvent.groupBy({
      by: ["eventType"],
      where: {
        emailId: { in: emailIds },
        timestamp: { gte: oneWeekAgo },
      },
      _count: true,
    });

    let currentSent = 0;
    let currentOpened = 0;
    let currentClicked = 0;
    let currentBounced = 0;
    let currentUnsubscribed = 0;

    currentPeriodEvents.forEach((e) => {
      switch (e.eventType) {
        case "sent":
          currentSent = e._count;
          break;
        case "opened":
          currentOpened = e._count;
          break;
        case "clicked":
          currentClicked = e._count;
          break;
        case "bounced":
          currentBounced = e._count;
          break;
        case "unsubscribed":
          currentUnsubscribed = e._count;
          break;
      }
    });

    // Previous period stats
    const prevPeriodEvents = await prisma.emailEvent.groupBy({
      by: ["eventType"],
      where: {
        emailId: { in: emailIds },
        timestamp: { gte: twoWeeksAgo, lt: oneWeekAgo },
      },
      _count: true,
    });

    let prevSent = 0;
    let prevOpened = 0;
    let prevClicked = 0;
    let prevBounced = 0;
    let prevUnsubscribed = 0;

    prevPeriodEvents.forEach((e) => {
      switch (e.eventType) {
        case "sent":
          prevSent = e._count;
          break;
        case "opened":
          prevOpened = e._count;
          break;
        case "clicked":
          prevClicked = e._count;
          break;
        case "bounced":
          prevBounced = e._count;
          break;
        case "unsubscribed":
          prevUnsubscribed = e._count;
          break;
      }
    });

    // Calculate rates
    const currentOpenRate =
      currentSent > 0 ? (currentOpened / currentSent) * 100 : 0;
    const prevOpenRate = prevSent > 0 ? (prevOpened / prevSent) * 100 : 0;

    const currentClickRate =
      currentSent > 0 ? (currentClicked / currentSent) * 100 : 0;
    const prevClickRate = prevSent > 0 ? (prevClicked / prevSent) * 100 : 0;

    const currentBounceRate =
      currentSent > 0 ? (currentBounced / currentSent) * 100 : 0;
    const prevBounceRate = prevSent > 0 ? (prevBounced / prevSent) * 100 : 0;

    const currentUnsubRate =
      currentSent > 0 ? (currentUnsubscribed / currentSent) * 100 : 0;
    const prevUnsubRate =
      prevSent > 0 ? (prevUnsubscribed / prevSent) * 100 : 0;

    const currentConversionRate =
      currentOpened > 0 ? (currentClicked / currentOpened) * 100 : 0;
    const prevConversionRate =
      prevOpened > 0 ? (prevClicked / prevOpened) * 100 : 0;

    // List growth over time
    const audienceGrowth = await prisma.audience.findMany({
      where: {
        audienceListId: { in: listIds },
        isUnsubscribed: false,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const baseCount = subscribedEmails - audienceGrowth.length;
    const growthByDate: Record<string, number> = {};

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      growthByDate[dateStr] = 0;
    }

    audienceGrowth.forEach((a) => {
      const dateStr = a.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (growthByDate[dateStr] !== undefined) {
        growthByDate[dateStr]++;
      }
    });

    let cumulative = baseCount;
    const listGrowth = Object.entries(growthByDate).map(([date, count]) => {
      cumulative += count;
      return { date, count: cumulative };
    });

    // Campaign stats
    const campaigns = emails.slice(0, 10).map((email) => ({
      id: email.id,
      subject: email.subject || "Untitled",
      sent: emailStatsMap[email.id]?.sent || 0,
      delivered: emailStatsMap[email.id]?.delivered || 0,
      opened: emailStatsMap[email.id]?.opened || 0,
      clicked: emailStatsMap[email.id]?.clicked || 0,
      bounced: emailStatsMap[email.id]?.bounced || 0,
      sentAt: email.updatedAt.toISOString(),
    }));

    // Signup forms stats - only active forms
    const signupForms = await prisma.signupForm.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: { submissions: true },
        },
      },
    });

    const signupFormsStats = signupForms.map((form) => ({
      id: form.id,
      name: form.name || "Unnamed Form",
      views: 0, // Would need a views tracking feature
      submissions: form._count.submissions,
      conversionRate: 0, // Would need views to calculate
    }));

    // Deliverability data
    const deliverabilityData = [
      { name: "Delivered", value: totalDelivered, color: "#22c55e" },
      { name: "Opened", value: totalOpened, color: "#1d4ed8" }, // blue-700
      { name: "Clicked", value: totalClicked, color: "#3b82f6" },
      { name: "Bounced", value: totalBounced, color: "#ef4444" },
    ].filter((d) => d.value > 0);

    // Email stats totals
    const emailStats = {
      total: totalSent,
      delivered: totalDelivered,
      bounced: totalBounced,
      complained: 0, // Calculate from events
      clicked: totalClicked,
      opened: totalOpened,
    };

    // Get complained count
    const complainedCount = await prisma.emailEvent.count({
      where: {
        emailId: { in: emailIds },
        eventType: "complained",
      },
    });
    emailStats.complained = complainedCount;

    // Email timeline - 7 days
    const emailEvents7 = await prisma.emailEvent.findMany({
      where: {
        emailId: { in: emailIds },
        timestamp: { gte: oneWeekAgo },
      },
      select: {
        eventType: true,
        timestamp: true,
      },
    });

    // Initialize 7-day timeline
    const timeline7ByDate: Record<
      string,
      {
        date: string;
        delivered: number;
        bounced: number;
        complained: number;
        clicked: number;
        opened: number;
      }
    > = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      timeline7ByDate[dateStr] = {
        date: dateStr,
        delivered: 0,
        bounced: 0,
        complained: 0,
        clicked: 0,
        opened: 0,
      };
    }

    emailEvents7.forEach((event) => {
      const dateStr = event.timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dayData = timeline7ByDate[dateStr];
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

    const emailTimeline7 = Object.values(timeline7ByDate);

    // Email timeline - 30 days
    const emailEvents30 = await prisma.emailEvent.findMany({
      where: {
        emailId: { in: emailIds },
        timestamp: { gte: thirtyDaysAgo },
      },
      select: {
        eventType: true,
        timestamp: true,
      },
    });

    // Initialize 30-day timeline
    const timeline30ByDate: Record<
      string,
      {
        date: string;
        delivered: number;
        bounced: number;
        complained: number;
        clicked: number;
        opened: number;
      }
    > = {};

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      timeline30ByDate[dateStr] = {
        date: dateStr,
        delivered: 0,
        bounced: 0,
        complained: 0,
        clicked: 0,
        opened: 0,
      };
    }

    emailEvents30.forEach((event) => {
      const dateStr = event.timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dayData = timeline30ByDate[dateStr];
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

    const emailTimeline30 = Object.values(timeline30ByDate);

    // Get domains for filter
    const domains = await prisma.emailDomain.findMany({
      where: { organizationId },
      select: {
        id: true,
        domain: true,
      },
    });

    return NextResponse.json({
      overview: {
        subscribedEmails,
        subscribedChange: newSignupsThisWeek,
        openRate: currentOpenRate,
        openRateChange: currentOpenRate - prevOpenRate,
        conversionRate: currentConversionRate,
        conversionRateChange: currentConversionRate - prevConversionRate,
        clickRate: currentClickRate,
        clickRateChange: currentClickRate - prevClickRate,
        bounceRate: currentBounceRate,
        bounceRateChange: currentBounceRate - prevBounceRate,
        unsubscribeRate: currentUnsubRate,
        unsubscribeRateChange: currentUnsubRate - prevUnsubRate,
        listGrowth,
      },
      campaigns,
      signupForms: signupFormsStats,
      deliverabilityData,
      emailStats,
      emailTimeline7,
      emailTimeline30,
      domains,
    });
  } catch (error) {
    console.error("Error fetching analytics details:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
