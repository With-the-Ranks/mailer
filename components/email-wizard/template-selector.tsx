"use client";

import { CreditCard, FileText, PlusCircle, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import blankJson from "@/lib/email-templates/json/blank.json";
import donationJson from "@/lib/email-templates/json/donation.json";
import signupJson from "@/lib/email-templates/json/signup.json";

interface TemplateRecord {
  id: string;
  name: string;
  content: any;
  icon: React.ComponentType<{ className?: string }>;
}

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string, templateContent: string) => void;
}

const templates: TemplateRecord[] = [
  { id: "signup", name: "Signup", content: signupJson, icon: FileText },
  { id: "donation", name: "Donation", content: donationJson, icon: CreditCard },
  { id: "blank", name: "Blank", content: blankJson, icon: PlusCircle },
];

export function TemplateSelector({
  selectedTemplate,
  onTemplateSelect,
}: TemplateSelectorProps) {
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const handleTemplateClick = async (template: TemplateRecord) => {
    if (loadingTemplate) return; // Prevent multiple clicks

    setLoadingTemplate(template.id);

    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 100));

      const contentString = JSON.stringify(template.content);
      onTemplateSelect(template.id, contentString);
    } catch (error) {
      console.error("Failed to load template:", error);
    } finally {
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Choose a template
      </label>
      <div className="grid grid-cols-3 gap-3">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;
          const isLoading = loadingTemplate === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateClick(template)}
              disabled={isLoading || isSelected}
              className={cn(
                "flex h-28 flex-col items-center justify-center rounded-lg border-2 p-4 transition-all",
                "hover:border-blue-300 hover:shadow-md dark:hover:border-blue-600",
                isSelected
                  ? "border-blue-700 bg-blue-700 text-white shadow-lg dark:border-blue-600 dark:bg-blue-600"
                  : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-[#2D2D2D] dark:text-gray-300",
                (isLoading || isSelected) && "cursor-not-allowed opacity-75",
              )}
            >
              {isLoading ? (
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <Icon
                  className={cn(
                    "mb-2 h-8 w-8",
                    isSelected
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-400",
                  )}
                />
              )}
              <span className="text-sm font-medium">{template.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
