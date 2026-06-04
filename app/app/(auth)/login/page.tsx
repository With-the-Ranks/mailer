import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isSafeCallbackPath } from "@/lib/utils";

import SignInForm from "./form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const verify = typeof params.verify === "string" ? params.verify : null;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : null;

  const alert =
    verify === "success"
      ? {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: "Email verified",
          description: "You can now sign in.",
        }
      : verify === "expired"
        ? {
            icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
            title: "Link expired",
            description:
              "Your verification link has expired. Try signing in again.",
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
    <div className="mx-5 rounded-lg border border-gray-200 bg-white py-10 shadow-lg sm:mx-auto sm:w-full sm:max-w-md dark:border-neutral-700 dark:bg-[#2D2D2D]">
      <div className="flex items-center justify-center">
        <Logo />
      </div>
      <p className="mt-2 text-center text-base text-gray-600 dark:text-gray-400">
        Easiest way to send organizing emails.
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
      <div className="mt-2 text-center text-base">
        <Link
          href="/forgot-password"
          className="text-gray-600 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
        >
          Forgot password?
        </Link>
      </div>
      <div className="mt-5 text-center text-base text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${isSafeCallbackPath(callbackUrl) ? `?callbackUrl=${encodeURIComponent(callbackUrl as string)}` : ""}`}
          className="p-2 text-blue-700 underline hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
