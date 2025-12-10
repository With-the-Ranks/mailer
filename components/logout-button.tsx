"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="flex items-center justify-start gap-[5px] text-sm font-normal text-white transition-opacity hover:opacity-80"
      aria-label="Logout"
    >
      <span>Logout</span>
      <LogOut width={18} aria-hidden="true" />
    </button>
  );
}
