"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchAudienceLists } from "@/lib/actions";

import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AudienceListDropdownProps {
  selectedAudienceList: string | null;
  // eslint-disable-next-line no-unused-vars
  setSelectedAudienceList: (value: string | null) => void;
  organizationId: string;
  disabled?: boolean;
}

export function AudienceListDropdown({
  selectedAudienceList,
  setSelectedAudienceList,
  organizationId,
  disabled = false,
}: AudienceListDropdownProps) {
  const [audienceLists, setAudienceLists] = useState<
    {
      id: string;
      name: string;
      contactCount: number;
    }[]
  >([]);

  useEffect(() => {
    const fetchLists = async () => {
      const lists = await fetchAudienceLists(organizationId);
      setAudienceLists(lists);
    };
    fetchLists();
  }, [organizationId]);

  return (
    <Label className="flex items-center font-normal">
      <span className="w-40 shrink-0 font-normal text-gray-600">
        Audience List
      </span>
      <div className="w-full">
        <Select
          value={selectedAudienceList || ""}
          onValueChange={(value) => setSelectedAudienceList(value)}
          disabled={disabled}
        >
          <SelectTrigger className="h-auto w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400">
            <SelectValue placeholder="Select an audience list…" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            className="z-[10000001] max-h-[300px] overflow-y-auto bg-white"
          >
            <SelectGroup>
              {audienceLists.length > 0 ? (
                audienceLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name} ({list.contactCount} contacts)
                  </SelectItem>
                ))
              ) : (
                <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  No audience lists available
                </div>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </Label>
  );
}
