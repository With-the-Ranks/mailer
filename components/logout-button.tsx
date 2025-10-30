"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut()}
      variant="ghost"
      size="icon"
      className="rounded-lg"
      aria-label="Logout"
    >
      <LogOut width={18} aria-hidden="true" />
    </Button>
  );
}
