"use client";

import Link from "next/link";
import { useState } from "react";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { isSafeCallbackPath } from "@/lib/utils";

import RegisterForm from "./form";

export default function RegisterCard({
  callbackUrl,
}: {
  callbackUrl?: string | null;
}) {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const loginHref =
    callbackUrl && isSafeCallbackPath(callbackUrl)
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";

  if (registeredEmail) {
    return (
      <div className="mx-5 rounded-lg border border-gray-200 bg-white py-10 shadow-lg sm:mx-auto sm:w-full sm:max-w-lg dark:border-neutral-700 dark:bg-[#2D2D2D]">
        <div className="flex items-center justify-center">
          <Logo />
        </div>
        <div className="mx-auto mt-8 flex flex-col items-center px-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Check your email
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            We just sent a verification link to{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {registeredEmail}
            </span>
            . Click the link in that email to verify your account and sign in.
          </p>
          <Button asChild className="mt-8">
            <Link href={loginHref}>
              Go to login <span className="ml-1">→</span>
            </Link>
          </Button>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Didn&apos;t receive the email? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-5 rounded-lg border border-gray-200 bg-white py-10 shadow-lg sm:mx-auto sm:w-full sm:max-w-lg dark:border-neutral-700 dark:bg-[#2D2D2D]">
      <div className="flex items-center justify-center">
        <Logo />
      </div>
      <h1 className="mt-6 text-center text-2xl font-semibold text-gray-900 dark:text-white">
        Create an account
      </h1>
      <p className="mt-2 text-center text-base text-gray-600 dark:text-gray-400">
        Sign up and start sending beautiful emails.
      </p>
      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <RegisterForm
          callbackUrl={callbackUrl}
          onSuccess={setRegisteredEmail}
        />
      </div>
      <div className="mt-5 text-center text-base text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="p-2 text-blue-700 underline hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
