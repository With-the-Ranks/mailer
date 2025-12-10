"use client";

import type { Audience } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { addAudience, getAudiences } from "@/lib/actions/audience-list";
import { cn } from "@/lib/utils";

import { useModal } from "./provider";

export default function AddAudienceModal({
  audienceListId,
  addNewAudience,
}: {
  audienceListId: string;

  addNewAudience: (newAudience: Audience) => void;
}) {
  const router = useRouter();
  const modal = useModal();
  const [data, setData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    customFields: {} as Record<string, string>, // Initial state for custom fields
  });
  const [customFields, setCustomFields] = useState<string[]>([]); // To store custom fields list
  const [isPending, setIsPending] = useState(false);

  // Fetch custom fields when the modal opens
  useEffect(() => {
    const fetchCustomFields = async () => {
      const response = await getAudiences(audienceListId);
      if (!("error" in response)) {
        setCustomFields(response.customFields || []);
      }
    };

    fetchCustomFields();
  }, [audienceListId]);

  // Handle form submission to add new audience
  const handleAddAudience = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    // Create form data to send to the server
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("audienceListId", audienceListId);
    formData.append("customFields", JSON.stringify(data.customFields));

    // Call the action to add the audience
    const newAudience = await addAudience(formData);
    setIsPending(false);

    if ("error" in newAudience) {
      toast.error(newAudience.error);
      return;
    }
    // Update the audience list directly
    addNewAudience(newAudience);

    // Show success toast and refresh the page
    toast.success(`Successfully added new audience!`);
    modal?.hide();
    router.refresh(); // Refresh the current page to reflect the new audience
  };

  // Handle input change for standard fields and custom fields
  const handleInputChange = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomFieldChange = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [field]: value,
      },
    }));
  };

  return (
    <form
      onSubmit={handleAddAudience}
      className="w-full rounded-md bg-white md:max-w-md md:border md:border-stone-200 md:shadow-sm dark:bg-black dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Add New Audience</h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="email"
            className="text-base font-medium text-stone-500 dark:text-stone-400"
          >
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-base text-stone-600 placeholder:text-stone-400 focus:border-black focus:ring-black focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="firstName"
            className="text-base font-medium text-stone-500"
          >
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            value={data.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-base text-stone-600 placeholder:text-stone-400 focus:border-black focus:ring-black focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="lastName"
            className="text-base font-medium text-stone-500"
          >
            Last Name
          </label>
          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={data.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-base text-stone-600 placeholder:text-stone-400 focus:border-black focus:ring-black focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        {/* Dynamic Custom Fields */}
        {customFields.map((field) => (
          <div key={field} className="flex flex-col space-y-2">
            <label className="text-base font-medium text-stone-500 dark:text-stone-400">
              {field}
            </label>
            <input
              type="text"
              placeholder={field}
              value={data.customFields[field] || ""}
              onChange={(e) => handleCustomFieldChange(field, e.target.value)}
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-base text-stone-600 placeholder:text-stone-400 focus:border-black focus:ring-black focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 md:px-10 dark:border-stone-700 dark:bg-stone-800">
        <button
          type="submit"
          className={cn("btn", isPending && "cursor-not-allowed opacity-50")}
          disabled={isPending}
        >
          {isPending ? (
            <LoadingDots color="#FFFCF7" />
          ) : (
            <span>Add Audience</span>
          )}
        </button>
      </div>
    </form>
  );
}
