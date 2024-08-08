"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { addAudience } from "@/lib/actions/audience-list";
import { cn } from "@/lib/utils";

import { useModal } from "./provider";

export default function AddAudienceModal({
  audienceListId,
}: {
  audienceListId: string;
}) {
  const router = useRouter();
  const modal = useModal();
  const [data, setData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [isPending, setIsPending] = useState(false);

  const handleAddAudience = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("audienceListId", audienceListId);

    const newAudience = await addAudience(formData);
    setIsPending(false);

    if ("error" in newAudience) {
      toast.error(newAudience.error);
      return;
    }

    toast.success(`Successfully added new audience!`);
    modal?.hide();
    router.refresh();
  };

  return (
    <form
      onSubmit={handleAddAudience}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Add New Audience</h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="firstName"
            className="text-sm font-medium text-stone-500"
          >
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            value={data.firstName}
            onChange={(e) => setData({ ...data, firstName: e.target.value })}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="lastName"
            className="text-sm font-medium text-stone-500"
          >
            Last Name
          </label>
          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={data.lastName}
            onChange={(e) => setData({ ...data, lastName: e.target.value })}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <button
          type="submit"
          className={cn(
            "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
            isPending
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
          )}
          disabled={isPending}
        >
          {isPending ? <LoadingDots color="#808080" /> : <p>Add Audience</p>}
        </button>
      </div>
    </form>
  );
}
