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
  userId: string;
}

export default function EmailStats({ userId }: EmailStatsProps) {
  const [data, setData] = useState<EmailStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/email-stats?userId=${userId}`)
      .then((res) => res.json())
      .then((stats) => {
        setData(stats);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading chart...</p>;

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" interval={0} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="sent"
            fill="#8884d8"
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
  );
}
