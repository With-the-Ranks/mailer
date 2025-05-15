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
  eventType: string;
  timestamp: string;
}

interface AggregatedData {
  date: string;
  delivered: number;
  opened: number;
  clicked: number;
}

export default function Chart({ emailId }: { emailId: string }) {
  const [data, setData] = useState<AggregatedData[]>([]);
  const [noData, setNoData] = useState(true);

  useEffect(() => {
    fetch(`/api/email-events?emailId=${emailId}`)
      .then((res) => res.json())
      .then((events: EmailEvent[]) => {
        const grouped: Record<string, AggregatedData> = {};

        events.forEach(({ eventType, timestamp }) => {
          const date = new Date(timestamp).toLocaleDateString();
          if (!grouped[date]) {
            grouped[date] = { date, delivered: 0, opened: 0, clicked: 0 };
          }
          if (eventType === "delivered") {
            grouped[date].delivered++;
            setNoData(false);
          } else if (eventType === "opened") {
            grouped[date].opened++;
            setNoData(false);
          } else if (eventType === "clicked") {
            grouped[date].clicked++;
            setNoData(false);
          }
        });

        const result = Object.values(grouped).sort((a, b) =>
          a.date.localeCompare(b.date),
        );
        setData(result);
      });
  }, [emailId]);

  if (noData) {
    return <div>✨ Data will appear here shortly ✨</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="delivered"
          name="Delivered"
          stroke="#252753"
          strokeWidth={2}
          dot
        />
        <Line
          type="monotone"
          dataKey="opened"
          name="Opened"
          stroke="#8884d8"
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
      </LineChart>
    </ResponsiveContainer>
  );
}
