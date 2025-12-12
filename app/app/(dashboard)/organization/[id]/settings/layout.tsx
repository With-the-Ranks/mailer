import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getSession, getUserOrgRole } from "@/lib/auth";
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
  const organizationId = decodeURIComponent(id);

  // Check if user is a member and get their role
  const userRole = await getUserOrgRole(
    session.user.id as string,
    organizationId,
  );

  if (!userRole) {
    notFound();
  }

  // Settings pages require ADMIN role
  if (userRole !== "ADMIN") {
    redirect(`/organization/${organizationId}`);
  }

  const data = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!data) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center space-y-2 space-x-4 lg:flex-row lg:space-y-0">
        <h1 className="text-xl font-bold sm:text-3xl dark:text-white">
          Settings for {data.name}
        </h1>
      </div>
      <SiteSettingsNav />
      {children}
    </>
  );
}
