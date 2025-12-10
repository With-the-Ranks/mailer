"use client";

import va from "@vercel/analytics";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteEmail } from "@/lib/actions";

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

export default function DeleteEmailForm({ emailName }: { emailName: string }) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  return (
    <form
      action={async (data: FormData) => {
        if (!window.confirm("Are you sure you want to delete your email?")) {
          return;
        }

        const res = await deleteEmail(data, id, "delete");
        if (res.error) {
          toast.error(res.error);
        } else {
          va.track("Deleted Email");
          router.refresh();
          router.push(`/organization/${res.organizationId}`);
          toast.success(`Successfully deleted email!`);
        }
      }}
      className="rounded-lg border border-red-600 bg-white dark:bg-black"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">Delete Email</h2>
        <p className="text-base text-stone-500 dark:text-stone-400">
          Deletes your email permanently. Type in the name of your email{" "}
          <b>{emailName}</b> to confirm.
        </p>

        <input
          name="confirm"
          type="text"
          required
          pattern={emailName}
          placeholder={emailName}
          className="w-full max-w-md rounded-md border border-stone-300 text-base text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        />
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
        <p className="text-center text-base text-stone-500 dark:text-stone-400">
          This action is irreversible. Please proceed with caution.
        </p>
        <div>
          <FormButton />
        </div>
      </div>
    </form>
  );
}
