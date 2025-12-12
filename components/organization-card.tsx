import type { Organization } from "@prisma/client";
import { BarChart } from "lucide-react";
import Link from "next/link";

import BlurImage from "@/components/blur-image";
import { placeholderBlurhash } from "@/lib/utils";

export default function OrganizationCard({ data }: { data: Organization }) {
  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/organization/${data.id}/audience`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <BlurImage
          alt={data.name ?? "Card thumbnail"}
          width={500}
          height={400}
          className="h-44 object-cover"
          src={data.image ?? "/placeholder.png"}
          placeholder="blur"
          blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
        />
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          <p className="mt-2 line-clamp-1 text-base leading-snug font-normal text-stone-500 dark:text-stone-400">
            {data.description}
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full justify-between space-x-4 px-4">
        <Link
          href={`/organization/${data.id}/analytics`}
          className="dark:bg-opacity-50 dark:hover:bg-opacity-50 flex items-center rounded-md bg-green-100 px-2 py-1 text-base font-medium text-green-600 transition-colors hover:bg-green-200 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-800"
        >
          <BarChart height={16} />
        </Link>
      </div>
    </div>
  );
}
