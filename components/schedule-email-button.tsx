/**
 * v0 by Vercel.
 * @see https://v0.dev/t/SbJogdcK2uA
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import "react-datetime/css/react-datetime.css";

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

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export default function ScheduleEmailButton({
  scheduledTimeValue,
  isValidTime,
  setScheduledTimeValue,
  isDisabled,
}: ScheduleEmailProps) {
  const handleChange = (newTime: Moment | string) => {
    if (typeof newTime === "string") {
      return;
    }
    setScheduledTimeValue(moment(newTime.format()));
  };
  return (
    <Label className="flex items-center font-normal">
      <span className="w-40 shrink-0 font-normal text-gray-600 after:ml-0.5 after:text-red-400">
        Schedule Email
      </span>
      <Button variant="outline" className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4" />
        <Datetime
          value={scheduledTimeValue > moment() ? scheduledTimeValue : "Now"}
          isValidDate={isValidTime}
          inputProps={{ placeholder: "Schedule Email", disabled: isDisabled }}
          onChange={handleChange}
        ></Datetime>
      </Button>
    </Label>
  );
}
