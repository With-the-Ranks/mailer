"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import Form from "@/components/form";
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

  const toggleKeyVisibility = () => setShowKey((prev) => !prev);
  const domain = process.env.EMAIL_DOMAIN;

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
        <form
          action={async (formData) => {
            await updateOrganization(formData, data.id, "emailApiKey");
          }}
          className="flex items-center space-x-2"
        >
          <input
            name="emailApiKey"
            type={showKey ? "text" : "password"}
            defaultValue={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="re_abc123..."
            className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-hidden focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
          <button
            type="button"
            onClick={toggleKeyVisibility}
            className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-white"
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button type="submit" className="btn text-sm">
            Save
          </button>
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
