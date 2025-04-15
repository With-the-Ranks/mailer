import Image from "next/image";
import Link from "next/link";

import RegisterForm from "./form";

export default function RegisterPage() {
  return (
    <div className="mx-5 border border-stone-200 py-10 dark:border-stone-700 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md">
      <Image
        alt="Mailer"
        width={100}
        height={100}
        className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
        src="/logo.png"
      />
      <h1 className="mt-6 text-center font-cal text-3xl dark:text-white">
        Mailer
      </h1>
      <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
        Create your account and start sending beautiful emails.
      </p>
      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <RegisterForm />
      </div>
      <div className="mt-5 text-center text-sm text-stone-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="rounded-lg p-2 underline hover:text-stone-200 dark:hover:text-stone-200"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
