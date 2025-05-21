"use client";

import type { Email, Organization } from "@prisma/client";
import { Clock, Edit3, Info, Send } from "lucide-react";
import Link from "next/link";
import React from "react";

import CancelScheduleModal from "@/components/modal/cancel-schedule-modal";
import { Button } from "@/components/ui/button";

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
  const published = data.published;
  const scheduled = published && new Date(data.scheduledTime) > now;

  const timestamp = !published
    ? new Date(data.updatedAt)
    : scheduled
      ? new Date(data.scheduledTime)
      : new Date(data.updatedAt);

  const StatusIcon = !published ? Edit3 : scheduled ? Clock : Send;
  const statusText = scheduled ? "Scheduled" : published ? "Sent" : "Draft";
  const timeLabel = !published
    ? "Last edited"
    : scheduled
      ? "Scheduled"
      : "Sent";

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
          <Link href={`/email/${data.id}${published ? "" : "/editor"}`}>
            {data.title || "No Subject"}
          </Link>
        </td>

        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
          <Link href={`/email/${data.id}${published ? "" : "/editor"}`}>
            {statusText}
          </Link>
        </td>

        <td className="px-6 py-4">
          <Link
            href={`/email/${data.id}${published ? "" : "/editor"}`}
            className="flex items-center space-x-2"
          >
            <StatusIcon size={16} />
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase text-gray-400 dark:text-gray-500">
                {timeLabel}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {fmtDate(timestamp)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {fmtTime(timestamp)}
              </span>
            </div>
          </Link>
        </td>

        <td className="space-x-2 px-6 py-4 text-right">
          {scheduled && (
            <>
              <Link href={`/email/${data.id}`}>
                <Button variant="ghost" size="icon" title="Email details">
                  <Info size={20} />
                </Button>
              </Link>
              <CancelScheduleModal
                emailId={data.id}
                scheduledTime={data.scheduledTime.toISOString()}
              />
            </>
          )}

          {published && !scheduled && (
            <Link href={`/email/${data.id}`}>
              <Button variant="ghost" size="icon" title="Email details">
                <Info size={20} />
              </Button>
            </Link>
          )}

          {!published && (
            <Link href={`/email/${data.id}/editor`}>
              <Button variant="ghost" size="icon" title="Edit draft">
                <Edit3 size={20} />
              </Button>
            </Link>
          )}
        </td>
      </tr>
    </>
  );
}
