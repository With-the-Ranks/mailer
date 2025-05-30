"use client";

import { EyeIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { EmailPreviewIFrame } from "./email-preview-iframe";

type EmailPreviewButtonProps = {
  fromName: string;
  subject: string;
  previewText: string;
  editor: any;
};

export function EmailPreviewButton(props: EmailPreviewButtonProps) {
  const { subject, previewText, editor, fromName } = props;

  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handlePreview = async () => {
    if (!editor) {
      toast.error("No email content to preview");
      return;
    }

    setIsPending(true);
    setHtml("");

    try {
      // grab your JSON tree straight from the editor
      const json =
        typeof editor.getJSON === "function" ? editor.getJSON() : editor;

      const res = await fetch("/api/emails/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: json,
          previewText,
        }),
      });

      if (!res.ok) {
        throw new Error(`Preview failed: ${res.statusText}`);
      }

      const { html: rendered } = (await res.json()) as { html: string };
      setHtml(rendered);
      setOpen(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to preview email");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="btn flex items-center gap-1 text-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePreview();
          }}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2Icon className="inline-block size-4 shrink-0 animate-spin" />
          ) : (
            <EyeIcon className="inline-block size-4 shrink-0" />
          )}
          <span>Preview</span>
        </button>
      </DialogTrigger>

      {open && (
        <DialogContent className="z-[99999] flex max-w-[620px] flex-col border-none bg-transparent p-0 shadow-none max-[680px]:h-full max-[680px]:border-0 max-[680px]:p-2">
          <div className="flex flex-col gap-4">
            <div className="shadow-xs flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-sm">
                W
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-medium">{fromName}</h3>
                <h4 className="text-sm">
                  {subject || "Your Subject Goes Here"}
                </h4>
                <p className="text-sm text-gray-500">
                  {previewText ||
                    "This is a preview text of your email, that will be shown in the inbox preview..."}
                </p>
              </div>
            </div>

            <div className="shadow-xs flex min-h-[75vh] w-full grow overflow-hidden rounded-xl border border-gray-200 bg-white">
              <EmailPreviewIFrame
                wrapperClassName="w-full"
                className="h-full w-full grow"
                innerHTML={html}
              />
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
