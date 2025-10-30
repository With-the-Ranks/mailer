"use client";

interface SegmentsHeaderProps {
  orgId: string;
}

export function SegmentsHeader({ orgId }: SegmentsHeaderProps) {
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
