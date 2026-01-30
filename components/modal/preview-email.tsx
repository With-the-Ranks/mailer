"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import React, { useState } from "react";

import { EmailPreviewIFrame } from "@/components/email-preview-iframe";
import { cn } from "@/lib/utils";

type DeviceView = "desktop" | "tablet" | "mobile";

interface PreviewEmailProps {
  html: string;
}

export default function EmailPreview({ html }: PreviewEmailProps) {
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");

  const deviceWidths = {
    desktop: "max-w-full",
    tablet: "max-w-2xl",
    mobile: "max-w-sm",
  };

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Email Snapshot
        </h2>
        {/* Device Toggle - same as Step 3 preview */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-[#2D2D2D]">
          <button
            type="button"
            onClick={() => setDeviceView("desktop")}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors",
              deviceView === "desktop"
                ? "bg-blue-700 text-white dark:bg-blue-600"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
            )}
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDeviceView("tablet")}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors",
              deviceView === "tablet"
                ? "bg-blue-700 text-white dark:bg-blue-600"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
            )}
          >
            <Tablet className="h-4 w-4" />
            Tablet
          </button>
          <button
            type="button"
            onClick={() => setDeviceView("mobile")}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors",
              deviceView === "mobile"
                ? "bg-blue-700 text-white dark:bg-blue-600"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
            )}
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </button>
        </div>
      </div>

      {/* Snapshot: full width, rounded-lg, device width applied like Step 3 */}
      <div
        className={cn(
          "mx-auto overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all dark:border-gray-700 dark:bg-[#2D2D2D]",
          deviceWidths[deviceView],
        )}
      >
        <EmailPreviewIFrame
          innerHTML={html}
          showOpenInNewTab={false}
          className="h-96 w-full border-0"
        />
      </div>
    </section>
  );
}
