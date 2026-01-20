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
    <div className="mx-6 mb-6 rounded-lg border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-end">
        {/* Auto-save indicator */}
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>
    </div>
  );
}
