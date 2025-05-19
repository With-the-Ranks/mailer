"use client";

import type { Email, Organization } from "@prisma/client";
import { Clock, Edit3, Info, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

import Modal from "@/components//modal";
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
  const router = useRouter();
  const now = new Date();
  const pub = data.published;
  const sched = new Date(data.scheduledTime);
  const isScheduled = pub && sched > now;

  let dateToShow: Date;
  if (!pub) dateToShow = new Date(data.updatedAt);
  else if (isScheduled) dateToShow = sched;
  else dateToShow = new Date(data.updatedAt);

  const StatusIcon = !pub ? Edit3 : isScheduled ? Clock : Send;
  const timeLabelText = !pub
    ? "Last edited"
    : isScheduled
      ? "Scheduled"
      : "Sent";

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleUnschedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email/${data.id}/unschedule`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Email unscheduled, moved back to draft.");
      router.refresh();
    } catch {
      toast.error("Could not cancel schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
          <Link href={`/email/${data.id}${pub ? "" : "/editor"}`}>
            {data.title || "No Subject"}
          </Link>
        </td>

        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
          <Link
            href={`/email/${data.id}${pub ? "" : "/editor"}`}
            className="block"
          >
            {isScheduled ? "Scheduled" : pub ? "Sent" : "Draft"}
          </Link>
        </td>

        <td className="px-6 py-4">
          <Link
            href={`/email/${data.id}${pub ? "" : "/editor"}`}
            className="flex items-center space-x-2"
          >
            <StatusIcon size={16} />
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase text-gray-400 dark:text-gray-500">
                {timeLabelText}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {fmtDate(dateToShow)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {fmtTime(dateToShow)}
              </span>
            </div>
          </Link>
        </td>

        <td className="space-x-2 px-6 py-4 text-right">
          {isScheduled && (
            <>
              <Link href={`/email/${data.id}`}>
                <Button variant="ghost" size="icon" title="Email details">
                  <Info size={20} />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                disabled={loading}
                title="Cancel schedule"
                onClick={() => setShowModal(true)}
              >
                <XCircle size={20} />
              </Button>
            </>
          )}

          {pub && !isScheduled && (
            <Link href={`/email/${data.id}`}>
              <Button variant="ghost" size="icon" title="Email details">
                <Info size={20} />
              </Button>
            </Link>
          )}

          {!pub && (
            <Link href={`/email/${data.id}/editor`}>
              <Button variant="ghost" size="icon" title="Edit draft">
                <Edit3 size={20} />
              </Button>
            </Link>
          )}
        </td>
      </tr>

      {isScheduled && (
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnschedule();
              setShowModal(false);
            }}
            className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
          >
            <div className="relative flex flex-col space-y-4 p-5 md:p-10">
              <h2 className="font-cal text-2xl dark:text-white">
                Cancel Scheduled Email?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to cancel this scheduled email and move it
                back to draft?
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Dismiss
              </Button>
              <Button
                type="submit"
                variant="default"
                className={loading ? "cursor-not-allowed opacity-50" : ""}
                disabled={loading}
              >
                Yes, Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
