"use client";

import { BadgePlus, Form, Newspaper, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarCreateButtonGroupProps {
  siteId: string | null;
  audienceListId: string | null;
}

const itemClass =
  "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm outline-hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset [&>svg]:size-4 [&>svg]:shrink-0";

export function SidebarCreateButtonGroup({
  siteId,
  audienceListId,
}: SidebarCreateButtonGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  if (!siteId) return null;

  const items = [
    {
      href: `/email/create?organizationId=${siteId}`,
      label: "Create Email",
      icon: Newspaper,
      scroll: false,
    },
    {
      href: `/organization/${siteId}/signup-forms/edit`,
      label: "Create Form",
      icon: Form,
    },
    ...(audienceListId
      ? [
          {
            href: `/audience/${audienceListId}?action=add-contact`,
            label: "Create Contact",
            icon: UserPlus,
            scroll: false,
          },
        ]
      : []),
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col overflow-hidden rounded-lg",
        "border-sidebar-border border",
      )}
      role="group"
    >
      <Button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full items-center justify-center gap-1.5 rounded-none border-0 bg-linear-to-bl from-amber-200 to-amber-400 p-2 text-sm font-bold text-black transition-colors hover:from-amber-300 hover:to-amber-500"
        size="default"
      >
        <BadgePlus className="h-5 w-5" />
        Create
      </Button>
      {expanded && (
        <div className="border-sidebar-border bg-sidebar flex flex-col border-t">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              scroll={item.scroll}
              className={cn(
                itemClass,
                i < items.length - 1 && "border-sidebar-border border-b",
              )}
            >
              <item.icon />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
