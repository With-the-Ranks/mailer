import { notFound, redirect } from "next/navigation";

import { getOrganizationInvitations } from "@/lib/actions/invitation";
import { getSession, getUserOrgRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

import MembersPageClient from "./members-client";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const organizationId = decodeURIComponent(id);

  // Check if user is a member
  const userRole = await getUserOrgRole(session.user.id, organizationId);
  if (!userRole) {
    notFound();
  }

  const isAdmin = userRole === "ADMIN";

  // Fetch organization members
  const members = await (prisma as any).organizationMember.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch pending invitations
  const invitationsResult = await getOrganizationInvitations(organizationId);
  const invitations = invitationsResult.success
    ? invitationsResult.invitations
    : [];

  // Fetch organization name
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });

  return (
    <MembersPageClient
      organizationId={organizationId}
      organizationName={organization?.name || "Organization"}
      currentUserId={session.user.id}
      isAdmin={isAdmin}
      members={members}
      invitations={invitations}
    />
  );
}
