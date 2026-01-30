import { redirect } from "next/navigation";

import DashboardStats from "@/components/DashboardStats";
import { getOrgAndAudienceList } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function Overview() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Fetch organizations via OrganizationMember junction table
  const memberships: any = await (prisma as any).organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  const organizations = memberships.map((m: any) => m.organization);

  const hasOrganization = organizations.length > 0;

  // Get current organization ID for filtering
  const orgData = await getOrgAndAudienceList();
  const currentOrgId = orgData?.orgId;

  return (
    <div className="flex w-full min-w-0 flex-col space-y-12 p-4 md:p-8 lg:p-16">
      {hasOrganization && currentOrgId && (
        <DashboardStats organizationId={currentOrgId} />
      )}
    </div>
  );
}
