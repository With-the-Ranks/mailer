"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface CreateSignupFormButtonProps {
  organizationId: string;
}

export default function CreateSignupFormButton({
  organizationId,
}: CreateSignupFormButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/signup-forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          name: "New Signup Form",
          slug: `signup-form-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Use window.location for a full page refresh to ensure data is updated
        window.location.href = `/organization/${organizationId}/signup-forms/${data.id}/edit`;
      }
    } catch (error) {
      console.error("Error creating signup form:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button onClick={handleCreate} disabled={isCreating}>
      <Plus className="mr-2 h-4 w-4" />
      {isCreating ? "Creating..." : "Create Signup Form"}
    </Button>
  );
}
