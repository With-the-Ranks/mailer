"use client";

import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

import FormButton from "@/components/form/form-button";
import { registerUser } from "@/lib/actions/auth";

function RegisterForm({
  onSuccess,
}: {
  callbackUrl?: string | null;
  onSuccess?: (email: string) => void;
}) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataObj = new FormData();
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);

    const result = await registerUser(formDataObj);

    if (result?.error) {
      toast.error(`Register Failed: ${result.error}`);
      posthog.capture("user_registration_failed", {
        error: result.error,
      });
      setIsSubmitting(false);
      return;
    }

    posthog.identify(formData.email, { email: formData.email });
    posthog.capture("user_registered", { email: formData.email });

    try {
      onSuccess?.(formData.email);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        disabled={isSubmitting}
        className="mt-4 w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-blue-700 focus:ring-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
        required
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        disabled={isSubmitting}
        className="my-4 w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-blue-700 focus:ring-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
        required
      />
      <FormButton isSubmitting={isSubmitting} label="Sign up" />
    </form>
  );
}

export default RegisterForm;
