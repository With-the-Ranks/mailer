import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import SiteSettingsNav from "./nav";

export default async function OrganizationAnalyticsLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const { id } = await params;
  const data = await prisma.organization.findUnique({
    where: {
      id: decodeURIComponent(id),
      users: {
        some: {
          id: {
            in: [session!.user.id as string],
          },
        },
      },
    },
  });

  if (!data) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center space-y-2 space-x-4 lg:flex-row lg:space-y-0">
        <h1 className="font-cal text-xl font-bold sm:text-3xl dark:text-white">
          Settings for {data.name}
        </h1>
      </div>
      <SiteSettingsNav />
      {children}
    </>
  );
}
