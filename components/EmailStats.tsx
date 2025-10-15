"use client";

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
  userId?: string;
  organizationId?: string;
}

export default function EmailStats({
  userId,
  organizationId,
}: EmailStatsProps) {
  const [data, setData] = useState<EmailStat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = organizationId
          ? `organizationId=${organizationId}`
          : userId
            ? `userId=${userId}`
            : "";
        if (!params) return;

        const response = await fetch(`/api/email-stats?${params}`);
        const stats = await response.json();
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch email stats:", error);
      }
    };

    fetchData();
  }, [userId, organizationId]);

  if (data.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col space-y-6">
      <h1 className="font-cal text-3xl font-bold dark:text-white">
        Email Analytics
      </h1>
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
  );
}
