"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/lib/actions/invitation";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { status } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAccepted, setAutoAccepted] = useState(false);

  const handleAccept = useCallback(async () => {
    if (!token) {
      setError("Invalid invitation link");
      return;
    }

    if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${token}`)}`,
      );
      return;
    }

    setLoading(true);
    try {
      const result = await acceptInvitation(token);

      if (result.error) {
        if (result.error === "Not authenticated") {
          // Redirect to login
          router.replace(
            `/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${token}`)}`,
          );
          return;
        }
        setError(result.error);
        toast.error(result.error);
      } else if (result.success) {
        toast.success(
          `Successfully joined ${result.organizationName || "organization"}!`,
        );
        // Use full page reload to ensure session is updated
        window.location.href = `/organization/${result.organizationId}`;
      }
    } catch (err) {
      setError("Failed to accept invitation");
      toast.error("Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  }, [token, status, router]);

  // Auto-accept invitation when user is authenticated and has a token
  useEffect(() => {
    if (
      status === "authenticated" &&
      token &&
      !autoAccepted &&
      !loading &&
      !error
    ) {
      console.log(
        "Auto-accepting invitation for authenticated user, token:",
        token,
      );
      setAutoAccepted(true);
      handleAccept();
    }
  }, [status, token, autoAccepted, loading, error, handleAccept]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Invalid Invitation</h1>
          <p className="text-muted-foreground">
            This invitation link is invalid or has expired.
          </p>
          <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Organization Invitation</h1>
          <p className="text-muted-foreground">
            You&apos;ve been invited to join an organization
          </p>
          {status === "unauthenticated" && (
            <p className="text-muted-foreground text-sm">
              You&apos;ll need to sign in or create an account to accept this
              invitation.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {status === "unauthenticated" ? (
            <>
              <Button
                onClick={() =>
                  router.push(
                    `/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${token}`)}`,
                  )
                }
                className="w-full"
                size="lg"
              >
                Sign In to Accept
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/register?callbackUrl=${encodeURIComponent(`/accept-invite?token=${token}`)}`,
                  )
                }
                variant="outline"
                className="w-full"
              >
                Create Account to Accept
              </Button>
            </>
          ) : loading || autoAccepted ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Processing invitation...</p>
            </div>
          ) : (
            <>
              <Button
                onClick={handleAccept}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </Button>

              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Decline
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
