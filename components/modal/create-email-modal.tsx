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

interface TemplateRecord {
  id: string;
  name: string;
  content: any; // Json
}

export default function CreateEmailModal({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const modal = useModal();

  const [templatesList, setTemplatesList] = useState<TemplateRecord[]>([]);
  const [templateOptions, setTemplateOptions] = useState<Option[]>([]);
  const [data, setData] = useState({
    campaignName: "New Email Campaign",
    selectedAudienceList: null as string | null,
    template: "",
  });
  const [templateContent, setTemplateContent] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    getTemplates(organizationId).then((list) => {
      setTemplatesList(list as TemplateRecord[]);

      const opts = list.map((t) => ({ value: t.id, label: t.name }));
      setTemplateOptions(opts);

      if (list.length > 0) {
        const first = list[0];
        setData((prev) => ({
          ...prev,
          template: prev.template || first.id,
        }));
        setTemplateContent(JSON.stringify(first.content));
      }
    });
  }, [organizationId]);

  useEffect(() => {
    if (!data.template) {
      setTemplateContent("");
      return;
    }
    const tpl = templatesList.find((t) => t.id === data.template);
    if (tpl) {
      setTemplateContent(JSON.stringify(tpl.content));
    }
  }, [data.template, templatesList]);

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    if (!data.selectedAudienceList) {
      toast.error("Please select an audience list.");
      setIsPending(false);
      return;
    }

    if (!templateContent) {
      toast.error("Template content not loaded yet.");
      setIsPending(false);
      return;
    }

    try {
      const email = await createEmail(
        data.campaignName,
        organizationId,
        data.selectedAudienceList,
        data.template,
        templateContent,
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

        {/* Audience List */}
        <AudienceListDropdown
          selectedAudienceList={data.selectedAudienceList}
          setSelectedAudienceList={(val) =>
            setData({ ...data, selectedAudienceList: val })
          }
          organizationId={organizationId}
        />

        {/* Template Picker */}
        <Label className="flex items-center font-normal">
          <span className="w-40 shrink-0 text-gray-600">Template</span>
          <div className="grow">
            <ScrollableTemplateSelect
              templates={templateOptions.map((t) => ({
                id: t.value,
                name: t.label,
              }))}
              selectedTemplateId={data.template}
              onSelect={(id) => setData((prev) => ({ ...prev, template: id }))}
              onDelete={(deletedId) => {
                // remove from both lists
                const remainingList = templatesList.filter(
                  (t) => t.id !== deletedId,
                );
                const remainingOpts = templateOptions.filter(
                  (o) => o.value !== deletedId,
                );
                setTemplatesList(remainingList);
                setTemplateOptions(remainingOpts);
                // pick a new default
                const fallback = remainingList[0]?.id || "";
                setData((prev) => ({ ...prev, template: fallback }));
              }}
            />
          </div>
        </Label>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end space-x-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <button
          type="button"
          onClick={modal?.hide}
          className="btn-outline btn-sm btn"
        >
          Cancel
        </button>
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
