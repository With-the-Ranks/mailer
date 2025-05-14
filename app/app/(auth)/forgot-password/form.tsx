"use client";

import { useState } from "react";
import { toast } from "sonner";

import FormButton from "@/components/form/form-button";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();
      console.log("Response:", text);
      if (res.ok) {
        toast.success("Reset link sent");
        setEmail("");
      } else {
        let msg: string;
        try {
          const json = JSON.parse(text);
          msg = json.error || JSON.stringify(json);
        } catch {
          msg = text;
        }
        toast.error(msg || "Failed to send reset link");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center">
      <input
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="my-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
      />

      <FormButton isSubmitting={isSubmitting} label="Send reset link" />
    </form>
  );
}
