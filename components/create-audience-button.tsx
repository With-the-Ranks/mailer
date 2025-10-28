"use client";

import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";

import { useModal } from "@/components/modal/provider";
import { Button } from "@/components/ui/button";

export default function CreateAudienceButton({
  children,
}: {
  children: ReactNode;
}) {
  const modal = useModal();

  return (
    <Button
      onClick={() => modal?.show(children)}
      className="flex items-center"
      aria-label="Add Entry"
    >
      <PlusIcon className="mr-0 h-4 w-4 2xl:mr-2" aria-hidden="true" />
      <span className="hidden lg:inline">Add Entry</span>
    </Button>
  );
}
