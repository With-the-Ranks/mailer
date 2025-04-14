"use client";

import {
  ArrowLeft,
  Edit3,
  LayoutDashboard,
  Menu,
  Newspaper,
  RadioTower,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useSelectedLayoutSegments,
} from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { getOrganizationFromUserId } from "@/lib/actions";

export default function Nav({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const { id } = useParams() as { id?: string };

  const [siteId, setSiteId] = useState<string | null>(null);
  const [organizationFound, setOrganizationFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getOrganizationFromUserId().then((orgId) => {
      setSiteId(orgId ?? null);
      setOrganizationFound(!!orgId);
      setLoading(false);
    });
  }, [id]);

  const tabs = useMemo(() => {
    if (loading) return []; // Avoid showing incomplete menu while loading

    if (segments[0] === "email" && id) {
      return [
        {
          name: "Back to All Emails",
          href: siteId ? `/organization/${siteId}` : "/organizations",
          icon: <ArrowLeft width={18} />,
        },
        {
          name: "Editor",
          href: `/email/${id}`,
          isActive: segments.length === 2,
          icon: <Edit3 width={18} />,
        },
        {
          name: "Settings",
          href: `/email/${id}/settings`,
          isActive: segments.includes("settings"),
          icon: <Settings width={18} />,
        },
      ];
    } else if (segments[0] === "audience" && id) {
      return [
        {
          name: "Back to Audience Lists",
          href: siteId ? `/organization/${siteId}/audience` : "/organizations",
          icon: <ArrowLeft width={18} />,
        },
        {
          name: "Audience",
          href: `/audience/${id}`,
          isActive: segments.length === 2,
          icon: <RadioTower width={18} />,
        },
      ];
    }

    if (organizationFound) {
      return [
        {
          name: "Dashboard",
          href: "/organizations",
          isActive: segments[0] === "organizations",
          icon: <LayoutDashboard width={18} />,
        },
        {
          name: "Audience",
          href: `/organization/${siteId}/audience`,
          isActive: segments.includes("audience"),
          icon: <RadioTower width={18} />,
        },
        {
          name: "Emails",
          href: `/organization/${siteId}`,
          isActive: segments.length === 2,
          icon: <Newspaper width={18} />,
        },
        {
          name: "Settings",
          href: `/organization/${siteId}/settings`,
          isActive: segments.includes("settings"),
          icon: <Settings width={18} />,
        },
      ];
    } else {
      return [
        {
          name: "Overview",
          href: "/",
          isActive: segments.length === 0,
          icon: <LayoutDashboard width={18} />,
        },
        {
          name: "Organization",
          href: "/organizations",
          isActive: segments[0] === "organizations",
          icon: <LayoutDashboard width={18} />,
        },
        {
          name: "Settings",
          href: "/settings",
          isActive: segments[0] === "settings",
          icon: <Settings width={18} />,
        },
      ];
    }
  }, [segments, id, siteId, organizationFound, loading]);

  const [showSidebar, setShowSidebar] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setShowSidebar(false);
  }, [pathname]);

  return (
    <>
      <button
        className={`fixed z-20 ${
          segments[0] === "email" && segments.length === 2 && !showSidebar
            ? "left-5 top-5"
            : "right-5 top-7"
        } sm:hidden`}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <Menu width={20} />
      </button>
      <div
        className={`transform ${
          showSidebar ? "w-full translate-x-0" : "-translate-x-full"
        } fixed z-10 flex h-full flex-col justify-between border-r border-stone-200 bg-stone-100 p-4 transition-all dark:border-stone-700 dark:bg-stone-900 sm:w-60 sm:translate-x-0`}
      >
        <div className="grid gap-2">
          <div className="flex items-center space-x-2 rounded-lg py-1.5">
            <Link
              href="/"
              className="flex w-full items-start space-x-2 rounded-lg px-2 py-3 hover:bg-stone-200 dark:hover:bg-stone-700"
            >
              <Image
                src="/logo.png"
                width={24}
                height={24}
                alt="Logo"
                className="dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
              />
              <span className="font-bold">The Mailer</span>
            </Link>
          </div>
          <div className="grid gap-1">
            {tabs.map(({ name, href, isActive, icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center space-x-3 ${
                  isActive ? "bg-stone-200 text-black dark:bg-stone-700" : ""
                } rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800`}
              >
                {icon}
                <span className="text-sm font-medium">{name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="my-2 border-t border-stone-200 dark:border-stone-700" />
          {children}
        </div>
      </div>
    </>
  );
}
