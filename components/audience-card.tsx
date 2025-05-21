import type { AudienceList, Organization } from "@prisma/client";
import Link from "next/link";

export default function AudienceCard({
  data,
}: {
  data: (AudienceList & { organization: Organization }) & {
    _count?: { audiences: number };
  };
}) {
  const url = `/audience/${data.id}`;
  const createdAtFormatted = new Date(data.createdAt).toLocaleDateString();
  const contactsCount = data._count?.audiences ?? 0; // default to 0 if not provided

  return (
    <Link href={url} className="block">
      <div className="relative rounded-lg border border-stone-200 pb-4 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
        </div>
        <div className="border-t border-stone-200 p-4 pt-2 text-xs text-stone-400 dark:border-stone-700 dark:text-stone-500">
          <div className="flex flex-col gap-1 sm:justify-between">
            <span>Organization: {data.organization.name}</span>
            <span>Contacts: {contactsCount}</span>
            <span>Created on: {createdAtFormatted}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
