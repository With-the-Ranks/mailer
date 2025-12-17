"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
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
      className="flex items-center justify-start gap-[5px] text-sm font-normal text-white transition-opacity hover:opacity-80"
      aria-label="Logout"
    >
      <span>Logout</span>
      <LogOut width={18} aria-hidden="true" />
    </button>
  );
}
