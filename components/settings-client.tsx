"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import Form from "@/components/form";
import { Button } from "@/components/ui/button";
import { updateOrganization } from "@/lib/actions";

interface DomainOption {
  value: string;
  label: string;
}

interface Organization {
  id: string;
  emailApiKey?: string | null;
  activeDomain?: {
    id: string;
  } | null;
}

export default function ClientSettingsForm({
  data,
  domainOptions,
}: {
  data: Organization;
  domainOptions: DomainOption[];
}) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(data?.emailApiKey ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const toggleKeyVisibility = () => setShowKey((prev) => !prev);
  const domain = process.env.EMAIL_DOMAIN;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append("emailApiKey", apiKey);

    try {
      const result = await updateOrganization(formData, data.id, "emailApiKey");
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("API key updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update API key");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col space-y-6">
      <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-black">
        <h2 className="mb-1 text-xl font-semibold dark:text-white">
          Email API Key
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Optional. Overrides the global{" "}
          <code className="rounded-sm bg-stone-100 px-1 text-xs dark:bg-stone-800">
            RESEND_API_KEY
          </code>
          .
        </p>
        <div className="my-2 flex items-center space-x-3">
          <a
            href="https://resend.com/api-keys"
            target="_blank"
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            Create an API key
          </a>
          <span className="text-stone-300 dark:text-stone-600">|</span>
          <a
            href="https://resend.com/docs/api-reference/api-keys/create-api-key"
            target="_blank"
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            API docs
          </a>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            name="emailApiKey"
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="re_abc123..."
            disabled={isSaving}
            className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleKeyVisibility}
            className="h-9 w-9"
            aria-label={showKey ? "Hide API key" : "Show API key"}
            disabled={isSaving}
          >
            {showKey ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            aria-label={isSaving ? "Saving" : "Save API key"}
          >
            {isSaving ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </form>
      </div>

      <Form
        title="Active Sending Domain"
        description={`Select the domain used to send emails. If none selected, defaults to ${domain}`}
        helpText={
          domainOptions.length === 0
            ? "No verified domains yet. Add one via backend or admin interface."
            : "Choose a verified domain. Locked unless a custom API key is set."
        }
        inputAttrs={{
          name: "activeDomainId",
          type: "select",
          defaultValue: data?.activeDomain?.id ?? "",
          options: [
            { value: "default", label: `Default (${domain})` },
            ...domainOptions,
          ],
        }}
        handleSubmit={updateOrganization}
        // disabled={!apiKey.trim()}
      />
    </div>
  );
}
