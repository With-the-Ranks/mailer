"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

export default function Logo() {
  const { state, isMobile, openMobile } = useSidebar();

  // Show text when expanded OR when on mobile with sidebar open
  const showText = state === "expanded" || (isMobile && openMobile);
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-4 ${
        isCollapsed ? "w-full justify-center" : ""
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-white outline-4 outline-neutral-300 ${
          state === "expanded" || (isMobile && openMobile)
            ? "h-14 w-14"
            : "h-7 w-7"
        }`}
      >
        <div
          className={`relative flex items-center justify-center rounded-lg bg-blue-700 ${
            state === "expanded" || (isMobile && openMobile)
              ? "h-12 w-12"
              : "h-5 w-5"
          }`}
        >
          <Image
            src="/mailer.svg"
            width={16}
            height={16}
            alt="Mailer Logo"
            className={`outline-2 -outline-offset-1 ${
              state === "expanded" || (isMobile && openMobile)
                ? "h-4 w-4"
                : "h-2.5 w-2.5"
            }`}
          />
        </div>
      </div>
      {showText && (
        <div className="font-logo h-6 w-16 justify-start text-2xl leading-7 font-bold text-blue-700 sm:h-7 sm:w-20 sm:text-3xl sm:leading-8 dark:text-white">
          Mailer
        </div>
      )}
    </Link>
  );
}
