"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function SignInForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Use NextAuth signIn for credentials
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      toast.error(`Login Failed: ${result.error}`);
      setIsSubmitting(false);
    } else {
      toast.success("Login Successful");
      // Redirect to the dashboard or another target page
      router.push("/");
    }
  };
  const FormButton = () => (
    <button
      className={cn(
        "flex h-8 w-full mb-10 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
        isSubmitting
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={isSubmitting}
    >
      {isSubmitting ? <LoadingDots color="#808080" /> : <p>Login</p>}
    </button>
  );

  return (
    <form onSubmit={onSubmit}>
      <input
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mt-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        required
      />
      <input
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="my-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        required
      />
      <FormButton />
    </form>
  );
}

export default SignInForm;
