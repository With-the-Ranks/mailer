"use client";

import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@/lib/utils";

export default function SiteSettingsNav() {
  const { id } = useParams() as { id?: string };
  const segment = useSelectedLayoutSegment();

  const navItems = [
    {
      name: "General",
      href: `/organization/${id}/settings`,
      segment: null,
    },
    {
      name: "Domains",
      href: `/organization/${id}/settings/domains`,
      segment: "domains",
    },
    {
      name: "Members",
      href: `/organization/${id}/settings/members`,
      segment: "members",
    },
    {
      name: "Queue",
      href: `/organization/${id}/settings/queue`,
      segment: "queue",
    },
  ];

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-stone-200 bg-white px-4 pt-2 pb-4 dark:border-stone-700 dark:bg-[#2D2D2D]">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          // Change style depending on whether the link is active
          className={cn(
            "shrink-0 rounded-lg px-2 py-1 text-sm font-medium transition-colors active:bg-stone-200 sm:text-base dark:active:bg-stone-600",
            segment === item.segment
              ? "bg-stone-100 text-stone-600 dark:bg-[#2D2D2D] dark:text-stone-400"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-[#252525]",
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
