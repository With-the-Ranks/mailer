"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function SignInForm() {
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
      className={cn(
        "mb-10 flex h-8 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
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
    <form
      action={async (data) => {
        setIsSubmitting(true);
        // Using signIn from NextAuth for user authentication
        const result = await signIn("credentials", {
          redirect: false,
          email: data.get("email"),
          password: data.get("password"),
        });

        if (result?.error) {
          toast.error(`Login Failed: ${result.error}`);
          setIsSubmitting(false); 
        } else {
          toast.success("Login Successful");
          router.push("/"); 
        }
      }}
    >
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
    </form>
  );
}

export default SignInForm;
