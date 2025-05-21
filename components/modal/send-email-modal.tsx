"use client";

import moment from "moment";
import React, { useState } from "react";

import { AudienceListDropdown } from "@/components/audience-list-dropdown";
import ScheduleEmailButton from "@/components/schedule-email-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useModal } from "./provider";

interface SendEmailModalProps {
  selectedAudienceList: string | null;
  setSelectedAudienceList: (_id: string | null) => void;
  organizationId: string;
  scheduledTimeValue: moment.Moment;
  isValidTime: (_current: moment.Moment) => boolean;
  setScheduledTimeValue: (_date: moment.Moment) => void;
  isScheduleDisabled: boolean;
  onConfirm: () => void;
  onSendTest: (_email: string) => void;
}

export function SendEmailModal({
  selectedAudienceList,
  setSelectedAudienceList,
  organizationId,
  scheduledTimeValue,
  isValidTime,
  setScheduledTimeValue,
  isScheduleDisabled,
  onConfirm,
  onSendTest,
}: SendEmailModalProps) {
  const modal = useModal();
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSendTest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setIsSendingTest(true);
    await onSendTest(testEmail);
    setIsSendingTest(false);
  };

  const isFuture = scheduledTimeValue.isAfter(moment());
  const confirmLabel = isFuture ? "Schedule Email" : "Send Now";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
        modal?.hide();
      }}
      className="w-full max-w-md rounded bg-white p-6 md:border md:shadow"
    >
      <h2 className="mb-4 font-cal text-2xl">Send Email</h2>

      <div className="mb-4">
        <AudienceListDropdown
          selectedAudienceList={selectedAudienceList}
          setSelectedAudienceList={setSelectedAudienceList}
          organizationId={organizationId}
          disabled={true}
        />
      </div>

      {/* Test Email */}
      <div className="mb-6">
        <Label>Send test email</Label>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="test@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            required
            className="flex-1 rounded border px-3 py-2"
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
      <div className="mb-4">
        <ScheduleEmailButton
          scheduledTimeValue={scheduledTimeValue}
          isValidTime={isValidTime}
          setScheduledTimeValue={setScheduledTimeValue}
          isDisabled={isScheduleDisabled}
        />
      </div>
      <button type="submit" className="btn w-full">
        {confirmLabel}
      </button>
    </form>
  );
}
