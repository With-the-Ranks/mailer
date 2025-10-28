"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import FormButton from "@/components/form/form-button";
import { TOTP_CODE_LENGTH } from "@/lib/utils";

function SignInForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorToken: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      twoFactorToken: formData.twoFactorToken || "",
    });

    if (result?.error) {
      if (result.error.toLowerCase().includes("verify")) {
        toast.error("Please verify your email", {
          action: {
            label: "Resend",
            onClick: async () => {
              toast.dismiss();

              const res = await fetch("/api/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
              }).then((res) => res.json());

              if (res.success) {
                toast.success("Verification email resent");
              } else {
                toast.error("Unable to resend verification email");
              }
            },
          },
        });
      } else if (result.error === "2FA_REQUIRED") {
        // Move to 2FA step
        setStep("2fa");
        toast.info("Please enter your 2FA code");
      } else {
        toast.error(`Login Failed: ${result.error}`);
      }

      setIsSubmitting(false);
      return;
    }

    toast.success("Login Successful");
    router.push(callbackUrl || "/");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(new FormData(e.currentTarget));
      }}
    >
      {step === "credentials" ? (
        <>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="mt-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            required
            autoFocus
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="my-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            required
          />
          <FormButton isSubmitting={isSubmitting} label="Continue" />
        </>
      ) : (
        <>
          <div className="mb-4 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Logged in as <strong>{formData.email}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setFormData((prev) => ({ ...prev, twoFactorToken: "" }));
              }}
              className="mt-1 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              Use a different account
            </button>
          </div>
          <div className="w-full max-w-md">
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Two-Factor Authentication Code
            </label>
            <input
              name="twoFactorToken"
              type="text"
              value={formData.twoFactorToken}
              onChange={handleChange}
              placeholder={`Enter ${TOTP_CODE_LENGTH}-digit code`}
              className="w-full rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:ring-stone-500 focus:outline-hidden dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
              maxLength={TOTP_CODE_LENGTH}
              pattern={`[0-9]{${TOTP_CODE_LENGTH}}`}
              required
              autoFocus
              autoComplete="one-time-code"
            />
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              Enter the {TOTP_CODE_LENGTH}-digit code from your authenticator
              app
            </p>
          </div>
          <div className="mt-4">
            <FormButton isSubmitting={isSubmitting} label="Verify & Login" />
          </div>
        </>
      )}
    </form>
  );
}

export default SignInForm;
