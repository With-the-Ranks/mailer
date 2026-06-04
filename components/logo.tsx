"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarOptional } from "@/components/ui/sidebar";

interface LogoProps {
  showText?: boolean;
  clickable?: boolean;
}

export default function Logo({
  showText: showTextProp,
  clickable = true,
}: LogoProps) {
  // Try to get sidebar context, but don't throw if it doesn't exist (for auth pages)
  const sidebarContext = useSidebarOptional();

  // Default to expanded state when used outside sidebar context (auth pages)
  const state = sidebarContext?.state ?? "expanded";
  const isMobile = sidebarContext?.isMobile ?? false;
  const openMobile = sidebarContext?.openMobile ?? false;

  // Show text when expanded OR when on mobile with sidebar open OR when no sidebar context (auth pages)
  // Unless explicitly overridden by prop
  const showText =
    showTextProp !== undefined
      ? showTextProp
      : !sidebarContext || state === "expanded" || (isMobile && openMobile);
  const isCollapsed = sidebarContext && state === "collapsed" && !isMobile;

  // For auth pages (no sidebar context), always use large size
  const isAuthPage = !sidebarContext;
  const logoSize =
    isAuthPage || state === "expanded" || (isMobile && openMobile)
      ? { outer: "h-14 w-14", inner: "h-12 w-12", image: "h-4 w-4" }
      : { outer: "h-7 w-7", inner: "h-5 w-5", image: "h-2.5 w-2.5" };

  const logoContent = (
    <>
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-white outline-4 outline-neutral-300 ${logoSize.outer}`}
      >
        <div
          className={`relative flex items-center justify-center rounded-lg bg-blue-700 ${logoSize.inner}`}
        >
          <Image
            src="/mailer.svg"
            width={16}
            height={16}
            alt="Mailer Logo"
            className={`outline-2 -outline-offset-1 ${logoSize.image}`}
          />
        </div>
      </div>
      {showText && (
        <div className="font-logo h-6 w-16 justify-start text-2xl leading-7 font-bold text-blue-700 sm:h-7 sm:w-20 sm:text-3xl sm:leading-8 dark:text-white">
          Mailer
        </div>
      )}
    </>
  );

  if (!clickable) {
    return (
      <div
        className={`inline-flex items-center gap-4 ${
          isCollapsed ? "w-full justify-center" : ""
        }`}
      >
        {logoContent}
      </div>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Go to home"
      className={`inline-flex items-center gap-4 ${
        isCollapsed ? "w-full justify-center" : ""
      }`}
    >
      {logoContent}
    </Link>
  );
}
