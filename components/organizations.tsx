import type { Organization } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";

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
    <div className="mt-20 flex flex-col items-center space-x-4">
      {/* <h1 className="font-cal text-4xl">No Sites Yet</h1> */}
      <Image
        alt="missing organization"
        src="/empty-state.png"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any organizations yet. Create one to get started.
      </p>
    </div>
  );
}
