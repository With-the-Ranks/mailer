"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Select from "react-select"; // Import react-select

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
    const fetchLists = async () => {
      const lists = await fetchAudienceLists(organizationId);
      const formattedLists = lists.map((list: any) => ({
        value: list.id,
        label: `${list.name} (${list.contactCount} contacts)`,
      }));
      setAudienceLists(formattedLists);
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
        <Select
          className="w-full"
          value={
            selectedAudienceList
              ? audienceLists.find(
                  (list) => list.value === selectedAudienceList,
                )
              : null
          }
          onChange={(selectedOption) =>
            setSelectedAudienceList(
              selectedOption ? selectedOption.value : null,
            )
          }
          options={audienceLists}
          placeholder="Select Audience List"
          isClearable={false}
          isSearchable={false}
        />
      )}
    </Label>
  );
}
