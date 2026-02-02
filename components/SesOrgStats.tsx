"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/empty-state";

interface OrgStats {
  total: number;
  delivered: number;
  bounced: number;
  complained: number;
  clicked: number;
  opened: number;
}

interface EmailStat {
  emailId: string;
  subject: string;
  total: number;
  delivered: number;
  bounced: number;
  complained: number;
  opened: number;
  clicked: number;
}

interface RateGaugeProps {
  label: string;
  rate: number;
  threshold: number;
  maxDisplay: number;
}

function RateGauge({ label, rate, threshold, maxDisplay }: RateGaugeProps) {
  const isHealthy = rate < threshold;
  const percentage = Math.min((rate / maxDisplay) * 100, 100);

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold dark:text-white">
          {rate.toFixed(2)}%
        </span>
        <span
          className={`text-sm font-medium ${
            isHealthy
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isHealthy ? "healthy" : "warning"}
        </span>
      </div>
      <div className="mt-3">
        <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-[#252525]">
          <div
            className={`absolute top-0 left-0 h-2 rounded-full transition-all ${
              isHealthy ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
          {/* Threshold marker */}
          <div
            className="absolute top-0 h-2 w-0.5 bg-gray-400 dark:bg-stone-500"
            style={{ left: `${(threshold / maxDisplay) * 100}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>{threshold}%</span>
          <span>{maxDisplay}%</span>
        </div>
      </div>
    </div>
  );
}

interface SesOrgStatsProps {
  organizationId: string;
}

export default function SesOrgStats({ organizationId }: SesOrgStatsProps) {
  const [stats, setStats] = useState<OrgStats>({
    total: 0,
    delivered: 0,
    bounced: 0,
    complained: 0,
    clicked: 0,
    opened: 0,
  });
  const [emailStats, setEmailStats] = useState<EmailStat[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === "dark";

  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/ses-stats?organizationId=${encodeURIComponent(organizationId)}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        const data = await response.json();

        if (data.stats && typeof data.stats === "object") {
          setStats(data.stats);
        }
        if (Array.isArray(data.emailStats)) {
          setEmailStats(data.emailStats);
        }
      } catch (error) {
        console.error("Failed to fetch SES org stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  const bounceRate = stats.total > 0 ? (stats.bounced / stats.total) * 100 : 0;
  const complaintRate =
    stats.total > 0 ? (stats.complained / stats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="flex w-full min-w-0 flex-col space-y-12">
        <div className="flex min-w-0 flex-col space-y-6">
          <h1 className="text-3xl font-bold dark:text-white">Reports</h1>
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-stone-500 dark:text-stone-400">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div className="flex w-full min-w-0 flex-col space-y-12">
        <div className="flex min-w-0 flex-col space-y-6">
          <h1 className="text-3xl font-bold dark:text-white">Reports</h1>
          <div className="flex flex-col items-center justify-center space-y-6 py-20">
            <EmptyState
              icon="chart-line"
              message="Send your first email to start seeing analytics and reports."
            />
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "total", value: stats.total },
    { label: "delivered", value: stats.delivered },
    { label: "bounced", value: stats.bounced },
    { label: "complained", value: stats.complained },
    { label: "clicked", value: stats.clicked },
    { label: "opened", value: stats.opened },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col space-y-12">
      <div className="flex min-w-0 flex-col space-y-6">
        <h1 className="text-3xl font-bold dark:text-white">Reports</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]"
            >
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {label}
              </span>
              <span className="mt-1 text-2xl font-semibold dark:text-white">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Rate Gauges */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RateGauge
            label="Bounce Rate"
            rate={bounceRate}
            threshold={5}
            maxDisplay={15}
          />
          <RateGauge
            label="Complaint Rate"
            rate={complaintRate}
            threshold={0.1}
            maxDisplay={1}
          />
        </div>

        {/* Email Stats Chart */}
        {emailStats.length > 0 && (
          <div className="h-[400px] w-full rounded-lg border border-gray-200 bg-white py-6 shadow-sm dark:border-gray-700 dark:bg-[#2D2D2D]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={emailStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="subject"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={120}
                  dy={10}
                  stroke={isDark ? "#9ca3af" : "#6b7280"}
                  tick={{ fill: isDark ? "#ffffff" : "#6b7280" }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke={isDark ? "#9ca3af" : "#6b7280"}
                  tick={{ fill: isDark ? "#ffffff" : "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#2D2D2D" : "white",
                    border: isDark ? "1px solid #4b5563" : "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: isDark ? "#ffffff" : "#1f2937",
                  }}
                />
                <Legend
                  wrapperStyle={{ color: isDark ? "#ffffff" : "#6b7280" }}
                />
                <Bar
                  dataKey="delivered"
                  fill="#10b981"
                  name="Delivered"
                  isAnimationActive={true}
                />
                <Bar
                  dataKey="opened"
                  fill="#8b5cf6"
                  name="Opened"
                  isAnimationActive={true}
                />
                <Bar
                  dataKey="clicked"
                  fill="#82ca9d"
                  name="Clicked"
                  isAnimationActive={true}
                />
                <Bar
                  dataKey="bounced"
                  fill="#ef4444"
                  name="Bounced"
                  isAnimationActive={true}
                />
                <Bar
                  dataKey="complained"
                  fill="#f97316"
                  name="Complained"
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
