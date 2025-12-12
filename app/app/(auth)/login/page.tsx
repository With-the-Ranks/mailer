import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import SignInForm from "./form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const verify = typeof params.verify === "string" ? params.verify : null;

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
        Easiest way to send organizing emails.
      </p>

      {alert && (
        <div className="mx-auto mt-6 w-11/12 max-w-xs">
          <Alert
            variant={"default"}
            className="border-white/20 bg-white/10 text-white"
          >
            {alert.icon}
            <AlertTitle className="text-white">{alert.title}</AlertTitle>
            <AlertDescription className="text-white/90">
              {alert.description}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <SignInForm />
      </div>
      <div className="mt-2 text-center text-base">
        <Link
          href="/forgot-password"
          className="text-white hover:text-gray-200 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <div className="mt-5 text-center text-base text-white">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="p-2 underline hover:text-gray-200">
          Sign up
        </Link>
      </div>
    </div>
  );
}
