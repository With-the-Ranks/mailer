"use client";

import type { ReactNode } from "react";

import { useModal } from "@/components/modal/provider";

export default function CreateAudienceListButton({
  children,
}: {
  children: ReactNode;
}) {
  const modal = useModal();

  return (
    <button onClick={() => modal?.show(children)} className="btn">
      Create New List
    </button>
  );
}
