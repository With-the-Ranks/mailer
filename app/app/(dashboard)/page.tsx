import { redirect } from "next/navigation";
import { Suspense } from "react";

import Emails from "@/components/emails";
import EmailStats from "@/components/EmailStats";
import Organizations from "@/components/organizations";
import OverviewOrganizationCTA from "@/components/overview-organizations-cta";
import PlaceholderCard from "@/components/placeholder-card";
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
  const currentOrgId = orgData?.orgId || null;

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      {/* <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Your Organization
          </h1>
          {!hasOrganization && <OverviewOrganizationCTA />}
        </div>
        <Organizations limit={1} />
      </div> */}

      {hasOrganization && (
        <EmailStats organizationId={currentOrgId || undefined} />
      )}
      {hasOrganization && (
        <div className="flex flex-col space-y-6">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Recent Emails
          </h1>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <PlaceholderCard key={i} />
                ))}
              </div>
            }
          >
            <Emails limit={8} organizationId={currentOrgId || undefined} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
