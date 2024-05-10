"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions";

export default function FormPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const FormButton = () => (
    <button
      type="submit"
      className={cn(
        "flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
        isSubmitting
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={isSubmitting}
    >
      {isSubmitting ? <LoadingDots color="#808080" /> : <p>Register</p>}
    </button>
  );

  return (
    <form
      action={async (data: FormData) => {
        setIsSubmitting(true);
        const result = await registerUser(data);
        if (result?.error) {
          toast.error(`Register Failed: ${result.error}`);
          setIsSubmitting(false);
        } else {
          toast.success("Registration Successful");
          router.push("/login");
        }
      }}
      className="rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-black sm:p-10"
    >
      <h2 className="mb-2 font-cal text-3xl dark:text-white">
        Register Intrepid Email App
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Create your account.
      </p>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="mt-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        required
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        className="my-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        required
      />
      <FormButton />
      <div className="mt-5 text-sm text-stone-400">
        Already have an account?
        <Link
          href="/login"
          className="rounded-lg p-2 underline hover:text-stone-200 dark:hover:text-stone-200"
        >
          Log in
        </Link>
      </div>
    </form>
  );
}