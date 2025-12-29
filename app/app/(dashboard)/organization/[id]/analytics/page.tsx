import { notFound, redirect } from "next/navigation";

import EmailStats from "@/components/EmailStats";
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

  return <EmailStats organizationId={organizationId} />;
}
