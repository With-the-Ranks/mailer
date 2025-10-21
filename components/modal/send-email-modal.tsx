"use client";

import confetti from "canvas-confetti";
import { Loader2 } from "lucide-react";
import type { Moment } from "moment";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "sonner";

import ScheduleEmailButton from "@/components/schedule-email-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrgAndAudienceList } from "@/lib/actions";
import { sendBulkEmail, sendEmail } from "@/lib/actions/send-email";

import { SegmentDropdown } from "../segment-dropdown";
import { useModal } from "./provider";

interface SendEmailModalProps {
  selectedAudienceList: string | null;
  setSelectedAudienceList: (_id: string | null) => void;
  organizationId: string;
  scheduledTimeValue: Moment;
  isValidTime: (_current: Moment) => boolean;
  setScheduledTimeValue: (_date: Moment) => void;
  isScheduleDisabled: boolean;
  onConfirm: (_scheduledTime: string) => void;
  subject: string;
  previewText: string;
  from: string;
  content: string;
  emailId: string;
  audienceListId?: string | null;
}

export function SendEmailModal({
  selectedAudienceList,
  organizationId,
  scheduledTimeValue,
  isValidTime,
  isScheduleDisabled,
  onConfirm,
  subject,
  previewText,
  from,
  content,
  emailId,
  audienceListId: audienceListIdProp,
}: SendEmailModalProps) {
  const modal = useModal();
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const [mode, setMode] = useState<"now" | "schedule">("now");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [localScheduledDate, setLocalScheduledDate] =
    useState<Moment>(scheduledTimeValue);

  const handleSendTest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setIsSendingTest(true);
    try {
      await sendEmail({
        to: testEmail,
        from,
        subject,
        content,
        previewText,
        organizationId,
        audienceListId: audienceListIdProp || selectedAudienceList || undefined,
      });
      toast.success("Test email sent");
    } catch {
      toast.error("Failed to send test email");
    }
    setIsSendingTest(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const when =
      mode === "now"
        ? moment().toISOString()
        : localScheduledDate.toISOString();

    try {
      // If no segment is selected, get the default audience list for "All contacts"
      let audienceListId = selectedAudienceList;
      if (!selectedSegment) {
        const orgAndAudience = await getOrgAndAudienceList();
        audienceListId = orgAndAudience?.audienceListId || null;
      }

      const result = await sendBulkEmail({
        segmentId: selectedSegment,
        audienceListId: audienceListId,
        from,
        subject,
        content,
        previewText,
        scheduledTime: mode === "now" ? "" : when,
        id: emailId,
        organizationId,
      });
      if (result.error) {
        toast.error(`Failed to send email: ${result.error}`);
      } else {
        confetti({
          particleCount: 200,
          spread: 120,
          startVelocity: 45,
          scalar: 1.2,
          ticks: 100,
          origin: { y: 0.6 },
        });
        toast.success(
          mode === "now" ? "Emails sent successfully" : "Email scheduled",
        );
        onConfirm?.(when);
        modal?.hide();
      }
    } catch {
      toast.error("Failed to send email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded bg-white p-6 md:border md:shadow"
    >
      <h2 className="mb-4 font-cal text-2xl">Send Email</h2>

      <div className="mb-6">
        <Label>Send test email</Label>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="test@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleSendTest}
            disabled={!testEmail || isSendingTest}
          >
            {isSendingTest ? "Sending…" : "Send Test"}
          </Button>
        </div>
      </div>

      <SegmentDropdown
        organizationId={organizationId}
        value={selectedSegment}
        onChange={setSelectedSegment}
        className="mb-4"
      />
      <div className="mb-4 flex w-max overflow-hidden rounded-full border">
        {(["now", "schedule"] as const).map((m) => (
          <Button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            variant={mode === m ? "default" : "ghost"}
            className={`rounded-none px-4 py-1 text-sm font-medium ${
              mode === m ? "" : "hover:bg-gray-50"
            }`}
            aria-label={m === "now" ? "Send Now" : "Schedule"}
            aria-pressed={mode === m}
          >
            {m === "now" ? "Send Now" : "Schedule"}
          </Button>
        ))}
      </div>

      {mode === "schedule" && (
        <div className="mb-6">
          <ScheduleEmailButton
            scheduledTimeValue={localScheduledDate}
            isValidTime={isValidTime}
            setScheduledTimeValue={setLocalScheduledDate}
            isDisabled={isSubmitting || isScheduleDisabled}
          />
          <p className="mt-2 text-sm text-gray-500">
            Timezone:{" "}
            <span className="font-medium">
              {scheduledTimeValue.format("Z")}
            </span>{" "}
            ({timezone})
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full"
        aria-label={
          isSubmitting
            ? "Sending"
            : mode === "now"
              ? "Send Now"
              : "Schedule Email"
        }
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Sending...
          </>
        ) : mode === "now" ? (
          "🚀 Send Now"
        ) : (
          "📅 Schedule Email"
        )}
      </Button>
    </form>
  );
}
