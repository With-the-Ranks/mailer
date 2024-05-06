"use client"

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function FormPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      toast.success("Registration Successful");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Registration Failed");
      }
    }
  };
  const FormButton = () => (
    <button
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
      onSubmit={onSubmit}
      className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black p-5 sm:p-10"
    >
      <h2 className="font-cal text-3xl dark:text-white mb-2">Register Intrepid Email App</h2>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Create your account.
      </p>
      <input
        name="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 mt-4"
        required
      />
      <input
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 my-4"
        required
      />
      <FormButton />
      <div className="text-sm text-stone-400 mt-5">
        Already have an account?<Link href="/login" className="rounded-lg p-2 underline hover:text-stone-200 dark:hover:text-stone-200">Log in</Link>
      </div>
    </form>
  );
}