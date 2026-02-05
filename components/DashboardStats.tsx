"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, LayoutList, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_PRIMARY = "var(--color-chart-primary)";
const CHART_OPENED = "var(--color-chart-opened)";

interface DashboardStatsProps {
  organizationId: string;
}

interface EmailStats {
  total: number;
  delivered: number;
  bounced: number;
  complained: number;
  clicked: number;
  opened: number;
}

interface Stats {
  subscribedEmails: number;
  subscribedChange: number;
  openRate: number;
  openRateChange: number;
  conversionRate: number;
  conversionRateChange: number;
  listGrowth: Array<{ date: string; count: number }>;
  emailStats: EmailStats;
  emailTimeline: Array<{
    date: string;
    delivered: number;
    bounced: number;
    complained: number;
    clicked: number;
    opened: number;
  }>;
}

function formatChange(value: number, suffix = ""): string {
  if (value === 0) return `0${suffix}`;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1).replace(/\.0$/, "")}${suffix}`;
}

export default function DashboardStats({
  organizationId,
}: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gradientId = `colorCount-${React.useId().replace(/:/g, "")}`;

  useEffect(() => {
    const fetchStats = async () => {
      if (!organizationId) return;

      setError(null);
      try {
        const response = await fetch(
          `/api/dashboard-stats?organizationId=${encodeURIComponent(organizationId)}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-stone-500 dark:text-stone-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-lg text-red-600 dark:text-red-400">
              Failed to load dashboard stats
            </p>
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayStats = stats || {
    subscribedEmails: 0,
    subscribedChange: 0,
    openRate: 0,
    openRateChange: 0,
    conversionRate: 0,
    conversionRateChange: 0,
    listGrowth: [],
    emailStats: {
      total: 0,
      delivered: 0,
      bounced: 0,
      complained: 0,
      clicked: 0,
      opened: 0,
    },
    emailTimeline: [],
  };

  const emailStatCards = [
    { label: "total", value: displayStats.emailStats.total },
    { label: "delivered", value: displayStats.emailStats.delivered },
    { label: "bounced", value: displayStats.emailStats.bounced },
    { label: "complained", value: displayStats.emailStats.complained },
    { label: "clicked", value: displayStats.emailStats.clicked },
    { label: "opened", value: displayStats.emailStats.opened },
  ];

  return (
    <div className="space-y-8">
      {/* Performance Section */}
      <section>
        <div className="mb-6 flex flex-nowrap items-center justify-between gap-3">
          <h1 className="min-w-0 shrink text-xl font-bold text-stone-900 sm:text-2xl md:text-3xl dark:text-white">
            Performance
          </h1>
          <Link
            href={`/organization/${organizationId}/analytics`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            View Reports
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </Link>
        </div>

        {/* Email Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {emailStatCards.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-[#D3D3D3] bg-white p-4 dark:border-[#D3D3D3] dark:bg-[#2D2D2D]"
            >
              <p className="text-xs font-bold text-black sm:text-sm dark:text-white">
                {label}
              </p>
              <p className="mt-1 text-2xl font-black text-blue-700 sm:text-3xl lg:text-4xl dark:text-blue-400">
                {value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Email Timeline Chart */}
        <div className="rounded-lg border border-[#D3D3D3] bg-white p-4 dark:border-[#D3D3D3] dark:bg-[#2D2D2D]">
          <p className="mb-4 text-xs font-medium text-stone-500 sm:text-sm dark:text-stone-400">
            Email Events (Last 7 Days)
          </p>
          <div className="h-64">
            {displayStats.emailTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayStats.emailTimeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="delivered"
                    fill="#22c55e"
                    name="Delivered"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="opened"
                    fill={CHART_OPENED}
                    name="Opened"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="clicked"
                    fill="#3b82f6"
                    name="Clicked"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-stone-400">No email data yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* People Section */}
      <section>
        <div className="mb-6 flex flex-nowrap items-center justify-between gap-3">
          <h1 className="min-w-0 shrink text-xl font-bold text-stone-900 sm:text-2xl md:text-3xl dark:text-white">
            People
          </h1>
          <Link
            href={`/organization/${organizationId}/audience`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            Go to People
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </Link>
        </div>

        {/* People Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#D3D3D3] bg-white p-4 dark:border-[#D3D3D3] dark:bg-[#2D2D2D]">
            <p className="text-xs font-bold text-black sm:text-sm dark:text-white">
              Subscribed Emails
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-black text-blue-700 sm:text-3xl lg:text-4xl dark:text-blue-400">
                {displayStats.subscribedEmails.toLocaleString()}
              </span>
              <span className="text-right text-sm font-normal text-black dark:text-white">
                {formatChange(displayStats.subscribedChange)} this week
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[#D3D3D3] bg-white p-4 dark:border-[#D3D3D3] dark:bg-[#2D2D2D]">
            <p className="text-xs font-bold text-black sm:text-sm dark:text-white">
              Open Rate
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-black text-blue-700 sm:text-3xl lg:text-4xl dark:text-blue-400">
                {displayStats.openRate.toFixed(1)}%
              </span>
              <span className="text-right text-sm font-normal text-black dark:text-white">
                {formatChange(displayStats.openRateChange, "%")}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[#D3D3D3] bg-white p-4 dark:border-[#D3D3D3] dark:bg-[#2D2D2D]">
            <p className="text-xs font-bold text-black sm:text-sm dark:text-white">
              Conversion Rate
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-black text-blue-700 sm:text-3xl lg:text-4xl dark:text-blue-400">
                {displayStats.conversionRate.toFixed(0)}%
              </span>
              <span className="text-right text-sm font-normal text-black dark:text-white">
                {formatChange(displayStats.conversionRateChange, "%")}
              </span>
            </div>
          </div>
        </div>

        {/* List Growth Chart */}
        <div className="rounded-lg border border-[#D3D3D3] bg-white p-4 dark:border-[#D3D3D3] dark:bg-[#2D2D2D]">
          <p className="mb-4 text-xs font-medium text-stone-500 sm:text-sm dark:text-stone-400">
            List Growth Over Time
          </p>
          <div className="h-48">
            {displayStats.listGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayStats.listGrowth}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={CHART_PRIMARY}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_PRIMARY}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={CHART_PRIMARY}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-stone-400">No data yet</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
