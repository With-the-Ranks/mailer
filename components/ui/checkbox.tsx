"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "focus-visible:ring-ring peer ring-offset-background h-4 w-4 shrink-0 rounded-xs border border-[#D3D3D3] bg-white text-[#1D4ED8] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[#1D4ED8] data-[state=checked]:bg-[#1D4ED8] data-[state=checked]:text-white data-[state=indeterminate]:border-[#1D4ED8] data-[state=indeterminate]:bg-[#1D4ED8] data-[state=indeterminate]:text-white dark:border-neutral-600 dark:bg-transparent",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex items-center justify-center text-white opacity-100 transition-all",
      )}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
