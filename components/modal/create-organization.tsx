"use client";

import va from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { createOrganization } from "@/lib/actions";
import { cn } from "@/lib/utils";

import { useModal } from "./provider";

function CreateSiteFormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={cn("btn", pending && "cursor-not-allowed opacity-50")}
      disabled={pending}
    >
      {pending ? (
        <LoadingDots color="#FFFCF7" />
      ) : (
        <span>Create New Organization</span>
      )}
    </button>
  );
}

export default function CreateOrganizationModal() {
  const router = useRouter();
  const modal = useModal();

  const [data, setData] = useState({
    name: "",
    subdomain: "",
    description: "",
  });

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      subdomain: prev.name
        .toLowerCase()
        .trim()
        .replace(/[\W_]+/g, "-"),
    }));
  }, [data.name]);

  return (
    <form
      action={async (data: FormData) =>
        createOrganization(data).then((res: any) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            va.track("Created Site");
            router.push(`/`);
            router.refresh();
            modal?.hide();
            toast.success(`Successfully created organization!`);
          }
        })
      }
      className="w-full rounded-md bg-white md:max-w-md md:border md:border-stone-200 md:shadow-sm dark:bg-black dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="text-2xl dark:text-white">Create a new organization</h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="name"
            className="text-base font-medium text-stone-500 dark:text-stone-400"
          >
            Organization Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="My Awesome Organization"
            autoFocus
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            maxLength={32}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-base text-stone-600 placeholder:text-stone-400 focus:border-black focus:ring-black focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex hidden flex-col space-y-2">
          <label
            htmlFor="subdomain"
            className="text-base font-medium text-stone-500"
          >
            Subdomain
          </label>
          <div className="flex w-full max-w-md">
            <input
              name="subdomain"
              type="text"
              placeholder="subdomain"
              value={data.subdomain}
              onChange={(e) => setData({ ...data, subdomain: e.target.value })}
              autoCapitalize="off"
              pattern="[a-zA-Z0-9\-]+" // only allow lowercase letters, numbers, and dashes
              maxLength={32}
              required
              className="w-full rounded-l-lg border border-stone-200 bg-stone-50 px-4 py-2 text-base text-stone-600 placeholder:text-stone-400 focus:border-black focus:ring-black focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
            />
            <div className="flex items-center rounded-r-lg border border-l-0 border-stone-200 bg-stone-100 px-3 text-base dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400">
              .{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
            </div>
          </div>
        </div>

        <div className="flex hidden flex-col space-y-2">
          <label
            htmlFor="description"
            className="text-base font-medium text-stone-500"
          >
            Description
          </label>
          <textarea
            name="description"
            placeholder="Description about why my organization is so awesome"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            maxLength={140}
            rows={3}
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-base text-stone-600 placeholder:text-stone-400 focus:border-black focus:ring-black focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 md:px-10 dark:border-stone-700 dark:bg-stone-800">
        <CreateSiteFormButton />
      </div>
    </form>
  );
}
