"use client";

import type { ReactNode } from "react";

import { useModal } from "@/components/modal/provider";
import { Button } from "@/components/ui/button";

export default function CreateOrganizationButton({
  children,
}: {
  children: ReactNode;
}) {
  const modal = useModal();
  return (
    <Button
      onClick={() => modal?.show(children)}
      aria-label="Create New Organization"
    >
      Create New Organization
    </Button>
  );
}
