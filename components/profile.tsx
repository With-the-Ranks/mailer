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
    <div className="flex w-full items-center justify-between">
      <Link
        href="/settings"
        className="flex w-full flex-1 items-center space-x-3 rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
      >
        <Image
          src={
            session.user.image ??
            `https://avatar.vercel.sh/${session.user.email}`
          }
          width={40}
          height={40}
          alt={session.user.name ?? "User avatar"}
          className="h-6 w-6 rounded-full"
        />
        {state === "expanded" && (
          <span className="truncate text-sm font-medium">
            {session.user.name}
          </span>
        )}
      </Link>
      {state === "expanded" && <LogoutButton />}
    </div>
  );
}
