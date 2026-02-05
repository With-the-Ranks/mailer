"use client";

import { Loader2 } from "lucide-react";
import { useWizard } from "./wizard-context";

interface WizardNavigationProps {
  onFinalSubmit?: () => Promise<void>;
  isFinalStep?: boolean;
  finalButtonLabel?: string;
}

export function WizardNavigation({
  onFinalSubmit,
  isFinalStep = false,
  finalButtonLabel = "Send Email",
}: WizardNavigationProps) {
  const { isSaving } = useWizard();

  if (!isSaving) {
    return null;
  }

  return (
    <div className="mx-4 mb-6 rounded-lg border-t border-gray-200 bg-white px-4 py-4 sm:mx-6 sm:px-6 dark:border-gray-700 dark:bg-[#2D2D2D]">
      <div className="flex items-center justify-end">
        {/* Auto-save indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </div>
      </div>
    </div>
  );
}
