"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  addCustomFieldToAudienceList,
  removeCustomFieldFromAudienceList,
} from "@/lib/actions/audience-list";

import { useModal } from "./provider";

interface AddCustomFieldModalProps {
  audienceListId: string;
  onAdded: (_newField: string) => void;
}

export function AddCustomFieldModal({
  audienceListId,
  onAdded,
}: AddCustomFieldModalProps) {
  const modal = useModal();
  const [newField, setNewField] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.trim()) return;

    setIsPending(true);
    const res = await addCustomFieldToAudienceList(audienceListId, newField);
    setIsPending(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      onAdded(newField);
      toast.success(`Custom field “${newField}” added.`);
      modal?.hide();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-sm bg-white p-6 md:max-w-md md:border md:shadow-sm"
    >
      <h2 className="mb-4 text-2xl">New Custom Field</h2>
      <input
        autoFocus
        type="text"
        placeholder="e.g. zip_code"
        value={newField}
        onChange={(e) => setNewField(e.target.value)}
        required
        className="mb-4 w-full rounded-sm border px-3 py-2"
      />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add Field"}
        </Button>
        <Button variant="ghost" onClick={() => modal?.hide()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface ConfirmDeleteFieldModalProps {
  audienceListId: string;
  fieldName: string;
  onDeleted: (_removedField: string) => void;
}

export function ConfirmDeleteFieldModal({
  audienceListId,
  fieldName,
  onDeleted,
}: ConfirmDeleteFieldModalProps) {
  const modal = useModal();
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    const res = await removeCustomFieldFromAudienceList(
      audienceListId,
      fieldName,
    );
    setIsPending(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      onDeleted(fieldName);
      toast.success(`Custom field “${fieldName}” removed.`);
      modal?.hide();
    }
  };

  return (
    <div className="w-full rounded-sm bg-white p-6 md:max-w-md md:border md:shadow-sm">
      <h2 className="mb-2 text-2xl">Remove &ldquo;{fieldName}&rdquo;?</h2>
      <p className="mb-4 text-base text-gray-600">
        This will delete that column and all its values from every audience.
      </p>

      <div className="flex justify-end gap-2">
        <Button variant="default" onClick={handleDelete} disabled={isPending}>
          {isPending ? "Deleting…" : "Delete"}
        </Button>
        <Button variant="ghost" onClick={() => modal?.hide()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
