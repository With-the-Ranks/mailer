import { notFound, redirect } from "next/navigation";

import AnalyticsDetails from "@/components/AnalyticsDetails";
import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function OrganizationAnalytics({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const organizationId = decodeURIComponent(id);

  const isMember = await isOrgMember(session.user.id as string, organizationId);
  if (!isMember) {
    notFound();
  }

  const data = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });
  if (!data) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <AnalyticsDetails organizationId={organizationId} />
    </div>
  );
}
