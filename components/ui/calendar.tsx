"use client";

import "react-day-picker/src/style.css";

import {
  DayPicker,
  getDefaultClassNames,
  type ClassNames,
} from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const defaultClassNames = getDefaultClassNames();

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const mergedClassNames: Partial<ClassNames> = {
    ...defaultClassNames,
    root: cn("rdp-root p-3", defaultClassNames?.root),
    month: cn("space-y-4", defaultClassNames?.month),
    month_caption: cn(
      "flex justify-center pt-1 relative",
      defaultClassNames?.month_caption,
    ),
    nav: cn("flex items-center gap-1", defaultClassNames?.nav),
    button_previous: cn(
      "absolute left-1 z-10",
      buttonVariants({ variant: "outline" }),
      "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100",
      defaultClassNames?.button_previous,
    ),
    button_next: cn(
      "absolute right-1 z-10",
      buttonVariants({ variant: "outline" }),
      "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100",
      defaultClassNames?.button_next,
    ),
    month_grid: cn(
      "w-full border-collapse space-y-1",
      defaultClassNames?.month_grid,
    ),
    weekdays: cn("flex", defaultClassNames?.weekdays),
    weekday: cn(
      "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
      defaultClassNames?.weekday,
    ),
    week: cn("flex w-full mt-2", defaultClassNames?.week),
    day: cn(
      "relative p-0 text-center text-sm focus-within:relative [&:has([data-selected])]:bg-accent [&:has([data-selected].day-outside)]:bg-accent/50 [&:has([data-selected].day-range-end)]:rounded-r-md",
      defaultClassNames?.day,
    ),
    day_button: cn(
      buttonVariants({ variant: "ghost" }),
      "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
      defaultClassNames?.day_button,
    ),
    selected:
      "bg-blue-700 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white",
    today: "bg-accent text-accent-foreground",
    outside: "text-muted-foreground opacity-50",
    disabled: "text-muted-foreground opacity-50",
    ...classNames,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rounded-lg border bg-white dark:bg-[#2D2D2D]", className)}
      classNames={mergedClassNames}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
