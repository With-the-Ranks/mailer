"use client";

import Image from "next/image";
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
          <div className="flex flex-col items-center justify-center py-20">
            <Image
              alt="No reports data"
              src="/empty-state.png"
              width={400}
              height={400}
            />
            <p className="mt-6 text-xl font-semibold text-stone-700 dark:text-stone-200">
              No email analytics yet
            </p>
            <p className="mt-2 text-lg text-stone-500 dark:text-stone-400">
              Send your first email to start seeing analytics and reports.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full min-w-0 flex-col space-y-12">
      <div className="flex min-w-0 flex-col space-y-6">
        <h1 className="text-3xl font-bold dark:text-white">Reports</h1>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="subject"
                interval={0}
                angle={-20}
                textAnchor="end"
                height={120}
                dy={10}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="sent"
                fill="#252753"
                name="Sent"
                isAnimationActive={true}
              />
              <Bar
                dataKey="opened"
                fill="#82ca9d"
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
