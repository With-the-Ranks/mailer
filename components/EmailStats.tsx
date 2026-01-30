"use client";

import { useTheme } from "next-themes";

import { EmptyState } from "@/components/empty-state";
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

type EmailStat = {
  emailId: string;
  subject: string;
  sent: number;
  opened: number;
  clicked: number;
};

interface EmailStatsProps {
  organizationId: string;
}

export default function EmailStats({ organizationId }: EmailStatsProps) {
  const [data, setData] = useState<EmailStat[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!organizationId) return;
        setLoading(true);
        const response = await fetch(
          `/api/email-stats?organizationId=${organizationId}`,
        );
        const stats = await response.json();
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch email stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

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

  if (data.length === 0) {
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
  return (
    <div className="flex w-full min-w-0 flex-col space-y-12">
      <div className="flex min-w-0 flex-col space-y-6">
        <h1 className="text-3xl font-bold dark:text-white">Reports</h1>
        <div className="h-[400px] w-full rounded-lg border border-gray-200 bg-white py-6 shadow-sm dark:border-gray-700 dark:bg-[#2D2D2D]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
                dataKey="sent"
                fill={isDark ? "#3b82f6" : "#1d4ed8"}
                name="Sent"
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
                fill="#ffc658"
                name="Clicked"
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
