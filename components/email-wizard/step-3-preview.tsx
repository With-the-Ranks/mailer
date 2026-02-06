"use client";

import { Monitor, Smartphone, Tablet, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmailPreviewIFrame } from "@/components/email-preview-iframe";
import { useWizard } from "./wizard-context";

type DeviceView = "desktop" | "tablet" | "mobile";

export function Step3Preview() {
  const { formData, organizationId } = useWizard();
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      try {
        // Parse content JSON
        const contentJson = formData.content
          ? JSON.parse(formData.content)
          : { type: "doc", content: [] };

        const res = await fetch("/api/emails/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: contentJson,
            previewText: formData.previewText,
            audienceListId: formData.audienceListId,
            organizationId,
          }),
        });

        if (!res.ok) {
          throw new Error(`Preview failed: ${res.statusText}`);
        }

        const { html: rendered } = (await res.json()) as { html: string };
        setHtml(rendered);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load preview");
        console.error("Preview error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [
    formData.content,
    formData.previewText,
    formData.audienceListId,
    organizationId,
  ]);

  const deviceWidths = {
    desktop: "max-w-full",
    tablet: "max-w-2xl",
    mobile: "max-w-sm",
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl bg-transparent px-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-start">
            {/* Device Toggle */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
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

          {/* Email Preview Card (sender info) */}
          <div className="shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {formData.from?.[0]?.toUpperCase() || "W"}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {formData.from || "With The Ranks"}
                  </h3>
                  {formData.replyTo && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Reply-To: {formData.replyTo}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-medium text-gray-700 dark:text-gray-300">
                  {formData.subject || "Your Subject Goes Here"}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.previewText ||
                    "This is a preview text of your email, that will be shown in the inbox preview..."}
                </p>
              </div>
            </div>
          </div>

          {/* Email HTML Preview */}
          <div
            className={cn("mx-auto transition-all", deviceWidths[deviceView])}
          >
            <div className="h-full rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              {loading ? (
                <div className="flex min-h-[600px] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Loading preview...
                    </p>
                  </div>
                </div>
              ) : html ? (
                <EmailPreviewIFrame
                  wrapperClassName="w-full"
                  className="min-h-[700px] w-full"
                  innerHTML={html}
                />
              ) : (
                <div className="flex min-h-[700px] items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>No preview available</p>
                    <p className="text-sm">
                      Add content to your email to see a preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
