"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWizard } from "./wizard-context";
import type { WizardStep } from "./types";

interface WizardStepIndicatorProps {
  currentStep: WizardStep;
  onNext?: () => void;
  onFinalSubmit?: () => Promise<void>;
  isFinalStep?: boolean;
  isSending?: boolean;
  finalButtonLabel?: string;
}

const steps = [
  { number: 1, label: "Create", shortLabel: "Create" },
  { number: 2, label: "Target", shortLabel: "Target" },
  { number: 3, label: "Preview", shortLabel: "Preview" },
  { number: 4, label: "Schedule & Send", shortLabel: "Schedule" },
] as const;

export function WizardStepIndicator({
  currentStep,
  onNext,
  onFinalSubmit,
  isFinalStep = false,
  isSending = false,
  finalButtonLabel = "Send Email",
}: WizardStepIndicatorProps) {
  const { canProceedToNextStep, isSaving, goToPreviousStep, setCurrentStep } =
    useWizard();
  const canProceed = canProceedToNextStep();
  const showBackButton = currentStep > 1;

  const handleNext = async () => {
    if (isFinalStep && onFinalSubmit) {
      await onFinalSubmit();
    } else if (onNext) {
      await Promise.resolve(onNext());
    }
  };

  const isStepClickable = (stepNumber: number): boolean => {
    if (isSaving || isSending) return false;
    // Can click on current step or any previous step
    if (stepNumber <= currentStep) return true;
    // Can click on next step if Next button is available
    if (stepNumber === currentStep + 1 && canProceed) return true;
    return false;
  };

  const handleStepClick = (stepNumber: WizardStep) => {
    if (isStepClickable(stepNumber)) {
      setCurrentStep(stepNumber);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 sm:px-4 dark:border-gray-700 dark:bg-[#2D2D2D]">
      <div className="flex w-full items-center gap-2 sm:gap-4">
        {/* Back - always visible */}
        {showBackButton ? (
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            disabled={isSaving || isSending}
            className="flex shrink-0 items-center gap-1.5 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <span>&lt;</span> Back
          </Button>
        ) : null}

        {/* Step labels - scroll horizontally on narrow so Next stays visible */}
        <nav aria-label="Progress" className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {steps.map((step) => {
              const isCurrent = currentStep === step.number;
              const isClickable = isStepClickable(step.number);

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => handleStepClick(step.number as WizardStep)}
                  disabled={!isClickable}
                  className={cn(
                    "shrink-0 text-sm whitespace-nowrap transition-colors",
                    isCurrent
                      ? "font-bold text-gray-900 dark:text-white"
                      : "font-normal",
                    isClickable
                      ? "cursor-pointer hover:text-blue-700 dark:hover:text-blue-400"
                      : "cursor-default opacity-50",
                  )}
                >
                  <span className="text-gray-900 dark:text-white">
                    {step.number}.
                  </span>{" "}
                  <span
                    className={cn(
                      isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300",
                    )}
                  >
                    <span className="sm:hidden">{step.shortLabel}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Next - always visible, never cut off */}
        <Button
          onClick={handleNext}
          disabled={!canProceed || isSaving}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-sm text-white hover:bg-blue-800 sm:px-4 sm:text-base dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isFinalStep ? (
            <>
              {finalButtonLabel} <span>&gt;</span>
            </>
          ) : (
            <>
              Next <span>&gt;</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
