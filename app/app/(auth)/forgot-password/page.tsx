"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import FormButton from "@/components/form/form-button";

export default function ForgotPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Reset link sent. Check your inbox.");
        setEmail("");
      } else {
        const { error } = await res.json();
        toast.error(error || "Failed to send reset link");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        toast.success("Password reset! Redirecting to login...");
        router.push("/login?reset=success");
      } else {
        const { error } = await res.json();
        toast.error(error || "Failed to reset password");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-5 border border-stone-200 py-10 dark:border-stone-700 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md">
      <Image
        src="/logo.png"
        alt="Mailer"
        width={100}
        height={100}
        className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
      />

      <h1 className="mt-6 text-center font-cal text-3xl dark:text-white">
        {token ? "Reset Password" : "Forgot Password"}
      </h1>
      <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
        {token
          ? "Enter your new password below."
          : "Enter your email and we’ll send you a reset link."}
      </p>

      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        {token ? (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col">
            <input
              type="password"
              placeholder="New password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="my-4 w-full rounded-md border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-black dark:text-white"
            />
            <FormButton isSubmitting={isSubmitting} label="Reset Password" />
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="flex flex-col">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="my-4 w-full rounded-md border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-black dark:text-white"
            />
            <FormButton isSubmitting={isSubmitting} label="Send Reset Link" />
          </form>
        )}
      </div>

      <div className="mt-5 text-center text-sm text-stone-400">
        <Link href="/login" className="underline hover:text-stone-200">
          Back to login
        </Link>
      </div>

      <div className="mt-2 text-center text-sm text-stone-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline hover:text-stone-200">
          Sign up
        </Link>
      </div>
    </div>
  );
}
