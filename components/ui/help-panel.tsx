"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { HelpCircle, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HelpPanelProps {
  title?: string;
  children: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
}

export function HelpPanel({
  title = "Help",
  children,
  triggerClassName,
  contentClassName,
}: HelpPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "ml-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0 text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 dark:focus:ring-blue-600",
            triggerClassName,
          )}
          aria-label="Show help"
        >
          <HelpCircle className="h-4 w-4 stroke-2" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        {/* Transparent overlay - doesn't block main content */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-transparent" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 w-96 rounded-lg border border-gray-200 bg-white shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-right-2",
            "top-24 right-6 h-auto max-h-[calc(100vh-8rem)] p-0",
            "dark:border-gray-700 dark:bg-gray-800",
            contentClassName,
          )}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <DialogPrimitive.Title asChild>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="ring-offset-background rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto px-6 py-6">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
