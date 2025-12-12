"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createTemplate } from "@/lib/actions/template";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
  contentJson: any;
  organizationId: string;
  disabled?: boolean;

  onCreate?: (tpl: { id: string; name: string }) => void;
}

export default function SaveTemplateButton({
  contentJson,
  organizationId,
  disabled = false,
  onCreate,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        const cleanContent = JSON.parse(JSON.stringify(contentJson));

        const tpl = await createTemplate({
          name: name.trim(),
          content: cleanContent,
          organizationId,
        });
        toast.success("Template created");
        setName("");
        setIsEditing(false);
        if (onCreate && tpl?.id && tpl?.name) {
          onCreate({ id: tpl.id, name: tpl.name });
        }
      } catch (err: any) {
        toast.error(err.message || "Save failed");
      }
    });
  };

  return (
    <div className="relative inline-block">
      <Button
        size="sm"
        variant="default"
        onClick={() => setIsEditing(true)}
        className="ml-2"
        disabled={disabled}
      >
        Save Template
      </Button>

      {isEditing && (
        <div className="absolute right-0 mt-1 flex items-center space-x-2 rounded-sm border bg-white p-3 shadow-lg">
          <Input
            className="w-48"
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={isPending || !name.trim()}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-2 text-gray-400 hover:text-gray-600"
            aria-label="Cancel"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
