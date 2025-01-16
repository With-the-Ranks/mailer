import type { AudienceList, Organization } from "@prisma/client";
import Link from "next/link";

export default function AudienceCard({
  data,
}: {
  data: AudienceList & { organization: Organization };
}) {
  const url = `/audience/${data.id}`;

  return (
    <Link href={url} className="block">
      <div className="relative rounded-lg border border-stone-200 pb-4 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
