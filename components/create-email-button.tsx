"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useModal } from "@/components/modal/provider";
import { Button } from "@/components/ui/button";
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
    <Button
      onClick={handleClick}
      disabled={isFetching}
      aria-label={isFetching ? "Loading" : "Create a new email"}
    >
      {isFetching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Loading...
        </>
      ) : (
        "Create a new email"
      )}
    </Button>
  );
}
