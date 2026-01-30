"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SesStats {
  total: number;
  delivered: number;
  bounced: number;
  complained: number;
  clicked: number;
  opened: number;
}

interface AggregatedData {
  date: string;
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

interface SesEmailStatsProps {
  emailId: string;
}

export default function SesEmailStats({ emailId }: SesEmailStatsProps) {
  const [stats, setStats] = useState<SesStats>({
    total: 0,
    delivered: 0,
    bounced: 0,
    complained: 0,
    clicked: 0,
    opened: 0,
  });
  const [chartData, setChartData] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/email-events?emailId=${emailId}`);
        const events = await response.json();

        // Aggregate stats
        const newStats: SesStats = {
          total: 0,
          delivered: 0,
          bounced: 0,
          complained: 0,
          clicked: 0,
          opened: 0,
        };

        const grouped: Record<string, AggregatedData> = {};

        events.forEach(
          (event: {
            eventType: string;
            timestamp: string;
            emailTo: string;
          }) => {
            const date = new Date(event.timestamp).toLocaleDateString();
            if (!grouped[date]) {
              grouped[date] = {
                date,
                delivered: 0,
                bounced: 0,
                complained: 0,
                opened: 0,
                clicked: 0,
              };
            }

            switch (event.eventType) {
              case "sent":
                newStats.total++;
                break;
              case "delivered":
                newStats.delivered++;
                grouped[date].delivered++;
                break;
              case "bounced":
                newStats.bounced++;
                grouped[date].bounced++;
                break;
              case "complained":
                newStats.complained++;
                grouped[date].complained++;
                break;
              case "opened":
                newStats.opened++;
                grouped[date].opened++;
                break;
              case "clicked":
                newStats.clicked++;
                grouped[date].clicked++;
                break;
            }
          },
        );

        setStats(newStats);
        setChartData(
          Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)),
        );
      } catch (error) {
        console.error("Failed to fetch SES email stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [emailId]);

  const bounceRate = stats.total > 0 ? (stats.bounced / stats.total) * 100 : 0;
  const complaintRate =
    stats.total > 0 ? (stats.complained / stats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Loading analytics...
        </p>
      </div>
    );
  }

  const statCards = [
    { label: "Total", value: stats.total },
    { label: "Delivered", value: stats.delivered },
    { label: "Bounced", value: stats.bounced },
    { label: "Complained", value: stats.complained },
    { label: "Clicked", value: stats.clicked },
    { label: "Opened", value: stats.opened },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]"
          >
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {label.toLowerCase()}
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

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
          <h3 className="mb-4 text-lg font-medium dark:text-white">
            Events Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#e5e7eb"}
              />
              <XAxis
                dataKey="date"
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
              <Line
                type="monotone"
                dataKey="delivered"
                name="Delivered"
                stroke="#10b981"
                strokeWidth={2}
                dot
              />
              <Line
                type="monotone"
                dataKey="opened"
                name="Opened"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot
              />
              <Line
                type="monotone"
                dataKey="clicked"
                name="Clicked"
                stroke="#82ca9d"
                strokeWidth={2}
                dot
              />
              <Line
                type="monotone"
                dataKey="bounced"
                name="Bounced"
                stroke="#ef4444"
                strokeWidth={2}
                dot
              />
              <Line
                type="monotone"
                dataKey="complained"
                name="Complained"
                stroke="#f97316"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
