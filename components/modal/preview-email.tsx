"use client";

import { X } from "lucide-react";
import React from "react";

import { useModal } from "./provider";

interface PreviewEmailProps {
  html: string;
}

export default function EmailPreview({ html }: PreviewEmailProps) {
  const modal = useModal();
  if (!modal) return null;

  const openModal = () => {
    modal.show(
      <div
        className="fixed inset-0 z-10001 flex items-center justify-center bg-black/50 p-4"
        onClick={() => modal.hide()}
      >
        <div
          className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => modal.hide()}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close preview"
          >
            <X size={24} />
          </button>
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>,
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold dark:text-white">
          Email Snapshot
        </h2>
        <button
          onClick={openModal}
          className="text-base font-medium text-indigo-600 hover:underline"
        >
          View Full Preview
        </button>
      </div>

      {/* Snapshot card */}
      <div className="mx-auto max-h-96 max-w-xl overflow-auto rounded-lg border bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </section>
  );
}
