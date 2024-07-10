"use client";

import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useState } from "react";

import LoadingDots from "@/components/icons/loading-dots";
import { createAudienceList } from "@/lib/actions/audience-list";
import { cn } from "@/lib/utils";

export default function CreateAudienceButton() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCreateList = async () => {
    const formData = new FormData();
    formData.append("name", `New Audience List`);
    formData.append("description", "Description for the new audience list.");
    formData.append("organizationId", id);

    const newList = await createAudienceList(formData);
    if ("error" in newList) {
      setError(newList.error);
      return null;
    }
    return newList;
  };

  return (
    <div>
      <button
        onClick={() =>
          startTransition(async () => {
            try {
              const newList = await handleCreateList();
              if (newList) {
                router.refresh();
                router.push(`/audience/${newList.id}`);
              }
            } catch (error) {
              console.error(error);
            }
          })
        }
        className={cn(
          "flex h-8 w-36 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none sm:h-9",
          isPending
            ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
        )}
        disabled={isPending}
      >
        {isPending ? <LoadingDots color="#808080" /> : <p>Create New List</p>}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
