"use client";

import { Maily } from "@maily-to/render";
import { useEffect, useState } from "react";

import { Input } from "./../ui/input";

interface PreviewModalProps {
  content: string; // raw JSON content to be rendered
  previewText?: string; // optional preview text for the email
  onCancel: () => void;
  onConfirm: () => void;
  onSendTest: (_email: string) => void;
}

export function PreviewModal({
  content,
  previewText,
  onCancel,
  onConfirm,
  onSendTest,
}: PreviewModalProps) {
  const [testEmail, setTestEmail] = useState("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function renderEmail() {
      setLoading(true);
      try {
        const jsonContent = JSON.parse(content);
        const maily = new Maily(jsonContent);
        if (previewText) {
          maily.setPreviewText(previewText);
        }
        const html = await maily.render();
        setRenderedHtml(html);
      } catch (error) {
        console.error("Error rendering email content", error);
        setRenderedHtml("<p>Error rendering email content.</p>");
      } finally {
        setLoading(false);
      }
    }
    renderEmail();
  }, [content, previewText]);

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full rounded-md bg-white dark:bg-black md:max-w-3xl md:border md:border-stone-200 md:shadow dark:md:border-stone-700">
        {/* Content Area */}
        <div className="flex flex-col space-y-4 p-5 md:p-10">
          <h2 className="mb-4 font-cal text-2xl dark:text-white">
            Preview Email
          </h2>
          {/* Email Preview */}
          <div className="mb-6 max-h-96 overflow-y-auto rounded-md border bg-stone-50 p-4 dark:bg-stone-800">
            {loading ? (
              <div className="text-center text-sm text-stone-500 dark:text-stone-400">
                Loading preview...
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            )}
          </div>
          {/* Test Email Input */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-stone-500 dark:text-stone-400">
              Send Test Email
            </label>
            <div className="flex">
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <button
                onClick={() => {
                  if (testEmail) {
                    onSendTest(testEmail);
                  }
                }}
                disabled={!testEmail}
                className="btn ml-2"
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
        {/* Footer Area */}
        <div className="flex items-center justify-end rounded-b-md border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
          <button onClick={onCancel} className="btn-outline btn-sm btn mr-2">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-sm btn">
            Confirm &amp; Send
          </button>
        </div>
      </div>
    </div>
  );
}
