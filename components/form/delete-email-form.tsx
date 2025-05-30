"use client";

import va from "@vercel/analytics";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { deleteEmail } from "@/lib/actions";
import { cn } from "@/lib/utils";

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "btn border bg-red-600 text-sm text-white",
        "hover:bg-white hover:text-red-600 dark:hover:bg-transparent",
        pending && "cursor-not-allowed opacity-50",
      )}
    >
      {pending ? <LoadingDots color="#fff" /> : <span>Confirm Delete</span>}
    </button>
  );
}

export default function DeleteEmailForm({ emailName }: { emailName: string }) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  return (
    <form
      action={async (data: FormData) =>
        window.confirm("Are you sure you want to delete your email?") &&
        deleteEmail(data, id, "delete").then((res) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            va.track("Deleted Email");
            router.refresh();
            router.push(`/organization/${res.organizationId}`);
            toast.success(`Successfully deleted email!`);
          }
        })
      }
      className="rounded-lg border border-red-600 bg-white dark:bg-black"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">Delete Email</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Deletes your email permanently. Type in the name of your email{" "}
          <b>{emailName}</b> to confirm.
        </p>

        <input
          name="confirm"
          type="text"
          required
          pattern={emailName}
          placeholder={emailName}
          className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
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
