"use client";

import "@maily-to/core/style.css";

import { Editor as MailyEditor } from "@maily-to/core";
import {
  getVariableSuggestions,
  VariableExtension,
  ImageUploadExtension,
} from "@maily-to/core/extensions";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createDefaultBlocks } from "@/lib/maily-blocks/default-blocks";
import * as signupBlocks from "@/lib/maily-blocks/signup-block";
import type { SignupForm } from "@/lib/maily-blocks/types";
import { Input } from "@/components/ui/input";
import { useWizard } from "./wizard-context";
import { TemplateSelector } from "./template-selector";
import { HelpSidebar } from "./help-sidebar";

function isNonEmptyContent(raw: string | null | undefined): boolean {
  if (!raw) return false;
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    return !!(o?.content && Array.isArray(o.content) && o.content.length > 0);
  } catch {
    return false;
  }
}

interface Step1CreateProps {
  organizationData?: {
    subdomain: string | null;
    logo: string | null;
    image: string | null;
  } | null;
}

export function Step1Create({ organizationData }: Step1CreateProps) {
  const { formData, updateFormData, organizationId } = useWizard();
  const [hydrated, setHydrated] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [signupForms, setSignupForms] = useState<SignupForm[]>([]);
  const [contentObj, setContentObj] = useState<any>(() => {
    try {
      return formData.content
        ? JSON.parse(formData.content)
        : { type: "doc", content: [] };
    } catch {
      return { type: "doc", content: [] };
    }
  });

  const [editorVars] = useState<{ name: string; required: boolean }[]>([
    { name: "first_name", required: false },
    { name: "last_name", required: false },
    { name: "email", required: false },
  ]);

  // Fetch signup forms for the current organization
  useEffect(() => {
    const fetchSignupForms = async () => {
      if (!organizationId) return;

      try {
        const response = await fetch(
          `/api/signup-forms?organizationId=${organizationId}`,
        );
        if (response.ok) {
          const forms = await response.json();
          setSignupForms(forms);
        }
      } catch (error) {
        console.error("Failed to fetch signup forms:", error);
      }
    };

    fetchSignupForms();
  }, [organizationId]);

  // Ensure content is synced when formData changes (but don't reset hydration if editor is already loaded)
  useEffect(() => {
    if (formData.template && formData.content && hydrated) {
      try {
        const parsed =
          typeof formData.content === "string"
            ? JSON.parse(formData.content)
            : formData.content;

        // Only update contentObj if it's different (but keep hydrated true)
        const currentStr = JSON.stringify(contentObj);
        const newStr = JSON.stringify(parsed);

        if (currentStr !== newStr) {
          setContentObj(parsed);
        }
      } catch (error) {
        console.error("Failed to parse content:", error);
      }
    }
  }, [formData.content, hydrated]);

  // Create comprehensive blocks array with Maily blocks plus signup form blocks
  const blocks = useMemo(() => {
    const signupFormBlocks = signupBlocks.createSignupFormBlocks(signupForms);
    const defaultBlocks = createDefaultBlocks(organizationData || undefined);

    const finalBlocks = [
      {
        title: "Blocks",
        commands: defaultBlocks,
      },
      ...(signupFormBlocks.length > 0
        ? [
            {
              title: "Signup Forms",
              commands: signupFormBlocks,
            },
          ]
        : []),
    ];

    return finalBlocks;
  }, [signupForms, organizationData]);

  const handleTemplateSelect = (
    templateId: string,
    templateContent: string,
  ) => {
    try {
      // Parse and validate the template content
      const parsed =
        typeof templateContent === "string"
          ? JSON.parse(templateContent)
          : templateContent;

      // Validate parsed content
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid template content");
      }

      // Update form data first (this triggers the useEffect)
      updateFormData({
        template: templateId,
        content:
          typeof templateContent === "string"
            ? templateContent
            : JSON.stringify(templateContent),
      });

      // Then update local state
      setContentObj(parsed);
      setHydrated(false);
      setEditorKey((prev) => prev + 1);

      // Fallback: if onCreate doesn't fire within 2 seconds, set hydrated to true
      setTimeout(() => {
        setHydrated((prev) => {
          if (!prev) {
            console.log("Editor hydration fallback triggered");
            return true;
          }
          return prev;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to parse template content:", error);
      // Fallback to empty content
      setContentObj({ type: "doc", content: [] });
      setHydrated(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Main Content Area */}
      <div className="px-6 pb-6">
        {/* Email Details Section - Separated with border-radius-lg */}
        <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Email Name */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="campaign-name"
              className="w-32 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Name
              <span className="ml-0.5 text-red-500">*</span>
            </label>
            <div className="flex flex-1 items-center justify-between gap-2">
              <Input
                id="campaign-name"
                type="text"
                placeholder="e.g., Organizing Kickoff"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="flex-1 border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                required
                autoFocus
              />
              <HelpSidebar />
            </div>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="subject"
              className="w-32 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Subject
              <span className="ml-0.5 text-red-500">*</span>
            </label>
            <Input
              id="subject"
              type="text"
              placeholder="Email Subject"
              value={formData.subject}
              onChange={(e) => updateFormData({ subject: e.target.value })}
              className="flex-1 border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
              required
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="preview-text"
              className="w-32 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Preview
            </label>
            <Input
              id="preview-text"
              type="text"
              placeholder="This appears in the inbox preview..."
              value={formData.previewText}
              onChange={(e) => updateFormData({ previewText: e.target.value })}
              className="flex-1 border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
            />
          </div>

          {/* From Name */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="from-name"
              className="w-32 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              From Name
              <span className="ml-0.5 text-red-500">*</span>
            </label>
            <Input
              id="from-name"
              type="text"
              placeholder="With The Ranks"
              value={formData.from}
              onChange={(e) => updateFormData({ from: e.target.value })}
              className="flex-1 border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
              required
            />
          </div>

          {/* Reply-To */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="reply-to"
              className="w-32 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Reply-To
            </label>
            <Input
              id="reply-to"
              type="email"
              placeholder="noreply@example.com"
              value={formData.replyTo}
              onChange={(e) => updateFormData({ replyTo: e.target.value })}
              className="flex-1 border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Template Selector Section */}
        {!formData.template && !isNonEmptyContent(formData.content) && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <TemplateSelector
              selectedTemplate={formData.template}
              onTemplateSelect={handleTemplateSelect}
            />
          </div>
        )}

        {/* Email Content Editor - when template is set OR we have saved content (reopening a draft) */}
        {(formData.template || isNonEmptyContent(formData.content)) && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Content
              </label>
              <div className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                {!hydrated && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Loading editor...
                      </span>
                    </div>
                  </div>
                )}
                <MailyEditor
                  config={{
                    hasMenuBar: false,
                    wrapClassName: "editor-wrap",
                    bodyClassName: "!mt-0 !border-0 !p-0",
                    contentClassName: "editor-content mx-auto",
                    toolbarClassName: "flex-wrap !items-start",
                    spellCheck: false,
                    autofocus: false,
                  }}
                  contentJson={contentObj}
                  blocks={blocks as any}
                  extensions={[
                    VariableExtension.configure({
                      suggestion: getVariableSuggestions("@"),
                      variables: editorVars,
                    }),
                    ImageUploadExtension.configure({
                      onImageUpload: async (file: Blob) => {
                        const uploadFormData = new FormData();
                        uploadFormData.append("file", file);

                        const response = await fetch("/api/upload", {
                          method: "POST",
                          body: uploadFormData,
                        });

                        if (!response.ok) {
                          throw new Error("Failed to upload image");
                        }

                        const blob = await response.json();
                        return blob.url;
                      },
                    }),
                  ]}
                  key={`editor-${formData.template || "saved"}-${editorKey}`}
                  onCreate={() => {
                    setHydrated(true);
                  }}
                  onUpdate={(editor) => {
                    const updated = editor.getJSON();
                    const updatedStr = JSON.stringify(updated);
                    setContentObj(updated);
                    updateFormData({ content: updatedStr });
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  updateFormData({
                    template: null,
                    content: JSON.stringify({ type: "doc", content: [] }),
                  });
                  setContentObj({ type: "doc", content: [] });
                  setHydrated(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Change template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
