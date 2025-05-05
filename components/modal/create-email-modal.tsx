"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { createEmail } from "@/lib/actions";
import { getTemplates } from "@/lib/actions/template";
import { cn } from "@/lib/utils";

import { AudienceListDropdown } from "../audience-list-dropdown";
import { ScrollableTemplateSelect } from "../select-template";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useModal } from "./provider";

interface Option {
  value: string;
  label: string;
}

export default function CreateEmailModal({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const modal = useModal();

  const builtInOptions: Option[] = [
    { value: "signup", label: "Signup" },
    { value: "donation", label: "Donation" },
  ];

  const [templateOptions, setTemplateOptions] =
    useState<Option[]>(builtInOptions);
  const [data, setData] = useState({
    campaignName: "",
    selectedAudienceList: null as string | null,
    template: "signup",
  });
  const [isPending, setIsPending] = useState(false);

  // load org templates + merge with built-ins
  useEffect(() => {
    getTemplates(organizationId).then((list) => {
      const org = list.map((t) => ({ value: t.id, label: t.name }));
      setTemplateOptions([...builtInOptions, ...org]);
    });
  }, [organizationId]);

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    if (!data.selectedAudienceList) {
      toast.error("Please select an audience list.");
      setIsPending(false);
      return;
    }
    if (!data.template) {
      toast.error("Please select a template.");
      setIsPending(false);
      return;
    }

    try {
      const email = await createEmail(
        data.campaignName,
        organizationId,
        data.selectedAudienceList,
        data.template,
      );
      if ("error" in email) {
        toast.error(email.error);
      } else {
        toast.success("Successfully created email!");
        modal?.hide();
        router.push(`/email/${email.id}`);
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
        "md:border md:border-stone-200 md:shadow dark:md:border-stone-700",
      )}
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
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

        {/* Audience List */}
        <AudienceListDropdown
          selectedAudienceList={data.selectedAudienceList}
          setSelectedAudienceList={(value) =>
            setData({ ...data, selectedAudienceList: value })
          }
          organizationId={organizationId}
        />

        {/* Template Picker */}
        <Label className="flex items-center font-normal">
          <span className="w-40 shrink-0 font-normal text-gray-600">
            Template
          </span>
          <div className="grow">
            <ScrollableTemplateSelect
              templates={templateOptions.map((t) => ({
                id: t.value,
                name: t.label,
              }))}
              selectedTemplateId={data.template}
              onSelect={(id) => setData((prev) => ({ ...prev, template: id }))}
              onDelete={(id) => {
                const updated = templateOptions.filter(
                  (tpl) => tpl.value !== id,
                );
                setTemplateOptions(updated);

                const fallback = updated[0]?.value || "signup";
                setData((prev) => ({ ...prev, template: fallback }));
              }}
            />
          </div>
        </Label>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <button
          type="submit"
          className={cn("btn", isPending && "cursor-not-allowed opacity-50")}
          disabled={isPending}
        >
          {isPending ? <LoadingDots color="#FFFCF7" /> : "Create Email"}
        </button>
      </div>
    </form>
  );
}
