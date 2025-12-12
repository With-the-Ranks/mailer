"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import * as React from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Segment {
  id: string;
  name: string;
  description?: string;
  contactCount?: number;
  audienceList?: { id: string; name: string };
}

interface SegmentDropdownProps {
  value: string | null;
  onChange: (id: string | null) => void;
  organizationId: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function SegmentDropdown({
  value,
  onChange,
  organizationId,
  disabled = false,
  required = false,
  className = "",
}: SegmentDropdownProps) {
  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/segments?organizationId=${organizationId}`)
      .then((r) => r.json())
      .then((d) => setSegments(d))
      .catch(() => setSegments([]))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const selectedValue = value ?? "__ALL__";

  return (
    <Label className={`flex items-center font-normal ${className}`}>
      <div className="w-full">
        <Select
          value={selectedValue}
          onValueChange={(val) => onChange(val === "__ALL__" ? null : val)}
          disabled={disabled || loading}
          required={required}
        >
          <SelectTrigger className="h-auto w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base shadow-xs transition-colors hover:bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-hidden">
            <SelectValue
              placeholder={
                loading ? "Loading segments..." : "Select a segment…"
              }
            />
            {loading && (
              <Loader2 className="text-muted-foreground absolute right-2 h-4 w-4 animate-spin" />
            )}
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            className="z-10000001 max-h-[300px] overflow-y-auto bg-white"
          >
            <SelectGroup>
              <SelectItem value="__ALL__">No segment (All contacts)</SelectItem>
              {segments.length > 0 ? (
                segments.map((seg) => (
                  <SelectItem key={seg.id} value={seg.id}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{seg.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {seg.contactCount ?? 0} contacts
                        {seg.audienceList?.name
                          ? ` • ${seg.audienceList.name}`
                          : ""}
                      </span>
                      {seg.description && (
                        <span className="text-xs text-stone-400">
                          {seg.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : !loading ? (
                <div className="flex items-center justify-center py-4 text-base text-gray-500">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  No segments available
                </div>
              ) : null}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </Label>
  );
}
