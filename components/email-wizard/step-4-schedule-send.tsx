"use client";

import { Loader2 } from "lucide-react";
import type { Moment } from "moment";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScheduleEmailButton from "@/components/schedule-email-button";
import { sendEmail } from "@/lib/actions/send-email";
import { cn } from "@/lib/utils";
import { useWizard } from "./wizard-context";

type SendMode = "now" | "schedule";

interface Step4ScheduleSendProps {
  onFinalSend: () => Promise<void>;
}

export function Step4ScheduleSend({ onFinalSend }: Step4ScheduleSendProps) {
  const { formData, organizationId, updateFormData } = useWizard();
  const [mode, setMode] = useState<SendMode>("now");
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [localScheduledDate, setLocalScheduledDate] = useState<Moment>(() =>
    formData.scheduledTime
      ? moment(formData.scheduledTime)
      : moment().add(1, "hour"),
  );

  // Sync mode and localScheduledDate to formData.scheduledTime
  const setModeAndSync = (m: SendMode) => {
    setMode(m);
    if (m === "now") {
      updateFormData({ scheduledTime: null });
    } else {
      updateFormData({ scheduledTime: localScheduledDate.toISOString() });
    }
  };

  const setLocalScheduledDateAndSync = (d: Moment) => {
    setLocalScheduledDate(d);
    if (mode === "schedule") {
      updateFormData({ scheduledTime: d.toISOString() });
    }
  };

  const handleSendTest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!testEmail) return;

    setIsSendingTest(true);
    try {
      await sendEmail({
        to: testEmail,
        from: formData.from,
        subject: formData.subject,
        content: formData.content,
        previewText: formData.previewText,
        organizationId,
        audienceListId: formData.audienceListId || undefined,
      });
      toast.success("Test email sent successfully!");
    } catch (error) {
      toast.error("Failed to send test email");
      console.error("Test email error:", error);
    } finally {
      setIsSendingTest(false);
    }
  };

  const isValidTime = (current: Moment) => {
    return current.isSameOrAfter(new Date(), "minute");
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-transparent">
      <div className="w-full max-w-6xl p-6">
        <div className="space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Schedule & Send
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test your email and choose when to send it
            </p>
          </div>

          {/* Test Email Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Send Test Email
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSendTest}
                disabled={!testEmail || isSendingTest}
                variant="outline"
                className="shrink-0"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Test"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Send a test email to yourself to verify how it looks
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Send Mode Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              When to Send
            </Label>

            {/* Send Now Option */}
            <button
              type="button"
              onClick={() => setModeAndSync("now")}
              className={cn(
                "flex w-full items-start gap-4 rounded-lg border-2 p-4 text-left transition-all",
                mode === "now"
                  ? "border-blue-700 bg-blue-50 dark:border-blue-600 dark:bg-blue-950"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600",
              )}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 dark:border-gray-500">
                {mode === "now" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-700 dark:bg-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Send Now
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send the email immediately to all recipients
                </p>
              </div>
            </button>

            {/* Schedule Option */}
            <button
              type="button"
              onClick={() => setModeAndSync("schedule")}
              className={cn(
                "flex w-full items-start gap-4 rounded-lg border-2 p-4 text-left transition-all",
                mode === "schedule"
                  ? "border-blue-700 bg-blue-50 dark:border-blue-600 dark:bg-blue-950"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600",
              )}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 dark:border-gray-500">
                {mode === "schedule" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-700 dark:bg-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Schedule for Later
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose a specific date and time to send
                </p>
              </div>
            </button>

            {/* Schedule DateTime Picker (conditional) */}
            {mode === "schedule" && (
              <div className="ml-9 space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <ScheduleEmailButton
                  scheduledTimeValue={localScheduledDate}
                  isValidTime={isValidTime}
                  setScheduledTimeValue={setLocalScheduledDateAndSync}
                  isDisabled={false}
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Email Summary
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Campaign:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {formData.title}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Subject:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {formData.subject}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">From:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {formData.from}
                </dd>
              </div>
              {mode === "schedule" && (
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">
                    Scheduled:
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {localScheduledDate.format("YYYY-MM-DD HH:mm")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
