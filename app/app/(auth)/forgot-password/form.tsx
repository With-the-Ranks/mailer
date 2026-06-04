"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import Logo from "@/components/logo";
import FormButton from "@/components/form/form-button";

interface ForgotPasswordFormProps {
  token?: string;
}

export default function ForgotPasswordForm({ token }: ForgotPasswordFormProps) {
  const router = useRouter();
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
    <div className="mx-5 rounded-lg border border-gray-200 bg-white py-10 shadow-lg sm:mx-auto sm:w-full sm:max-w-md dark:border-neutral-700 dark:bg-[#2D2D2D]">
      <div className="flex items-center justify-center">
        <Logo />
      </div>

      <h1 className="mt-6 text-center text-3xl font-semibold text-gray-900 dark:text-white">
        {token ? "Reset Password" : "Forgot Password"}
      </h1>
      <p className="mt-2 text-center text-base text-gray-600 dark:text-gray-400">
        {token
          ? "Enter your new password below."
          : "Enter your email and we'll send you a reset link."}
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
              disabled={isSubmitting}
              className="my-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-blue-700 focus:ring-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
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
              disabled={isSubmitting}
              className="my-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-blue-700 focus:ring-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-[#2D2D2D] dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
            />
            <FormButton isSubmitting={isSubmitting} label="Send Reset Link" />
          </form>
        )}
      </div>

      <div className="mt-5 text-center text-base text-gray-600 dark:text-gray-400">
        <Link
          href="/login"
          className="text-blue-700 underline hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
        >
          Back to login
        </Link>
      </div>

      <div className="mt-2 text-center text-base text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-blue-700 underline hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
