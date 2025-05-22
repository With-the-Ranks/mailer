import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import SignInForm from "./form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const verify =
    typeof searchParams.verify === "string" ? searchParams.verify : null;

  const alert =
    verify === "success"
      ? {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: "Email verified",
          description: "You can now log in.",
        }
      : verify === "expired"
        ? {
            icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
            title: "Link expired",
            description:
              "Your verification link has expired. Try logging in again.",
            variant: "destructive",
          }
        : verify === "invalid"
          ? {
              icon: <XCircle className="h-5 w-5 text-red-500" />,
              title: "Invalid link",
              description: "The verification link is invalid.",
              variant: "destructive",
            }
          : null;

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
        Build engaging email campaigns.
      </p>

      {alert && (
        <div className="mx-auto mt-6 w-11/12 max-w-xs">
          <Alert variant={"default"}>
            {alert.icon}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <SignInForm />
      </div>
      <div className="mt-2 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-stone-400 hover:text-stone-200 hover:underline"
        >
          Forgot password?
        </Link>
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
    </div>
  );
}
