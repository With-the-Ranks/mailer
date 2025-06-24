"use client";

import { DownloadIcon, FilterIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SegmentsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Segments</h2>
        <p className="text-muted-foreground">
          Manage and organize your contact segments
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <FilterIcon className="mr-2 h-4 w-4" />
          Filter Segments
        </Button>
        <Button variant="outline" size="sm">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          New Segment
        </Button>
      </div>
    </div>
  );
}
