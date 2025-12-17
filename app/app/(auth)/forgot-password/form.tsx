"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    <div className="mx-5 bg-blue-700 py-10 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex items-center justify-center gap-2">
        <div className="relative h-4 w-4">
          <Image
            src="/mailer.svg"
            alt="Mailer"
            width={16}
            height={16}
            className="h-4 w-4"
          />
        </div>
        <div className="flex h-7 w-20 justify-start text-3xl leading-8 font-bold text-white">
          Mailer
        </div>
      </div>

      <h1 className="mt-6 text-center text-3xl !text-white">
        {token ? "Reset Password" : "Forgot Password"}
      </h1>
      <p className="mt-2 text-center text-base text-white">
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
              className="my-4 w-full rounded-none border border-white bg-white/10 px-3 py-2 text-base text-white placeholder-white/70 focus:border-white focus:ring-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
              className="my-4 w-full rounded-none border border-white bg-white/10 px-3 py-2 text-base text-white placeholder-white/70 focus:border-white focus:ring-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <FormButton isSubmitting={isSubmitting} label="Send Reset Link" />
          </form>
        )}
      </div>

      <div className="mt-5 text-center text-base text-white">
        <Link href="/login" className="underline hover:text-gray-200">
          Back to login
        </Link>
      </div>

      <div className="mt-2 text-center text-base text-white">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline hover:text-gray-200">
          Sign up
        </Link>
      </div>
    </div>
  );
}
