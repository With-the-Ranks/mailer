"use client";

import { Loader2, Send } from "lucide-react";
import type { Moment } from "moment";
import React, { useTransition } from "react";

import { useModal } from "./modal/provider";
import { SendEmailModal } from "./modal/send-email-modal";
import { Button } from "./ui/button";

interface SendEmailButtonProps {
  isSending: boolean;
  getButtonLabel: () => React.ReactNode;
  selectedAudienceList: string | null;
  setSelectedAudienceList: (_id: string | null) => void;
  organizationId: string;
  scheduledTimeValue: Moment;
  isValidTime: (_current: Moment) => boolean;
  setScheduledTimeValue: (_date: Moment) => void;
  isScheduleDisabled: boolean;
  subject: string;
  previewText: string;
  from: string;
  content: string;
  emailId: string;
  onSent?: () => void;
  onConfirm: (_scheduledTime?: string) => void;
}

export default function SendEmailButton({
  isSending,
  getButtonLabel,
  selectedAudienceList,
  setSelectedAudienceList,
  organizationId,
  scheduledTimeValue,
  isValidTime,
  setScheduledTimeValue,
  isScheduleDisabled,
  subject,
  previewText,
  from,
  content,
  emailId,
  onConfirm,
}: SendEmailButtonProps) {
  const modal = useModal();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    modal?.show(
      <SendEmailModal
        selectedAudienceList={selectedAudienceList}
        setSelectedAudienceList={setSelectedAudienceList}
        organizationId={organizationId}
        scheduledTimeValue={scheduledTimeValue}
        isValidTime={isValidTime}
        setScheduledTimeValue={setScheduledTimeValue}
        isScheduleDisabled={isScheduleDisabled}
        subject={subject}
        previewText={previewText}
        from={from}
        content={content}
        emailId={emailId}
        onConfirm={(scheduledTime) => {
          startTransition(() => {
            onConfirm(scheduledTime);
          });
          modal.hide();
        }}
      />,
    );
  };

  const isLoading = isSending || isPending;

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center text-base"
      aria-label={isLoading ? "Sending" : String(getButtonLabel())}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{getButtonLabel()}</span>
        </>
      )}
    </Button>
  );
}
