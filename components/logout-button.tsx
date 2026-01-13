"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import posthog from "posthog-js";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Capture logout event before resetting PostHog
      posthog.capture("user_logged_out");
      posthog.reset();

      await signOut({
        redirect: false,
        callbackUrl: "/login",
      });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-start gap-2 text-sm font-normal text-black transition-opacity hover:opacity-80 dark:text-white"
      aria-label="Logout"
    >
      <span>Logout</span>
      <LogOut width={18} aria-hidden="true" />
    </button>
  );
}
