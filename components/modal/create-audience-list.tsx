"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { createAudienceList } from "@/lib/actions/audience-list";
import { cn } from "@/lib/utils";

import { useModal } from "./provider";

export default function CreateAudienceModal({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const modal = useModal();
  const [data, setData] = useState({
    name: "",
    description: "",
    organizationId,
  });
  const [isPending, setIsPending] = useState(false);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("organizationId", data.organizationId);

    const newList = await createAudienceList(formData);
    setIsPending(false);

    if ("error" in newList) {
      toast.error(newList.error);
      return;
    }

    toast.success(`Successfully created audience list!`);
    modal?.hide();
    router.refresh();
    router.push(`/audience/${newList.id}`);
  };

  return (
    <form
      onSubmit={handleCreateList}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">
          Create a new audience list
        </h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            List Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="New Audience List"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            maxLength={32}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-stone-500"
          >
            Description
          </label>
          <textarea
            name="description"
            placeholder="Description for the new audience list."
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            maxLength={140}
            rows={3}
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <button
          type="submit"
          className={cn(
            "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
            isPending
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
          )}
          disabled={isPending}
        >
          {isPending ? <LoadingDots color="#808080" /> : <p>Create List</p>}
        </button>
      </div>
    </form>
  );
}
