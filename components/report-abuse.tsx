"use client";

import va from "@vercel/analytics";
import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import LoadingDots from "./icons/loading-dots";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "h flex h-8 w-full items-center justify-center space-x-2 rounded-md border text-base transition-all focus:outline-hidden sm:h-10",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
          : "border-black bg-black text-white hover:bg-white hover:text-black",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Report Abuse</p>}
    </button>
  );
}

export default function ReportAbuse() {
  const [open, setOpen] = useState(false);
  const { domain, slug } = useParams() as { domain: string; slug?: string };
  const url = slug ? `https://${domain}/${slug}` : `https://${domain}`;

  return (
    <div className="fixed right-5 bottom-5">
      <button
        className="rounded-full bg-black p-4 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 active:shadow-xs"
        onClick={() => setOpen(!open)}
      >
        <AlertTriangle size={24} />
      </button>
      {open && (
        <form
          action={async (formData) => {
            const url = formData.get("url") as string;
            va.track("Reported Abuse", { url });
            // artificial 1s delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setOpen(false);
            toast.success(
              "Successfully reported abuse – thank you for helping us keep the internet safe!",
            );
          }}
          className="animate-in slide-in-from-bottom-5 absolute right-2 bottom-20 flex w-96 flex-col space-y-6 rounded-lg border border-stone-200 bg-white p-8 shadow-lg"
        >
          <div>
            <h2 className="text-xl leading-7 text-stone-900">Report Abuse</h2>
            <p className="mt-2 text-base leading-6 text-stone-600">
              Found a site with abusive content? Let us know!
            </p>
          </div>

          <div>
            <label
              htmlFor="domain"
              className="block text-base leading-6 font-medium text-stone-900"
            >
              URL to report
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="url"
                id="url"
                readOnly
                value={url}
                className="block w-full cursor-not-allowed rounded-md border border-stone-200 bg-stone-100 py-1.5 text-stone-900 shadow-xs ring-0 focus:outline-hidden sm:text-base sm:leading-6"
              />
            </div>
          </div>

          <SubmitButton />
        </form>
      )}
    </div>
  );
}
