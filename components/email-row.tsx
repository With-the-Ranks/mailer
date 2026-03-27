"use client";

import type { Email, Organization } from "@/prisma/generated/prisma/client";
import { Clock, Edit3, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

import CancelScheduleModal from "@/components/modal/cancel-schedule-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteEmail } from "@/lib/actions";

const formatDate = (date: Date, timeZone?: string | null) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  });

const formatTime = (date: Date, timeZone?: string | null) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone, timeZoneName: "short" as const } : {}),
  });

export default function EmailRow({
  data,
}: {
  data: Email & { organization?: Organization | null };
}) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const now = new Date();
  const published = data.published;
  const scheduled = published && new Date(data.scheduledTime) > now;
  const appTimeZone = data.organization?.timezone;

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

  // Determine the link for draft emails - use wizard instead of old editor
  const draftLink =
    !published && data.organization
      ? `/email/create?emailId=${data.id}&organizationId=${data.organization.id}`
      : `/email/${data.id}/editor`;

  const emailLink = published ? `/email/${data.id}` : draftLink;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      const result = await deleteEmail(formData, data.id, "delete");

      if ("error" in result) {
        toast.error(result.error || "Failed to delete email");
      } else {
        toast.success("Email deleted successfully");
        if (result.organizationId) {
          router.push(`/organization/${result.organizationId}`);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("Failed to delete email");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {data.title || "Untitled Campaign"}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <tr className="hover:bg-gray-50 dark:hover:bg-neutral-800">
        <td className="min-w-0 px-3 py-3 font-medium text-gray-900 sm:px-6 sm:py-4 dark:text-gray-100">
          <Link href={emailLink} className="block wrap-break-word">
            {data.title || "Untitled Campaign"}
          </Link>
        </td>

        <td className="px-3 py-3 text-center text-gray-500 sm:px-6 sm:py-4 dark:text-gray-400">
          <Link href={emailLink} className="block">
            {statusText}
          </Link>
        </td>

        <td className="px-3 py-3 sm:px-6 sm:py-4">
          <Link href={emailLink} className="flex items-center space-x-2">
            <StatusIcon size={16} />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-xs text-gray-400 uppercase dark:text-gray-500">
                {timeLabel}
              </span>
              <span className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(timestamp, appTimeZone)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(timestamp, appTimeZone)}
              </span>
              {appTimeZone ? (
                <span className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                  {appTimeZone}
                </span>
              ) : null}
            </div>
          </Link>
        </td>

        <td className="space-x-2 px-3 py-3 text-right sm:px-6 sm:py-4">
          <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            {scheduled && (
              <>
                <Link href={`/email/${data.id}`}>
                  <Button variant="default" size="sm">
                    View
                  </Button>
                </Link>
                <CancelScheduleModal
                  emailId={data.id}
                  scheduledTime={data.scheduledTime.toISOString()}
                  timezone={appTimeZone}
                />
              </>
            )}

            {published && !scheduled && (
              <Link href={`/email/${data.id}`}>
                <Button variant="default" size="sm">
                  View
                </Button>
              </Link>
            )}

            {!published && (
              <>
                <Link href={draftLink}>
                  <Button variant="default" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
