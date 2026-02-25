import { redirect } from "next/navigation";

import DashboardStats from "@/components/DashboardStats";
import { EmailTable } from "@/components/email-table";
import {
  UpcomingScheduleTable,
  type UpcomingEmail,
} from "@/components/upcoming-schedule-table";
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

  let upcomingEmails: UpcomingEmail[] = [];
  let orgTimezone: string | null = "America/New_York";
  let recentEmails: Awaited<
    ReturnType<
      typeof prisma.email.findMany<{ include: { organization: true } }>
    >
  > = [];

  if (hasOrganization && currentOrgId) {
    const [org, upcoming, recent] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: currentOrgId },
        select: { timezone: true },
      }),
      prisma.email.findMany({
        where: {
          organizationId: currentOrgId,
          published: true,
          scheduledTime: {
            gt: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          subject: true,
          title: true,
          scheduledTime: true,
        },
        orderBy: { scheduledTime: "asc" },
        take: 50,
      }),
      prisma.email.findMany({
        where: { organizationId: currentOrgId },
        include: { organization: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);
    orgTimezone = org?.timezone ?? "America/New_York";
    upcomingEmails = upcoming.map((e) => ({
      id: e.id,
      subject: e.subject,
      title: e.title,
      scheduledTime: e.scheduledTime,
    }));
    recentEmails = recent;
  }

  return (
    <div className="flex w-full min-w-0 flex-col space-y-12 p-4 md:p-8 lg:p-16">
      {hasOrganization && currentOrgId && (
        <>
          <UpcomingScheduleTable
            emails={upcomingEmails}
            timezone={orgTimezone}
            organizationId={currentOrgId}
          />
          <section>
            <h2 className="mb-4 self-stretch text-left text-xl font-normal text-black dark:text-white">
              Recent
            </h2>
            <div>
              <EmailTable
                emails={recentEmails}
                hidePagination
                firstColumnLabel="Name"
              />
            </div>
          </section>
          <DashboardStats organizationId={currentOrgId} />
        </>
      )}
    </div>
  );
}
