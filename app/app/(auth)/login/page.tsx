import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import SignInForm from "./form";
import LoginButton from "./login-button";

export default function LoginPage() {
  return (
    <div className="mx-5 border border-stone-200 py-10 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md dark:border-stone-700">
      <Image
        alt="Intrepid Email Campaign"
        width={100}
        height={100}
        className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
        src="/logo.png"
      />
      <h1 className="mt-6 text-center font-cal text-3xl dark:text-white">
        Intrepid Email Campaign
      </h1>
      <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
        Build engaging email campaigns.
        <br />
      </p>
      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <SignInForm />
      </div>
      <div className="mt-5 text-center text-sm text-stone-400">
        Don&apos;t have an account?
        <Link
          href="/register"
          className="rounded-lg p-2 underline hover:text-stone-200 dark:hover:text-stone-200"
        >
          Sign up
        </Link>
      </div>
      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <Suspense
          fallback={
            <div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />
          }
        >
          <LoginButton />
        </Suspense>
      </div>
    </div>
  );
}
