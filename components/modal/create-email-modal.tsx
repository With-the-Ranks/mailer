"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { createEmail } from "@/lib/actions";
import { cn } from "@/lib/utils";

import { AudienceListDropdown } from "../audience-list-dropdown";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useModal } from "./provider";

export default function CreateEmailModal({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const modal = useModal();
  const [data, setData] = useState({
    campaignName: "",
    selectedAudienceList: null as string | null,
    template: null as string | null,
  });
  const [isPending, setIsPending] = useState(false);

  const templateOptions = [
    { value: "signup", label: "Signup" },
    { value: "donation", label: "Donation" },
  ];

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
    } catch (error) {
      toast.error("An error occurred while creating the email.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateEmail}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">
          Create a new email
        </h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="campaignName"
            className="text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            Campaign Name
          </label>
          <Input
            name="campaignName"
            type="text"
            placeholder="Campaign Name"
            value={data.campaignName}
            onChange={(e) => setData({ ...data, campaignName: e.target.value })}
            required
          />
        </div>

        <AudienceListDropdown
          selectedAudienceList={data.selectedAudienceList}
          setSelectedAudienceList={(value) =>
            setData({ ...data, selectedAudienceList: value })
          }
          organizationId={organizationId}
        />

        <Label className="flex items-center font-normal">
          <span className="w-40 shrink-0 font-normal text-gray-600">
            Template
          </span>
          <Select
            className="h-auto grow rounded-none border-x-0 border-gray-300 px-0 py-2.5 text-base focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => setData({ ...data, template: e ? e.value : null })}
            placeholder="Select a template"
            options={templateOptions}
            isSearchable={false}
            isClearable={false}
          />
        </Label>
      </div>

      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <button
          type="submit"
          className={cn("btn", isPending && "cursor-not-allowed opacity-50")}
          disabled={isPending}
        >
          {isPending ? (
            <LoadingDots color="#FFFCF7" />
          ) : (
            <span>Create Email</span>
          )}
        </button>
      </div>
    </form>
  );
}
