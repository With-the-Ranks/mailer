"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import FormButton from "@/components/form/form-button";
import { isSafeCallbackPath } from "@/lib/utils";

function SignInForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      action={async (data) => {
        setIsSubmitting(true);
        const result = await signIn("credentials", {
          redirect: false,
          email: data.get("email"),
          password: data.get("password"),
        });

        if (result?.error) {
          if (result.error.toLowerCase().includes("verify")) {
            toast.error("Please verify your email", {
              action: {
                label: "Resend",
                onClick: async () => {
                  toast.dismiss();

                  const res = await fetch("/api/resend-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email }),
                  }).then((res) => res.json());

                  if (res.success) {
                    toast.success("Verification email resent");
                  } else {
                    toast.error("Unable to resend verification email");
                  }
                },
              },
            });
          } else {
            toast.error(`Login Failed: ${result.error}`);
          }

          setIsSubmitting(false);
          return;
        }

        toast.success("Login Successful");
        const destination = isSafeCallbackPath(callbackUrl)
          ? callbackUrl!
          : "/";
        router.push(destination);
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
      <FormButton isSubmitting={isSubmitting} label="Login" />
    </form>
  );
}

export default SignInForm;
