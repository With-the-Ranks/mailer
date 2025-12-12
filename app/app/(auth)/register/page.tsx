import Image from "next/image";
import Link from "next/link";

import RegisterForm from "./form";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const callbackUrl =
    typeof searchParams.callbackUrl === "string"
      ? searchParams.callbackUrl
      : null;
  return (
    <div className="mx-5 bg-blue-700 py-10 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex items-center justify-center gap-2">
        <div className="relative h-4 w-4">
          <Image
            alt="Mailer"
            width={16}
            height={16}
            className="h-4 w-4"
            src="/mailer.svg"
          />
        </div>
        <div className="flex h-7 w-20 justify-start text-3xl leading-8 font-bold text-white">
          Mailer
        </div>
      </div>
      <p className="mt-2 text-center text-base text-white">
        Create your account and start sending beautiful emails.
      </p>
      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <RegisterForm callbackUrl={callbackUrl} />
      </div>
      <div className="mt-5 text-center text-base text-white">
        Already have an account?{" "}
        <Link href="/login" className="p-2 underline hover:text-gray-200">
          Log in
        </Link>
      </div>
    </div>
  );
}
