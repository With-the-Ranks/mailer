"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useModal } from "@/components/modal/provider";
import { fetchAudienceLists } from "@/lib/actions";

import CreateAudienceModal from "./modal/create-audience-list";
import CreateEmailModal from "./modal/create-email-modal";

export default function CreateEmailButton({
  organizationId,
}: {
  organizationId: string;
}) {
  const modal = useModal();
  const [isFetching, setIsFetching] = useState(false);

  const handleClick = async () => {
    setIsFetching(true);

    // Fetch audience lists
    const lists = await fetchAudienceLists(organizationId);
    setIsFetching(false);

    // If no audience lists exist, show Create Audience List Modal
    if (lists.length === 0) {
      toast.error("You need to create an audience list first.");
      modal?.show(<CreateAudienceModal organizationId={organizationId} />);
    } else {
      // Otherwise, show Create Email Modal
      modal?.show(<CreateEmailModal organizationId={organizationId} />);
    }
  };

  return (
    <button onClick={handleClick} className="btn" disabled={isFetching}>
      {isFetching ? "Loading..." : "Create New Email"}
    </button>
  );
}
