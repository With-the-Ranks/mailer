"use client";

import type { AudienceList, Organization } from "@prisma/client";
import {
  Filter,
  Info,
  Pencil,
  RowsIcon,
  Settings2Icon,
  UploadIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { updateAudienceListName } from "@/lib/actions/audience-list";

export default function AudienceCard({
  data,
}: {
  data: (AudienceList & { organization: Organization }) & {
    _count?: { audiences: number };
  };
}) {
  const url = `/audience/${data.id}`;
  const createdAtFormatted = new Date(data.createdAt).toLocaleDateString();
  const contactsCount = data._count?.audiences ?? 0;

  // Inline edit state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await updateAudienceListName(data.id, name);
    setLoading(false);
    if (
      result &&
      typeof result === "object" &&
      "error" in result &&
      result.error
    ) {
      setError(result.error);
    } else {
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="relative mt-8 w-full max-w-4xl rounded-lg border border-stone-200 bg-white p-8 shadow-md dark:border-stone-700 dark:bg-black">
      <div className="mb-4 flex items-center justify-between">
        {editing ? (
          <form onSubmit={handleSave} className="flex w-full items-center">
            <input
              className="flex-1 rounded border px-2 py-1 font-cal text-xl font-bold tracking-wide dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              maxLength={32}
              autoFocus
            />
            <Button type="submit" className="ml-2" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="ml-2"
              onClick={() => {
                setEditing(false);
                setName(data.name);
                setError(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <Link
              href={url}
              className="group flex-1"
              title="Go to contact list"
            >
              <h3 className="my-0 truncate font-cal text-2xl font-bold tracking-wide group-hover:underline dark:text-white">
                {name}
              </h3>
            </Link>
            <button
              className="ml-2 text-stone-500 hover:text-blue-600"
              onClick={() => setEditing(true)}
              title="Edit list name"
            >
              <Pencil />
            </button>
          </>
        )}
      </div>
      {error && <div className="mb-2 text-xs text-red-500">{error}</div>}
      {success && (
        <div className="mb-2 text-xs text-green-600">Name updated!</div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-stone-500">Organization</div>
          <div className="font-medium">{data.organization.name}</div>
        </div>
        <div>
          <div className="text-sm text-stone-500">Created on</div>
          <div className="font-medium">{createdAtFormatted}</div>
        </div>
        <div>
          <div className="text-sm text-stone-500">Contacts</div>
          <div className="font-medium">{contactsCount}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`${url}?action=add-contact`} scroll={false}>
          <Button size="sm">
            <UserPlusIcon className="mr-2 h-4 w-4" />
            {contactsCount === 0 ? "Add First Contact" : "Add Contact"}
          </Button>
        </Link>
        <Link href={`${url}?action=custom-fields`} scroll={false}>
          <Button variant="outline" size="sm">
            <Settings2Icon className="mr-2 h-4 w-4" />
            Custom Fields
          </Button>
        </Link>
        <Link href={`${url}?action=import`} scroll={false}>
          <Button variant="outline" size="sm">
            <UploadIcon className="mr-2 h-4 w-4" />
            Import Contacts
          </Button>
        </Link>
        <Link href={url}>
          <Button variant="outline" size="sm">
            <RowsIcon className="mr-2 h-4 w-4" />
            Manage Contacts
          </Button>
        </Link>
        <Link href={`${url}/segments`}>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Manage Segments
          </Button>
        </Link>
      </div>

      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Tip</AlertTitle>
        <AlertDescription>
          You can import contacts, add custom fields, or segment your audience
          for better targeting.
        </AlertDescription>
      </Alert>
    </div>
  );
}
