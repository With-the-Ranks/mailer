"use client";

import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";

import { useModal } from "@/components/modal/provider";

export default function CreateAudienceButton({
  children,
}: {
  children: ReactNode;
}) {
  const modal = useModal();

  return (
    <button
      onClick={() => modal?.show(children)}
      className="flex items-center justify-center space-x-2 rounded-lg border border-black px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-black hover:text-white active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      <PlusIcon className="mr-2 h-4 w-4" />
      Add Entry
    </button>
  );
}
