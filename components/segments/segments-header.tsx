"use client";

import { DownloadIcon, FilterIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface SegmentsHeaderProps {
  orgId: string;
}

export function SegmentsHeader({ orgId }: SegmentsHeaderProps) {
  const router = useRouter();

  const handleNewSegment = () => {
    // Navigate to a create segment page for this organization
    router.push(`/organization/${orgId}/segments/new`);
    // Or open a modal, etc.
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Segmentation & Targeting
        </h2>
        <p className="text-muted-foreground">
          Manage and organize your organization&apos;s segments
        </p>
      </div>
    </div>
  );
}
