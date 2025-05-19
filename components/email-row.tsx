import type { Email, Organization } from "@prisma/client";
import { Clock, Edit3, PieChart, Send } from "lucide-react";
import Link from "next/link";

const fmtDate = (d: Date) =>
  d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const fmtTime = (d: Date) =>
  d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

export default function EmailRow({
  data,
}: {
  data: Email & { organization?: Organization | null };
}) {
  const now = new Date();
  const pub = data.published;
  const sched = new Date(data.scheduledTime);
  const isScheduled = pub && sched > now;

  let dateToShow: Date;
  if (!pub) dateToShow = new Date(data.updatedAt);
  else if (isScheduled) dateToShow = sched;
  else dateToShow = new Date(data.updatedAt);

  const StatusIcon = !pub ? Edit3 : isScheduled ? Clock : Send;

  const timeLabelText = !pub ? "Last edited" : isScheduled ? "Sending" : "Sent";

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
        <Link href={`/email/${data.id}${pub ? "" : "/editor"}`}>
          {data.title || "No Subject"}
        </Link>
      </td>

      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
        <Link href={`/email/${data.id}${pub ? "" : "/editor"}`}>
          {isScheduled ? "Scheduled" : pub ? "Sent" : "Draft"}
        </Link>
      </td>

      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
        <Link href={`/email/${data.id}${pub ? "" : "/editor"}`}>
          <div className="flex items-start space-x-2">
            <StatusIcon size={16} />
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase text-gray-400">
                {timeLabelText}
              </span>
              <span className="text-sm font-semibold">
                {fmtDate(dateToShow)}
              </span>
              <span className="text-xs">{fmtTime(dateToShow)}</span>
            </div>
          </div>
        </Link>
      </td>

      <td className="px-6 py-4 text-center">
        {pub ? (
          <Link href={`/email/${data.id}`} className="btn p-2" title="Report">
            <PieChart size={20} />
          </Link>
        ) : (
          <Link
            href={`/email/${data.id}/editor`}
            className="btn p-2"
            title="Edit Draft"
          >
            <Edit3 size={20} />
          </Link>
        )}
      </td>
    </tr>
  );
}
