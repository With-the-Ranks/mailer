"use client";

import { CreditCard, FileText, Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

import { createEmail } from "@/lib/actions";
import blankJson from "@/lib/email-templates/json/blank.json";
import donationJson from "@/lib/email-templates/json/donation.json";
import signupJson from "@/lib/email-templates/json/signup.json";
import { cn } from "@/lib/utils";

import { Input } from "../ui/input";
import { useModal } from "./provider";

interface TemplateRecord {
  id: string;
  name: string;
  content: any;
}

export default function CreateEmailModal({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const modal = useModal();

  const predefinedTemplates: TemplateRecord[] = [
    { id: "signup", name: "Signup", content: signupJson },
    { id: "donation", name: "Donation", content: donationJson },
    { id: "blank", name: "Blank", content: blankJson },
  ];

  const [data, setData] = useState({
    campaignName: "",
    template: "signup",
  });
  const [templateContent, setTemplateContent] = useState<string>(
    JSON.stringify(predefinedTemplates[0].content),
  );
  const [isPending, setIsPending] = useState(false);

  React.useEffect(() => {
    const tpl =
      predefinedTemplates.find((t) => t.id === data.template) ||
      predefinedTemplates[0];
    setTemplateContent(JSON.stringify(tpl.content));
  }, [data.template]);

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    if (!templateContent) {
      toast.error("Template content not loaded yet.");
      setIsPending(false);
      return;
    }

    try {
      const email = await createEmail(
        data.campaignName,
        organizationId,
        data.template,
        templateContent,
      );
      if ("error" in email) {
        toast.error(email.error);
      } else {
        toast.success("Successfully created email!");
        modal?.hide();
        router.push(`/email/${email.id}/editor`);
      }
    } catch {
      toast.error("An error occurred while creating the email.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateEmail}
      className={cn(
        "w-full rounded-md bg-white dark:bg-black md:max-w-md",
        "md:border md:border-stone-200 md:shadow-sm dark:md:border-stone-700",
      )}
    >
      <div className="space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">
          Create a new email
        </h2>

        {/* Campaign Name */}
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="campaignName"
            className="text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            Campaign Name
          </label>
          <Input
            id="campaignName"
            name="campaignName"
            placeholder="Campaign Name"
            value={data.campaignName}
            onChange={(e) => setData({ ...data, campaignName: e.target.value })}
            required
          />
        </div>

        {/* Template Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Template
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {predefinedTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setData({ ...data, template: tpl.id })}
                className={cn(
                  "flex h-24 flex-col items-center justify-center rounded-md border border-stone-200 bg-white p-4 shadow-xs transition-colors hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600",
                  data.template === tpl.id &&
                    "border-2 border-black dark:border-white",
                )}
              >
                {tpl.id === "signup" && (
                  <FileText className="mb-2 h-6 w-6 text-stone-600 dark:text-stone-400" />
                )}
                {tpl.id === "donation" && (
                  <CreditCard className="mb-2 h-6 w-6 text-stone-600 dark:text-stone-400" />
                )}
                {tpl.id === "blank" && (
                  <PlusCircle className="mb-2 h-6 w-6 text-stone-600 dark:text-stone-400" />
                )}
                <span className="text-sm font-medium">{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end space-x-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <button
          type="submit"
          className={cn("btn", isPending && "cursor-not-allowed opacity-50")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Create Email"
          )}
        </button>
      </div>
    </form>
  );
}
