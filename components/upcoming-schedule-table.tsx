import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

const DEFAULT_TIMEZONE = "America/New_York";

function getDateInTimezone(d: Date, tz: string): string {
  return d.toLocaleDateString("en-CA", { timeZone: tz });
}

// Add n calendar days in org timezone so "today" and the week grid stay consistent
function addDaysInTimezone(today: Date, n: number, tz: string): string {
  const d = new Date(today.getTime() + n * 24 * 60 * 60 * 1000);
  return getDateInTimezone(d, tz);
}

// Weekday and day number for a date string, interpreted in org timezone
function getDayLabel(
  dateStr: string,
  tz: string,
): {
  weekday: string;
  dayNum: string;
} {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const weekday = date.toLocaleDateString("en-US", {
    timeZone: tz,
    weekday: "short",
  });
  const dayNum = date.toLocaleDateString("en-CA", {
    timeZone: tz,
    day: "2-digit",
  });
  return {
    weekday,
    dayNum,
  };
}

export interface UpcomingEmail {
  id: string;
  subject: string | null;
  title: string | null;
  scheduledTime: Date;
}

interface UpcomingScheduleTableProps {
  emails: UpcomingEmail[];
  timezone?: string | null;
  organizationId: string;
}

export function UpcomingScheduleTable({
  emails,
  timezone = DEFAULT_TIMEZONE,
  organizationId,
}: UpcomingScheduleTableProps) {
  const tz = timezone ?? DEFAULT_TIMEZONE;
  const now = new Date();
  const todayStr = getDateInTimezone(now, tz);
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDaysInTimezone(now, i, tz),
  );

  const emailsByDay = weekDays.reduce<Record<string, UpcomingEmail[]>>(
    (acc, dayStr) => {
      acc[dayStr] = emails.filter(
        (e) => getDateInTimezone(e.scheduledTime, tz) === dayStr,
      );
      return acc;
    },
    {},
  );

  return (
    <section>
      <div className="mb-6 flex flex-nowrap items-center justify-between gap-3">
        <h1 className="min-w-0 shrink text-xl font-bold text-stone-900 sm:text-2xl md:text-3xl dark:text-white">
          Emails
        </h1>
        <Link
          href={`/organization/${encodeURIComponent(organizationId)}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          Go to Emails
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
        </Link>
      </div>
      <div className="mb-4 self-stretch text-left text-xl font-normal text-black dark:text-white">
        Upcoming
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#D3D3D3] bg-white p-3 sm:p-4 dark:border-[#D3D3D3] dark:bg-[#2D2D2D]">
        <div className="grid w-full min-w-88 grid-cols-7 items-stretch sm:min-w-0">
          {weekDays.map((dayStr, index) => {
            const isToday = dayStr === todayStr;
            const label = getDayLabel(dayStr, tz);
            const isLast = index === weekDays.length - 1;
            return (
              <div
                key={dayStr}
                className={`min-h-[100px] min-w-14 border-r border-stone-200 bg-white p-1.5 sm:min-h-[120px] sm:min-w-0 sm:p-2 dark:border-stone-700 dark:bg-[#2D2D2D] ${isLast ? "border-r-0" : ""}`}
              >
                <div className="mb-1 flex items-start justify-between gap-0.5 sm:mb-2 sm:gap-1">
                  <span className="truncate text-xs font-bold text-stone-900 sm:text-sm dark:text-white">
                    {label.weekday}
                  </span>
                  <span className="shrink-0 text-right text-xs text-stone-500 sm:text-sm dark:text-stone-400">
                    {label.dayNum}
                  </span>
                </div>
                {isToday && (
                  <div className="mb-1 sm:mb-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                      Today
                    </span>
                  </div>
                )}
                <div className="space-y-1 sm:space-y-2">
                  {(emailsByDay[dayStr] ?? []).map((email) => (
                    <Link
                      key={email.id}
                      href={`/email/${email.id}`}
                      className="block rounded-md bg-blue-700 px-1.5 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-800 sm:px-2 sm:py-1.5 sm:text-sm"
                    >
                      <span className="line-clamp-2">
                        {email.title || email.subject || "Untitled"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
