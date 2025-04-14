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
      className="btn flex items-center"
    >
      <PlusIcon className="mr-0 h-4 w-4 2xl:mr-2" />
      <span className="hidden 2xl:inline">Add Entry</span>
    </button>
  );
}
