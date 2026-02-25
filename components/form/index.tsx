"use client";

import va from "@vercel/analytics";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import DomainConfiguration from "./domain-configuration";
import DomainStatus from "./domain-status";
import Uploader from "./uploader";

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-label={pending ? "Saving changes" : "Save changes"}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Saving...
        </>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}

export default function Form({
  title,
  description,
  helpText,
  inputAttrs,
  handleSubmit,
  disabled = false,
}: {
  title: string;
  description: string;
  helpText: string;
  inputAttrs: {
    name: string;
    type: string;
    defaultValue: string;
    placeholder?: string;
    maxLength?: number;
    pattern?: string;
    options?: { value: string; label: string }[];
  };
  handleSubmit: any;
  disabled?: boolean;
}) {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const { update } = useSession();
  const normalizeHex = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  };

  const normalizeHexOrNull = (
    value: string | null | undefined,
  ): string | null => {
    if (typeof value !== "string") return null;
    const normalized = normalizeHex(value);
    if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return null;
    return normalized.toLowerCase();
  };

  const colorFallback = useMemo(() => {
    if (/button/i.test(inputAttrs.name)) return "#1547e6";
    return "#ffffff";
  }, [inputAttrs.name]);

  const initialColorValue = useMemo(() => {
    if (inputAttrs.type !== "color") return "";
    return normalizeHexOrNull(inputAttrs.defaultValue) ?? colorFallback;
  }, [inputAttrs.defaultValue, inputAttrs.type, colorFallback]);

  const [colorValue, setColorValue] = useState(initialColorValue);

  useEffect(() => {
    setColorValue(initialColorValue);
  }, [initialColorValue]);

  const handleHexChange = (value: string) => {
    const normalized = normalizeHex(value);
    setColorValue(normalized);
  };

  return (
    <form
      action={async (data: FormData) => {
        if (
          inputAttrs.name === "customDomain" &&
          inputAttrs.defaultValue &&
          data.get("customDomain") !== inputAttrs.defaultValue &&
          !confirm("Are you sure you want to change your custom domain?")
        ) {
          return;
        }
        handleSubmit(data, id, inputAttrs.name).then(async (res: any) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            va.track(`Updated ${inputAttrs.name}`, id ? { id } : {});
            if (id) {
              router.refresh();
            } else {
              await update();
              router.refresh();
            }
            toast.success(`Successfully updated ${inputAttrs.name}!`);
          }
        });
      }}
      className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-[#2D2D2D]"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="text-xl dark:text-white">{title}</h2>
        <p className="text-base text-stone-500 dark:text-stone-400">
          {description}
        </p>
        {inputAttrs.name === "image" || inputAttrs.name === "logo" ? (
          <Uploader
            defaultValue={inputAttrs.defaultValue}
            name={inputAttrs.name}
          />
        ) : inputAttrs.name === "font" ? (
          <div className="flex max-w-sm items-center overflow-hidden rounded-lg border border-stone-600">
            <select
              name="font"
              defaultValue={inputAttrs.defaultValue}
              className="w-full border-none bg-white px-4 py-2 text-base font-medium text-stone-700 focus:ring-black focus:outline-hidden dark:bg-[#2D2D2D] dark:text-stone-200 dark:focus:ring-white"
            >
              <option value="font-league-spartan">League Spartan</option>
            </select>
          </div>
        ) : inputAttrs.name === "subdomain" ? (
          <div className="flex w-full max-w-md">
            <input
              {...inputAttrs}
              required
              className="z-10 flex-1 rounded-l-md border border-stone-300 text-base text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-stone-700"
            />
            <div className="flex items-center rounded-r-md border border-l-0 border-stone-300 bg-stone-100 px-3 text-base dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-stone-400">
              {process.env.NEXT_PUBLIC_ROOT_DOMAIN}
            </div>
          </div>
        ) : inputAttrs.name === "customDomain" ? (
          <div className="relative flex w-full max-w-md">
            <input
              {...inputAttrs}
              className="z-10 flex-1 rounded-lg border border-stone-300 text-base text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-stone-700"
            />
            {inputAttrs.defaultValue && (
              <div className="absolute right-3 z-10 flex h-full items-center">
                <DomainStatus domain={inputAttrs.defaultValue} />
              </div>
            )}
          </div>
        ) : inputAttrs.name === "description" ? (
          <textarea
            {...inputAttrs}
            rows={3}
            required
            className="w-full max-w-xl rounded-lg border border-stone-300 text-base text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-stone-700"
          />
        ) : inputAttrs.type === "color" ? (
          <div className="flex w-full max-w-md items-center gap-3">
            <input
              type="color"
              value={normalizeHexOrNull(colorValue) ?? initialColorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-full border border-stone-300 bg-white p-1 dark:border-stone-600 dark:bg-[#2D2D2D]"
              aria-label={`${title} color picker`}
            />
            <input
              name={inputAttrs.name}
              type="text"
              value={colorValue}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#1547E6"
              pattern="^#([A-Fa-f0-9]{6})$"
              required
              className="w-full rounded-lg border border-stone-300 text-base text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-stone-700"
            />
          </div>
        ) : inputAttrs.options ? (
          <select
            name={inputAttrs.name}
            defaultValue={inputAttrs.defaultValue}
            disabled={disabled}
            className="w-full max-w-md rounded-lg border border-stone-300 text-base text-stone-900 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white dark:focus:ring-white"
          >
            {inputAttrs.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...inputAttrs}
            required
            className="w-full max-w-md rounded-lg border border-stone-300 text-base text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-stone-700"
          />
        )}
      </div>
      {inputAttrs.name === "customDomain" && inputAttrs.defaultValue && (
        <DomainConfiguration domain={inputAttrs.defaultValue} />
      )}
      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-[#2D2D2D]">
        <p className="text-base text-stone-500 dark:text-stone-400">
          {helpText}
        </p>
        <FormButton />
      </div>
    </form>
  );
}
