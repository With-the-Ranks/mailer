"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchAudienceLists } from "@/lib/actions";

import { Label } from "./ui/label";

interface AudienceListDropdownProps {
  selectedAudienceList: string | null;
  // eslint-disable-next-line no-unused-vars
  setSelectedAudienceList: (value: string | null) => void;
  organizationId: string;
}

export function AudienceListDropdown({
  selectedAudienceList,
  setSelectedAudienceList,
  organizationId,
}: AudienceListDropdownProps) {
  const [audienceLists, setAudienceLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch audience lists
    const fetchLists = async () => {
      const lists = await fetchAudienceLists(organizationId);
      setAudienceLists(lists);
      setLoading(false);
    };
    fetchLists();
  }, [organizationId]);

  return (
    <Label className="flex items-center font-normal">
      <span className="w-40 shrink-0 font-normal text-gray-600">
        Audience List
      </span>
      {loading ? (
        <span className="flex items-center">
          <Loader2 className="mr-2 animate-spin" />
        </span>
      ) : (
        <select
          className="h-auto w-full rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
          value={selectedAudienceList || ""}
          onChange={(e) => setSelectedAudienceList(e.target.value)}
        >
          <option value="" disabled>
            Select Audience List
          </option>
          {!loading &&
            audienceLists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name} ({list.contactCount} contacts)
              </option>
            ))}
        </select>
      )}
    </Label>
  );
}
