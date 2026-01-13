import Link from "next/link";

import Logo from "@/components/logo";

import RegisterForm from "./form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : null;
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
        <RegisterForm callbackUrl={callbackUrl} />
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
