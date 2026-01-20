"use client";

import {
  Building2,
  ChartLine,
  Filter,
  Form,
  MailOpen,
  TableProperties,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type EmptyStateIconName =
  | "mail-open"
  | "chart-line"
  | "table-properties"
  | "form"
  | "building2"
  | "filter";

const ICON_MAP: Record<EmptyStateIconName, typeof MailOpen> = {
  "mail-open": MailOpen,
  "chart-line": ChartLine,
  "table-properties": TableProperties,
  form: Form,
  building2: Building2,
  filter: Filter,
};

interface EmptyStateProps {
  icon: EmptyStateIconName;
  message: string;
  compact?: boolean;
  iconClassName?: string;
  messageClassName?: string;
}

export function EmptyState({
  icon,
  message,
  compact = false,
  iconClassName,
  messageClassName,
}: EmptyStateProps) {
  const Icon = ICON_MAP[icon];
  const iconSize = compact ? 14 : 16;
  const outerSize = compact ? "h-10 w-10" : "h-14 w-14";
  const innerSize = compact ? "h-8 w-8" : "h-12 w-12";

  return (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-white outline-4 outline-neutral-300 dark:outline-neutral-600",
          outerSize,
          iconClassName,
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-center rounded-lg bg-blue-700",
            innerSize,
          )}
        >
          <Icon size={iconSize} className="text-white" aria-hidden />
        </div>
      </div>
      <p
        className={cn(
          compact
            ? "text-base text-stone-500 dark:text-stone-400"
            : "text-lg text-stone-500 dark:text-stone-400",
          messageClassName,
        )}
      >
        {message}
      </p>
    </>
  );
}
