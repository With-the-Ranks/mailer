"use client";

import "react-datetime/css/react-datetime.css";

import { CalendarDays } from "lucide-react";
import type { Moment } from "moment";
import moment from "moment";
import Datetime from "react-datetime";

import { Label } from "./ui/label";

interface ScheduleEmailProps {
  scheduledTimeValue: Moment;
  isValidTime: (_time: Moment) => boolean;
  setScheduledTimeValue: (_m: Moment) => void;
  isDisabled: boolean;
}

export default function ScheduleEmailButton({
  scheduledTimeValue,
  isValidTime,
  setScheduledTimeValue,
  isDisabled,
}: ScheduleEmailProps) {
  const handleChange = (value: Moment | string | Date) => {
    const parsed = moment.isMoment(value)
      ? value
      : value instanceof Date
        ? moment(value)
        : moment(value, "YYYY-MM-DD HH:mm");

    if (parsed.isValid()) {
      setScheduledTimeValue(parsed);
    }
  };

  return (
    <Label className="items-left flex-start flex flex-col font-normal">
      <div className="flex items-center">
        <span className="w-40 shrink-0 text-gray-600">Schedule Email</span>

        <Datetime
          value={scheduledTimeValue}
          className="w-full"
          dateFormat="YYYY-MM-DD"
          timeFormat="HH:mm"
          isValidDate={isValidTime}
          onChange={handleChange}
          renderInput={(props, openCalendar) => (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) openCalendar();
              }}
              className="flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-2 py-1"
            >
              <CalendarDays className="h-5 w-5 text-gray-500" />
              <input
                {...props}
                disabled={isDisabled}
                className="w-full cursor-pointer bg-transparent pl-1 focus:outline-hidden"
                placeholder="YYYY-MM-DD HH:mm"
              />
            </div>
          )}
        />
      </div>
    </Label>
  );
}
