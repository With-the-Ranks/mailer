"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

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

interface CancelScheduleModalProps {
  emailId: string;
  scheduledTime: string;
  organizationId?: string;
  timezone?: string | null;
}

export default function CancelScheduleModal({
  emailId,
  scheduledTime,
  organizationId,
  timezone,
}: CancelScheduleModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const displayTimeZone = timezone?.replace(/_/g, " ");

  const handleUnschedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email/${emailId}/unschedule`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Email unscheduled, moved back to draft.");
      if (organizationId) {
        router.push(`/organization/${organizationId}`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Could not cancel schedule.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const scheduledLabel = new Date(scheduledTime).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    ...(timezone ? { timeZone: timezone } : {}),
  });

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={loading}
        title="Cancel schedule"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Email?</AlertDialogTitle>
            <AlertDialogDescription>
              Scheduled for{" "}
              <time dateTime={scheduledTime}>{scheduledLabel}</time>. Are you
              {displayTimeZone ? ` (${displayTimeZone})` : ""}. Are you sure you
              want to move it back to draft?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleUnschedule();
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Cancelling..." : "Yes, cancel schedule"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
