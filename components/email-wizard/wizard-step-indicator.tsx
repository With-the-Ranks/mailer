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
  finalButtonLabel?: string;
}

const steps = [
  { number: 1, label: "Create" },
  { number: 2, label: "Target" },
  { number: 3, label: "Preview" },
  { number: 4, label: "Schedule & Send" },
] as const;

export function WizardStepIndicator({
  currentStep,
  onNext,
  onFinalSubmit,
  isFinalStep = false,
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
      onNext();
    }
  };

  const isStepClickable = (stepNumber: number): boolean => {
    if (isSaving) return false;
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
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            disabled={isSaving}
            className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <span>&lt;</span> Back
          </Button>
        )}

        {/* Step Labels */}
        <nav
          aria-label="Progress"
          className="flex w-full flex-1 items-center justify-between gap-6 pr-16"
        >
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
                  "text-sm transition-colors",
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
                  {step.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!canProceed || isSaving}
          className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
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
