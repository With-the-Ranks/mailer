"use client";

import { Loader2, Send } from "lucide-react";
import type { Moment } from "moment";
import React, { useTransition } from "react";

import { cn } from "@/lib/utils";

import { useModal } from "./modal/provider";
import { SendEmailModal } from "./modal/send-email-modal";

interface SendEmailButtonProps {
  isSending: boolean;
  getButtonLabel: () => React.ReactNode;
  onConfirm: () => void;
  onSendTest: (_email: string) => void;
  selectedAudienceList: string | null;
  setSelectedAudienceList: (_id: string | null) => void;
  organizationId: string;
  scheduledTimeValue: Moment;
  isValidTime: (_current: Moment) => boolean;
  setScheduledTimeValue: (_date: Moment) => void;
  isScheduleDisabled: boolean;
}

export default function SendEmailButton({
  isSending,
  getButtonLabel,
  onConfirm,
  onSendTest,
  selectedAudienceList,
  setSelectedAudienceList,
  organizationId,
  scheduledTimeValue,
  isValidTime,
  setScheduledTimeValue,
  isScheduleDisabled,
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
        onConfirm={() => {
          startTransition(onConfirm);
          modal.hide();
        }}
        onSendTest={onSendTest}
      />,
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSending || isPending}
      className={cn(
        "btn flex items-center text-sm",
        (isSending || isPending) && "cursor-not-allowed opacity-50",
      )}
    >
      {isSending || isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Send className="h-4 w-4" />
          <span>{getButtonLabel()}</span>
        </>
      )}
    </button>
  );
}
