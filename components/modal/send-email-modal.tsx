"use client";

import type { Moment } from "moment";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "sonner";

import ScheduleEmailButton from "@/components/schedule-email-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendBulkEmail, sendEmail } from "@/lib/actions/send-email";

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
}: SendEmailModalProps) {
  const modal = useModal();
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
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
      });
      toast.success("Test email sent");
    } catch {
      toast.error("Failed to send test email");
    }
    setIsSendingTest(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const when =
      mode === "now"
        ? moment().toISOString()
        : localScheduledDate.toISOString();
    try {
      const result = await sendBulkEmail({
        audienceListId: selectedAudienceList!,
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
        toast.success(
          mode === "now" ? "Emails sent successfully" : "Email scheduled",
        );
        onConfirm?.(when);
        modal?.hide();
      }
    } catch {
      toast.error("Failed to send email");
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

      <div className="mb-4 flex w-max overflow-hidden rounded-full border">
        {(["now", "schedule"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-1 text-sm font-medium ${
              mode === m
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {m === "now" ? "Send Now" : "Schedule"}
          </button>
        ))}
      </div>

      {mode === "schedule" && (
        <div className="mb-6">
          <ScheduleEmailButton
            scheduledTimeValue={localScheduledDate}
            isValidTime={isValidTime}
            setScheduledTimeValue={setLocalScheduledDate}
            isDisabled={isScheduleDisabled}
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

      <button type="submit" className="btn w-full">
        {mode === "now" ? "Send Now" : "Schedule Email"}
      </button>
    </form>
  );
}
