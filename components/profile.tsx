"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useSidebar } from "@/components/ui/sidebar";

import LogoutButton from "./logout-button";

export default function Profile() {
  const { state } = useSidebar();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => setSession(null));
  }, []);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Row 1: Profile picture and name - full width, left aligned */}
      <Link
        href="/settings"
        className="flex w-full items-center space-x-3 rounded-lg px-2 py-1.5 transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Image
          src={
            session.user.image ??
            `https://avatar.vercel.sh/${session.user.email}`
          }
          width={24}
          height={24}
          alt={session.user.name ?? "User avatar"}
          className="h-6 w-6 rounded-full"
        />
        {state === "expanded" && (
          <span className="truncate text-sm font-medium text-black dark:text-white">
            {session.user.name}
          </span>
        )}
      </Link>
    </div>
  );
}
