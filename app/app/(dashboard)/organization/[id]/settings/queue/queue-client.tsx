"use client";

import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

interface QueueClientProps {
  organizationId: string;
}

export default function QueueClient({ organizationId }: QueueClientProps) {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await fetch("/api/queue-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch queue stats");
      }
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const statCards = stats
    ? [
        {
          label: "Waiting",
          value: stats.waiting ?? 0,
          icon: Clock,
          color:
            "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900",
        },
        {
          label: "Active",
          value: stats.active ?? 0,
          icon: Activity,
          color:
            "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900",
        },
        {
          label: "Completed",
          value: stats.completed ?? 0,
          icon: CheckCircle,
          color:
            "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900",
        },
        {
          label: "Failed",
          value: stats.failed ?? 0,
          icon: XCircle,
          color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900",
        },
        {
          label: "Delayed",
          value: stats.delayed ?? 0,
          icon: Clock,
          color:
            "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900",
        },
        {
          label: "Paused",
          value: stats.paused ?? 0,
          icon: AlertCircle,
          color:
            "text-stone-600 bg-stone-100 dark:text-stone-400 dark:bg-[#252525]",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            Email Queue
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Monitor the status of your email sending queue
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-stone-300 dark:hover:bg-stone-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Connection Status */}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-300">
                Queue Unavailable
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                {error}. The queue may not be configured or Redis may be
                unavailable.
              </p>
            </div>
          </div>
        </div>
      ) : loading && !stats ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-stone-900 dark:text-white">
                      {(value ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-300">
                  How the email queue works
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
                  <li>
                    • <strong>Waiting:</strong> Emails ready to be sent
                  </li>
                  <li>
                    • <strong>Active:</strong> Currently being processed
                  </li>
                  <li>
                    • <strong>Completed:</strong> Successfully sent (last 24h)
                  </li>
                  <li>
                    • <strong>Failed:</strong> Failed after 3 retry attempts
                  </li>
                  <li>
                    • <strong>Delayed:</strong> Scheduled for future delivery
                  </li>
                  <li>
                    • Rate limited to 14 emails/second to comply with SES limits
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
