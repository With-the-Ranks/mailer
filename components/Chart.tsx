"use client";

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

interface EmailEvent {
  id: string;
  emailId: string;
  eventType: string;
  timestamp: string;
}

interface AggregatedData {
  date: string;
  opened: number;
  clicked: number;
}

export default function Chart({ emailId }: { emailId: string }) {
  const [data, setData] = useState<AggregatedData[]>([]);

  useEffect(() => {
    fetch(`/api/email-events?emailId=${emailId}`)
      .then((res) => res.json())
      .then((events: EmailEvent[]) => {
        const grouped: Record<string, AggregatedData> = {};

        events.forEach((event) => {
          const date = new Date(event.timestamp).toLocaleDateString();
          if (!grouped[date]) {
            grouped[date] = { date, opened: 0, clicked: 0 };
          }
          if (event.eventType === "opened") {
            grouped[date].opened++;
          } else if (event.eventType === "clicked") {
            grouped[date].clicked++;
          }
        });

        const result = Object.values(grouped).sort((a, b) =>
          a.date.localeCompare(b.date),
        );
        console.log(result);
        setData(result);
      });
  }, [emailId]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} width={500} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="opened"
          stroke="#8884d8"
          strokeWidth={2}
          dot={true}
        />
        <Line
          type="monotone"
          dataKey="clicked"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
