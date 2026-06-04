"use client";

import confetti from "canvas-confetti";
import moment from "moment";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { sendBulkEmail } from "@/lib/actions/send-email";
import { Button } from "@/components/ui/button";
import { Step1Create } from "./step-1-create";
import { Step2Target } from "./step-2-target";
import { Step3Preview } from "./step-3-preview";
import { Step4ScheduleSend } from "./step-4-schedule-send";
import type { WizardState } from "./types";
import { useWizard, WizardProvider } from "./wizard-context";
import { LeaveConfirmDialog } from "./leave-confirm-dialog";
import { WizardNavigation } from "./wizard-navigation";
import { WizardStepIndicator } from "./wizard-step-indicator";

interface EmailWizardContainerProps {
  initialState: WizardState;
  organizationData?: {
    subdomain: string | null;
    logo: string | null;
    image: string | null;
    backgroundColor: string | null;
    buttonColor: string | null;
    timezone: string | null;
  } | null;
}

function EmailWizardContent({
  organizationData,
}: {
  organizationData?: EmailWizardContainerProps["organizationData"];
}) {
  const {
    currentStep,
    formData,
    emailId,
    organizationId,
    isDirty,
    isSaving,
    saveEmail,
    goToNextStep,
    requestLeave,
  } = useWizard();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const saved = await saveEmail();
      if (saved) goToNextStep();
    } else {
      goToNextStep();
    }
  };

  // Block tab close/refresh when there are unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // Intercept in-app navigation (sidebar, links) when dirty: show leave prompt
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isDirty) return;
      const a = (e.target as HTMLElement).closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!a?.href) return;
      const href = a.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("data:") ||
        href.startsWith("vbscript:") ||
        a.target === "_blank" ||
        a.hasAttribute("download")
      )
        return;
      const current = window.location.pathname + window.location.search;
      if (href === current) return;
      const sameOrigin =
        href.startsWith("/") ||
        (typeof a.href === "string" &&
          a.href.startsWith(window.location.origin));
      if (!sameOrigin) return;
      e.preventDefault();
      e.stopPropagation();
      requestLeave(
        href.startsWith("http")
          ? new URL(a.href).pathname + (new URL(a.href).search || "")
          : href,
      );
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty, requestLeave]);

  const handleFinalSend = async () => {
    if (!emailId) {
      toast.error("Email ID not found");
      return;
    }

    setIsSending(true);
    try {
      // Determine when to send: pass ISO string for schedule, undefined for send now
      const scheduledTime = formData.scheduledTime
        ? moment(formData.scheduledTime).toISOString()
        : undefined;

      // Call sendBulkEmail server action
      const result = await sendBulkEmail({
        id: emailId,
        audienceListId: formData.audienceListId || undefined,
        from: formData.from,
        subject: formData.subject,
        content: formData.content,
        previewText: formData.previewText,
        segmentId: formData.selectedSegment || undefined,
        scheduledTime,
        organizationId,
      });

      if ("error" in result) {
        toast.error(result.error);
        posthog.capture("email_send_failed", {
          email_id: emailId,
          error: result.error,
        });
      } else {
        // Success!
        posthog.capture("email_sent", {
          email_id: emailId,
          organization_id: organizationId,
          segment_id: formData.selectedSegment,
          is_scheduled: Boolean(formData.scheduledTime),
        });

        // Show confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        const message = formData.scheduledTime
          ? "Email scheduled successfully!"
          : "Email sent successfully!";
        toast.success(message);

        // Redirect to analytics page
        router.push(`/email/${emailId}`);
      }
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send email");
      posthog.captureException(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <LeaveConfirmDialog />
      {/* Centered Container */}
      <div className="mx-auto w-full max-w-4xl">
        {/* Title and Save bar */}
        <div className="flex flex-wrap items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
          <h1 className="min-w-0 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            {currentStep === 1 && "Create Email"}
            {currentStep === 2 && "Choose your target audience"}
            {currentStep === 3 && "Preview"}
            {currentStep === 4 && "Schedule & Send"}
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={() => saveEmail()}
            disabled={isSaving}
            className="border-gray-300 dark:border-gray-600"
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="mx-4 mt-4 mb-4 sm:mx-6">
          <WizardStepIndicator
            currentStep={currentStep}
            onNext={handleNextStep}
            onFinalSubmit={handleFinalSend}
            isFinalStep={currentStep === 4}
            isSending={isSending}
            finalButtonLabel={
              formData.scheduledTime ? "Schedule Email" : "Send Email"
            }
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {currentStep === 1 && (
            <Step1Create organizationData={organizationData} />
          )}
          {currentStep === 2 && <Step2Target />}
          {currentStep === 3 && <Step3Preview />}
          {currentStep === 4 && (
            <Step4ScheduleSend
              onFinalSend={handleFinalSend}
              timezone={organizationData?.timezone ?? "America/New_York"}
            />
          )}
        </div>

        {/* Bottom Navigation (Back button only) */}
        <WizardNavigation
          onFinalSubmit={handleFinalSend}
          isFinalStep={currentStep === 4}
          finalButtonLabel={
            formData.scheduledTime ? "Schedule Email" : "Send Email"
          }
        />
      </div>
    </div>
  );
}

export function EmailWizard({
  initialState,
  organizationData,
}: EmailWizardContainerProps) {
  return (
    <WizardProvider initialState={initialState}>
      <EmailWizardContent organizationData={organizationData} />
    </WizardProvider>
  );
}
