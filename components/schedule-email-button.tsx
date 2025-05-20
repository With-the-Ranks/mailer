"use client";

import "react-datetime/css/react-datetime.css";

import { CalendarDays } from "lucide-react";
import type { Moment } from "moment";
import moment from "moment";
import Datetime from "react-datetime";

import { Button } from "@/components/ui/button";

import { Label } from "./ui/label";

interface ScheduleEmailProps {
  scheduledTimeValue: Moment;
  isValidTime: (_time: Moment) => boolean;
  setScheduledTimeValue: (_value: any) => void;
  isDisabled: boolean;
}

export default function ScheduleEmailButton({
  scheduledTimeValue,
  isValidTime,
  setScheduledTimeValue,
  isDisabled,
}: ScheduleEmailProps) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleChange = (newTime: Moment | string) => {
    if (typeof newTime === "string") return;
    setScheduledTimeValue(moment(newTime.format()));
  };
  return (
    <Label className="flex items-center font-normal">
      <span className="w-40 shrink-0 font-normal text-gray-600 after:ml-0.5 after:text-red-400">
        Schedule Email
      </span>

      <Button
        variant="outline"
        className="flex cursor-pointer items-center gap-2 hover:border-stone-300 hover:bg-transparent"
      >
        <CalendarDays className="h-5 w-5 text-gray-500" />
        <Datetime
          value={scheduledTimeValue > moment() ? scheduledTimeValue : "Now"}
          isValidDate={isValidTime}
          inputProps={{
            placeholder: "Schedule Email",
            disabled: isDisabled,
            readOnly: true,
            className:
              "cursor-pointer bg-transparent w-full ring-0 focus:ring-0 shadow-none focus:shadow-none focus:outline-none border-none focus:border-none",
          }}
          onChange={handleChange}
        />
      </Button>

      <div className="ml-3 space-y-0.5">
        <div className="text-sm text-gray-500">
          Timezone:{" "}
          <span className="font-medium">{scheduledTimeValue.format("Z")}</span>{" "}
          ({timeZone})
        </div>
        <div className="text-xs text-gray-400">
          {moment(scheduledTimeValue).fromNow()}
        </div>
      </div>
    </Label>
  );
}
