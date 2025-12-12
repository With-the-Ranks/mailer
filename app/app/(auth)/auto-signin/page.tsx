"use client";

import { CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function AutoSignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const email = searchParams.get("email");
  const verified = searchParams.get("verified");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!email || verified !== "true" || !token) {
      router.push("/login?verify=invalid");
      return;
    }

    // Automatically sign in the user using the temporary token
    const autoSignIn = async () => {
      setIsSigningIn(true);

      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password: token, // Use token as password for auto-signin
        });

        if (result?.error) {
          // If auto-signin fails, redirect to login with success message
          toast.success("Email verified successfully! Please sign in.");
          router.push("/login?verify=success");
        } else if (result?.ok) {
          // Successfully signed in - check for pending invitations
          try {
            const inviteCheck = await fetch("/api/check-pending-invite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });

            if (inviteCheck.ok) {
              const inviteData = await inviteCheck.json();
              if (inviteData?.hasInvite && inviteData?.token) {
                // Redirect to accept invite page
                window.location.href = `/accept-invite?token=${inviteData.token}`;
                return;
              }
            }
          } catch (err) {
            console.error("Error checking for pending invite:", err);
          }

          toast.success("Welcome! You've been automatically signed in.");
          router.push("/");
        }
      } catch (error) {
        console.error("Auto sign-in error:", error);
        toast.success("Email verified successfully! Please sign in.");
        router.push("/login?verify=success");
      }
    };

    autoSignIn();
  }, [email, verified, token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
          <p className="mt-2 text-gray-600">
            {isSigningIn
              ? "Signing you in automatically..."
              : "Redirecting you to your dashboard..."}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="h-2 w-32 rounded-full bg-gray-200">
            <div className="h-2 w-full animate-pulse rounded-full bg-green-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutoSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="mx-auto max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Email Verified!
              </h1>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <AutoSignInContent />
    </Suspense>
  );
}
