"use client";

import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";

interface CancelScheduleModalProps {
  emailId: string;
  scheduledTime: string;
  organizationId?: string;
}

export default function CancelScheduleModal({
  emailId,
  scheduledTime,
  organizationId,
}: CancelScheduleModalProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Trigger: XCircle icon button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowModal(true)}
        disabled={loading}
        title="Cancel schedule"
      >
        <XCircle size={20} />
      </Button>

      {showModal && (
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnschedule();
            }}
            className="w-full rounded-md bg-white text-left dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow-sm dark:md:border-stone-700"
          >
            <div className="relative flex flex-col space-y-4 p-5 md:p-10">
              <h2 className="font-cal text-2xl dark:text-white">
                Cancel Scheduled Email?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Scheduled for{" "}
                <time dateTime={scheduledTime}>
                  {new Date(scheduledTime).toLocaleString()}
                </time>
                . Are you sure you want to move it back to draft?
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={loading}
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
