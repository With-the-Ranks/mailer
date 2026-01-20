"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useWizard } from "./wizard-context";

export function LeaveConfirmDialog() {
  const router = useRouter();
  const { leavePrompt, setLeavePrompt, saveEmail, isSaving } = useWizard();

  const open = !!leavePrompt;
  const href = leavePrompt?.href ?? "";

  const handleDiscard = () => {
    setLeavePrompt(null);
    if (href) router.push(href);
  };

  const handleSaveChanges = async () => {
    if (!href) return;
    await saveEmail();
    setLeavePrompt(null);
    router.push(href);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && setLeavePrompt(null)}>
      <AlertDialogContent className="rounded-lg border-gray-200 bg-white shadow-lg sm:max-w-xl dark:border-gray-700 dark:bg-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 dark:text-white">
            Unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            You have unsaved changes. Save before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row flex-nowrap items-center justify-end gap-2">
          <AlertDialogCancel className="m-0 shrink-0">Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="outline"
            onClick={handleDiscard}
            disabled={isSaving}
            className="m-0 shrink-0 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="m-0 shrink-0 bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
