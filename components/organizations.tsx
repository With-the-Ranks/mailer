import type { Organization } from "@/prisma/generated/prisma/client";
import { redirect } from "next/navigation";

import Logo from "@/components/logo";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import OrganizationCard from "./organization-card";

export default async function Organizations({
  organizations,
  limit,
}: {
  organizations?: Organization[];
  limit?: number;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!organizations) {
    const userId = session.user?.id;
    if (!userId) {
      redirect("/login");
    }

    // Fetch organizations via OrganizationMember junction table
    const memberships: any = await (prisma as any).organizationMember.findMany({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: "asc" },
      ...(limit ? { take: limit } : {}),
    });

    organizations = memberships.map((m: any) => m.organization);
  }

  return organizations!.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {organizations!.map((organization: Organization) => (
        <OrganizationCard key={organization.id} data={organization} />
      ))}
    </div>
  ) : (
    <div className="mt-20 flex flex-col items-center justify-center space-y-6 py-20">
      <div className="scale-150">
        <Logo showText={false} clickable={false} />
      </div>
      <p className="text-lg text-stone-500 dark:text-stone-400">
        You do not have any organizations yet. Create one to get started.
      </p>
    </div>
  );
}
