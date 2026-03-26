"use client";

import { CalendarDays } from "lucide-react";
import type { Moment } from "moment";
import moment from "moment-timezone";
import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEFAULT_TIMEZONE = "America/New_York";

interface ScheduleEmailProps {
  scheduledTimeValue: Moment;
  isValidTime: (_time: Moment) => boolean;
  setScheduledTimeValue: (_m: Moment) => void;
  isDisabled: boolean;
  timezone?: string;
}

export default function ScheduleEmailButton({
  scheduledTimeValue,
  isValidTime,
  setScheduledTimeValue,
  isDisabled,
  timezone = DEFAULT_TIMEZONE,
}: ScheduleEmailProps) {
  const [open, setOpen] = useState(false);

  // Work in org timezone: use date in TZ for calendar, time string HH:mm for input
  const tzDate = scheduledTimeValue.clone().tz(timezone);
  const dateOnly = tzDate.toDate();
  const timeString = tzDate.format("HH:mm");

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      const selectedDay = moment.tz(date, timezone).format("YYYY-MM-DD");
      const newMoment = moment.tz(
        `${selectedDay} ${timeString}`,
        "YYYY-MM-DD HH:mm",
        timezone,
      );
      if (newMoment.isValid()) setScheduledTimeValue(newMoment);
    },
    [timeString, timezone, setScheduledTimeValue],
  );

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value; // "HH:mm" from type="time"
      if (!value) return;
      const newMoment = moment.tz(
        `${tzDate.format("YYYY-MM-DD")} ${value}`,
        "YYYY-MM-DD HH:mm",
        timezone,
      );
      if (newMoment.isValid()) setScheduledTimeValue(newMoment);
    },
    [tzDate, timezone, setScheduledTimeValue],
  );

  const disabledMatcher = useCallback(
    (date: Date) => {
      const endOfSelectedDay = moment.tz(date, timezone).endOf("day");
      return !isValidTime(endOfSelectedDay);
    },
    [timezone, isValidTime],
  );

  const displayLabel = tzDate.format("YYYY-MM-DD HH:mm");

  return (
    <Label className="flex flex-col font-normal">
      <div className="flex items-center gap-2">
        <span className="w-40 shrink-0 text-gray-600 dark:text-gray-400">
          Schedule Email
        </span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={isDisabled}
              className={cn(
                "w-full justify-start gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left font-normal dark:border-stone-600 dark:bg-[#2D2D2D]",
                !scheduledTimeValue && "text-muted-foreground",
              )}
            >
              <CalendarDays className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="flex-1 truncate">{displayLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col gap-4 p-3">
              <Calendar
                mode="single"
                selected={dateOnly}
                onSelect={handleDateSelect}
                disabled={disabledMatcher}
                defaultMonth={dateOnly}
                timeZone={timezone}
              />
              <div className="flex items-center gap-2 border-t pt-3">
                <Label htmlFor="schedule-time" className="shrink-0 text-sm">
                  Time
                </Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={timeString}
                  onChange={handleTimeChange}
                  className="h-9"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Timezone: {timezone}
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Label>
  );
}
