"use client";

import { useRouter } from "next/navigation";
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

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      {step === "credentials" ? (
        <>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            disabled={isSubmitting}
            className="mt-4 w-full max-w-md rounded-none border border-white bg-white/10 text-base text-white placeholder-white/70 focus:border-white focus:ring-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
            autoFocus
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            disabled={isSubmitting}
            className="my-4 w-full max-w-md rounded-none border border-white bg-white/10 text-base text-white placeholder-white/70 focus:border-white focus:ring-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <FormButton isSubmitting={isSubmitting} label="Continue" />
        </>
      ) : (
        <>
          <div className="mb-4 text-center">
            <p className="text-sm text-white">
              Logged in as{" "}
              <strong className="font-semibold">{formData.email}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setFormData((prev) => ({ ...prev, twoFactorToken: "" }));
              }}
              className="mt-1 text-xs text-white/80 hover:text-white hover:underline"
            >
              Use a different account
            </button>
          </div>
          <input
            name="twoFactorToken"
            type="text"
            value={formData.twoFactorToken}
            onChange={handleChange}
            placeholder={`Enter ${TOTP_CODE_LENGTH}-digit code`}
            disabled={isSubmitting}
            className="mt-4 w-full max-w-md rounded-none border border-white bg-white/10 text-base text-white placeholder-white/70 focus:border-white focus:ring-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={TOTP_CODE_LENGTH}
            pattern={`[0-9]{${TOTP_CODE_LENGTH}}`}
            required
            autoFocus
            autoComplete="one-time-code"
          />
          <p className="mt-2 text-xs text-white/80">
            Enter the {TOTP_CODE_LENGTH}-digit code from your authenticator app
          </p>
          <div className="mt-4">
            <FormButton isSubmitting={isSubmitting} label="Verify & Login" />
          </div>
        </>
      )}
    </form>
  );
}

export default SignInForm;
