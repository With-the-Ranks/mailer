"use client";

import va from "@vercel/analytics";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteOrganization } from "@/lib/actions";

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      variant="destructive"
      size="sm"
      aria-label={pending ? "Deleting" : "Confirm Delete"}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Deleting...
        </>
      ) : (
        "Confirm Delete"
      )}
    </Button>
  );
}

export default function DeleteOrganizationForm({
  organizationName,
}: {
  organizationName: string;
}) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  return (
    <form
      action={async (data: FormData) => {
        if (
          !window.confirm("Are you sure you want to delete your organization?")
        ) {
          return;
        }

        try {
          const res = await deleteOrganization(data, id, "delete");
          if (res.error) {
            toast.error(res.error);
          } else {
            va.track("Deleted Organization");
            router.refresh();
            router.push("/organizations");
            toast.success(`Successfully deleted organization!`);
          }
        } catch (err: any) {
          toast.error(err.message);
        }
      }}
      className="rounded-lg border border-red-600 bg-white dark:bg-black"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">Delete Site</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Deletes your organization and all emails associated with it. Type in
          the name of your organization <b>{organizationName}</b> to confirm.
        </p>

        <input
          name="confirm"
          type="text"
          required
          pattern={organizationName}
          placeholder={organizationName}
          className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-hidden focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        />
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
        <p className="text-center text-sm text-stone-500 dark:text-stone-400">
          This action is irreversible. Please proceed with caution.
        </p>
        <div>
          <FormButton />
        </div>
      </div>
    </form>
  );
}
