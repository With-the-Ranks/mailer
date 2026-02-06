"use client";

import { createContext, useContext, useCallback, useState } from "react";
import { toast } from "sonner";
import type {
  WizardContextValue,
  WizardFormData,
  WizardState,
  WizardStep,
} from "./types";

const WizardContext = createContext<WizardContextValue | null>(null);

interface WizardProviderProps {
  children: React.ReactNode;
  initialState: WizardState;
}

export function WizardProvider({
  children,
  initialState,
}: WizardProviderProps) {
  const [state, setState] = useState<WizardState>(initialState);
  const [leavePrompt, setLeavePrompt] = useState<{ href: string } | null>(null);

  const requestLeave = useCallback((href: string) => {
    setLeavePrompt({ href });
  }, []);

  const saveEmail = useCallback(async () => {
    // Only save if campaign name (title) is filled out
    if (!state.formData.title?.trim()) {
      return;
    }

    let currentEmailId = state.emailId;

    // If no emailId exists, create a new email first
    if (!currentEmailId) {
      setState((prev) => ({ ...prev, isSaving: true }));

      try {
        const { createEmail } = await import("@/lib/actions");
        const newEmail = await createEmail(
          state.formData.title.trim(),
          state.organizationId,
          state.formData.template,
          state.formData.content,
        );

        if ("error" in newEmail) {
          toast.error("Failed to create email: " + newEmail.error);
          setState((prev) => ({ ...prev, isSaving: false }));
          return;
        }

        currentEmailId = newEmail.id;

        // Update state with new emailId
        setState((prev) => ({
          ...prev,
          emailId: newEmail.id,
        }));

        // Update URL to include emailId
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("emailId", newEmail.id);
          window.history.replaceState({}, "", url.toString());
        }
      } catch (error) {
        console.error("Create email error:", error);
        toast.error("Failed to create email");
        setState((prev) => ({ ...prev, isSaving: false }));
        return;
      }
    }

    // Now save/update the email
    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      // Construct email data object matching the Email type
      const emailData: any = {
        id: currentEmailId,
        organizationId: state.organizationId,
        title: state.formData.title,
        subject: state.formData.subject,
        from: state.formData.from,
        replyTo: state.formData.replyTo,
        previewText: state.formData.previewText,
        content: state.formData.content,
        template: state.formData.template,
        audienceListId: state.formData.audienceListId,
        segmentId: state.formData.selectedSegment,
        scheduledTime: state.formData.scheduledTime
          ? new Date(state.formData.scheduledTime)
          : null,
      };

      const { updateEmail } = await import("@/lib/actions");
      const result = await updateEmail(emailData);

      if ("error" in result) {
        toast.error("Failed to save: " + result.error);
      } else {
        toast.success("Draft saved");
        setState((prev) => ({
          ...prev,
          isSaving: false,
          isDirty: false,
          lastSaved: new Date(),
        }));
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save email");
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [state.emailId, state.organizationId, state.formData]);

  const setCurrentStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const updateFormData = useCallback((data: Partial<WizardFormData>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...data },
      isDirty: true,
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    setState((prev) => {
      const nextStep = Math.min(prev.currentStep + 1, 4) as WizardStep;
      return { ...prev, currentStep: nextStep };
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      const prevStep = Math.max(prev.currentStep - 1, 1) as WizardStep;
      return { ...prev, currentStep: prevStep };
    });
  }, []);

  const canProceedToNextStep = useCallback((): boolean => {
    const { currentStep, formData, emailId } = state;

    switch (currentStep) {
      case 1:
        // Step 1: Require campaign name, subject, from, and template
        return Boolean(
          formData.title?.trim() &&
          formData.subject?.trim() &&
          formData.from?.trim() &&
          formData.template,
        );
      case 2:
        // Step 2: Require audience selection (can be null for "All contacts")
        return true; // Always allow proceeding from step 2
      case 3:
        // Step 3: Preview is optional
        return true;
      case 4:
        // Step 4: Enable Send when we have an email to send (handleFinalSend validates and toasts if missing)
        return Boolean(emailId);
      default:
        return false;
    }
  }, [state]);

  const value: WizardContextValue = {
    ...state,
    setCurrentStep,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    canProceedToNextStep,
    saveEmail,
    leavePrompt,
    setLeavePrompt,
    requestLeave,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return context;
}
