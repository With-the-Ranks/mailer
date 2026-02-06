"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, LayoutList } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_PRIMARY = "var(--color-chart-primary)";
const CHART_OPENED = "var(--color-chart-opened)";

interface AnalyticsDetailsProps {
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

interface TimelineData {
  date: string;
  delivered: number;
  bounced: number;
  complained: number;
  clicked: number;
  opened: number;
}

interface OverviewStats {
  subscribedEmails: number;
  subscribedChange: number;
  openRate: number;
  openRateChange: number;
  conversionRate: number;
  conversionRateChange: number;
  clickRate: number;
  clickRateChange: number;
  bounceRate: number;
  bounceRateChange: number;
  unsubscribeRate: number;
  unsubscribeRateChange: number;
  listGrowth: Array<{ date: string; count: number }>;
}

interface CampaignStats {
  id: string;
  subject: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  sentAt: string;
}

interface SignupFormStats {
  id: string;
  name: string;
  views: number;
  submissions: number;
  conversionRate: number;
}

interface DomainOption {
  id: string;
  domain: string;
}

interface FullAnalytics {
  overview: OverviewStats;
  campaigns: CampaignStats[];
  signupForms: SignupFormStats[];
  deliverabilityData: Array<{ name: string; value: number; color: string }>;
  emailStats: EmailStats;
  emailTimeline7: TimelineData[];
  emailTimeline30: TimelineData[];
  domains: DomainOption[];
}

function formatChange(value: number, suffix = ""): string {
  if (value === 0) return `0${suffix}`;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1).replace(/\.0$/, "")}${suffix}`;
}

function StatCard({
  label,
  value,
  change,
  suffix = "",
  large = false,
}: {
  label: string;
  value: number;
  change: number;
  suffix?: string;
  large?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
      <p className="text-sm font-bold text-black dark:text-white">{label}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span
          className={`font-black text-blue-700 dark:text-blue-400 ${
            large ? "text-4xl" : "text-2xl"
          }`}
        >
          {typeof value === "number" && suffix === "%"
            ? value.toFixed(1)
            : value.toLocaleString()}
          {suffix}
        </span>
        <span className="text-right text-sm font-normal text-black dark:text-white">
          {formatChange(change, suffix === "%" ? "%" : "")}
        </span>
      </div>
    </div>
  );
}

export default function AnalyticsDetails({
  organizationId,
}: AnalyticsDetailsProps) {
  const [analytics, setAnalytics] = useState<FullAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7" | "30">("7");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!organizationId) return;

      try {
        const params = new URLSearchParams({
          organizationId: organizationId,
        });
        if (selectedDomain && selectedDomain !== "all") {
          params.set("domainId", selectedDomain);
        }

        const response = await fetch(`/api/analytics-details?${params}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch analytics: ${response.status} ${errorText}`,
          );
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [organizationId, selectedDomain]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-stone-500 dark:text-stone-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {
    subscribedEmails: 0,
    subscribedChange: 0,
    openRate: 0,
    openRateChange: 0,
    conversionRate: 0,
    conversionRateChange: 0,
    clickRate: 0,
    clickRateChange: 0,
    bounceRate: 0,
    bounceRateChange: 0,
    unsubscribeRate: 0,
    unsubscribeRateChange: 0,
    listGrowth: [],
  };

  const campaigns = analytics?.campaigns || [];
  const signupForms = analytics?.signupForms || [];
  const deliverabilityData = analytics?.deliverabilityData || [];
  const emailStats = analytics?.emailStats || {
    total: 0,
    delivered: 0,
    bounced: 0,
    complained: 0,
    clicked: 0,
    opened: 0,
  };
  const emailTimeline =
    timeRange === "7"
      ? analytics?.emailTimeline7 || []
      : analytics?.emailTimeline30 || [];
  const domains = analytics?.domains || [];

  const emailStatCards = [
    { label: "total", value: emailStats.total },
    { label: "delivered", value: emailStats.delivered },
    { label: "bounced", value: emailStats.bounced },
    { label: "complained", value: emailStats.complained },
    { label: "clicked", value: emailStats.clicked },
    { label: "opened", value: emailStats.opened },
  ];

  return (
    <div className="space-y-8">
      {/* Email Stats Section with Graph */}
      <section>
        <div className="mb-6 flex flex-nowrap items-center justify-between gap-3">
          <h2 className="min-w-0 shrink text-xl font-bold text-stone-900 sm:text-2xl dark:text-white">
            Email Performance
          </h2>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-4">
            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white"
            >
              <option value="all">All Domains</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.domain}
                </option>
              ))}
            </select>

            {/* Time Range Toggle */}
            <div className="flex rounded-lg border border-stone-300 dark:border-stone-600">
              <button
                onClick={() => setTimeRange("7")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === "7"
                    ? "bg-blue-700 text-white"
                    : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-[#2D2D2D] dark:text-stone-300 dark:hover:bg-stone-700"
                } rounded-l-lg`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange("30")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === "30"
                    ? "bg-blue-700 text-white"
                    : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-[#2D2D2D] dark:text-stone-300 dark:hover:bg-stone-700"
                } rounded-r-lg`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>

        {/* Email Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {emailStatCards.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]"
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
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
          <div className="h-72">
            {emailTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={emailTimeline}
                  margin={{ top: 32, right: 10, left: 0, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
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
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    iconSize={10}
                    iconType="square"
                    wrapperStyle={{ paddingTop: "8px", fontSize: "12px" }}
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
                  <Bar
                    dataKey="bounced"
                    fill="#ef4444"
                    name="Bounced"
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

      {/* Rate Stats */}
      <section>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Open Rate"
            value={overview.openRate}
            change={overview.openRateChange}
            suffix="%"
          />
          <StatCard
            label="Click Rate"
            value={overview.clickRate}
            change={overview.clickRateChange}
            suffix="%"
          />
          <StatCard
            label="Bounce Rate"
            value={overview.bounceRate}
            change={overview.bounceRateChange}
            suffix="%"
          />
          <StatCard
            label="Unsubscribe Rate"
            value={overview.unsubscribeRate}
            change={overview.unsubscribeRateChange}
            suffix="%"
          />
        </div>

        {/* Deliverability Pie Chart */}
        {deliverabilityData.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
              <p className="mb-4 text-sm font-medium text-stone-500 dark:text-stone-400">
                Deliverability Breakdown
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliverabilityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {deliverabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Campaigns Performance */}
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
              <p className="mb-4 text-sm font-medium text-stone-500 dark:text-stone-400">
                Campaign Performance
              </p>
              <div className="h-64">
                {campaigns.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campaigns.slice(0, 5)}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="subject"
                        type="category"
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="opened" fill={CHART_OPENED} name="Opened" />
                      <Bar dataKey="clicked" fill="#22c55e" name="Clicked" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-stone-400">No campaigns yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Table */}
        {campaigns.length > 0 && (
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
            <p className="mb-4 text-sm font-medium text-stone-500 dark:text-stone-400">
              Recent Campaigns
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <th className="px-4 py-2 text-left text-sm font-medium text-stone-500 dark:text-stone-400">
                      Campaign
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-stone-500 dark:text-stone-400">
                      Sent
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-stone-500 dark:text-stone-400">
                      Delivered
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-stone-500 dark:text-stone-400">
                      Opened
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-stone-500 dark:text-stone-400">
                      Clicked
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-stone-500 dark:text-stone-400">
                      Open Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-stone-100 dark:border-stone-800"
                    >
                      <td className="px-4 py-3 text-sm text-stone-900 dark:text-white">
                        <Link
                          href={`/email/${campaign.id}`}
                          className="hover:text-blue-700 dark:hover:text-blue-400"
                        >
                          {campaign.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-stone-600 dark:text-stone-300">
                        {campaign.sent}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-stone-600 dark:text-stone-300">
                        {campaign.delivered}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-stone-600 dark:text-stone-300">
                        {campaign.opened}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-stone-600 dark:text-stone-300">
                        {campaign.clicked}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-blue-700 dark:text-blue-400">
                        {campaign.sent > 0
                          ? ((campaign.opened / campaign.sent) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* People Section */}
      <section>
        <div className="mb-6 flex flex-nowrap items-center justify-between gap-3">
          <h2 className="min-w-0 shrink text-xl font-bold text-stone-900 sm:text-2xl dark:text-white">
            People
          </h2>
          <Link
            href={`/organization/${organizationId}/audience`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-blue-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            Go to People
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Subscribed Emails"
            value={overview.subscribedEmails}
            change={overview.subscribedChange}
            large
          />
          <StatCard
            label="Open Rate"
            value={overview.openRate}
            change={overview.openRateChange}
            suffix="%"
            large
          />
          <StatCard
            label="Conversion Rate"
            value={overview.conversionRate}
            change={overview.conversionRateChange}
            suffix="%"
            large
          />
        </div>

        {/* List Growth Chart */}
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
          <p className="mb-4 text-sm font-medium text-stone-500 dark:text-stone-400">
            List Growth Over Time
          </p>
          <div className="h-48">
            {overview.listGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.listGrowth}>
                  <defs>
                    <linearGradient
                      id="colorCountDetails"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
                    fill="url(#colorCountDetails)"
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

      {/* Signup Forms Section */}
      {signupForms.length > 0 && (
        <section>
          <div className="mb-6 flex flex-nowrap items-center justify-between gap-3">
            <h2 className="min-w-0 shrink text-xl font-bold text-stone-900 sm:text-2xl dark:text-white">
              Active Signup Forms
            </h2>
            <Link
              href={`/organization/${organizationId}/signup-forms`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-blue-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <ClipboardList
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                strokeWidth={2}
              />
              Go to Forms
              <ArrowRight
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                strokeWidth={2}
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signupForms.map((form) => (
              <div
                key={form.id}
                className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]"
              >
                <h3 className="mb-2 font-medium text-stone-900 dark:text-white">
                  {form.name}
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                      {form.views}
                    </p>
                    <p className="text-xs font-bold text-black dark:text-white">
                      Views
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                      {form.submissions}
                    </p>
                    <p className="text-xs font-bold text-black dark:text-white">
                      Signups
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                      {form.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs font-bold text-black dark:text-white">
                      Conv. Rate
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
