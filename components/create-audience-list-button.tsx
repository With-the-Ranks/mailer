"use client";

import type { ReactNode } from "react";

import { useModal } from "@/components/modal/provider";
import { Button } from "@/components/ui/button";

export default function CreateAudienceListButton({
  children,
}: {
  children: ReactNode;
}) {
  const modal = useModal();

  return (
    <Button onClick={() => modal?.show(children)} aria-label="Create New List">
      Create New List
    </Button>
  );
}
