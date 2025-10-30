"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import FormButton from "@/components/form/form-button";
import { registerUser } from "@/lib/actions/auth";

function RegisterForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      action={async (data: FormData) => {
        setIsSubmitting(true);
        const result = await registerUser(data);

        if (result?.error) {
          toast.error(`Register Failed: ${result.error}`);
          setIsSubmitting(false);
          return;
        }

        toast.success(
          "Registration successful. Please check your email to verify.",
        );
        router.push("/login");
      }}
    >
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="mt-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-hidden focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        required
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        className="my-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-hidden focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        required
      />
      <FormButton isSubmitting={isSubmitting} label="Register" />
    </form>
  );
}

export default RegisterForm;
