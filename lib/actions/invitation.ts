"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import React from "react";

import { sendEmail } from "@/lib/actions/send-email";
import { getSession, getUserOrgRole, isOrgMember } from "@/lib/auth";
import InvitationEmail from "@/lib/email-templates/invitation-email";
import prisma from "@/lib/prisma";

export type InvitationType = "email" | "link";

// Create an invitation (email-based or shareable link)
export async function createInvitation(
  organizationId: string,
  email: string | null, // null for shareable links
  role: "ADMIN" | "MANAGER",
  expiresInDays?: number, // optional expiration for shareable links
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Check if user is an admin of this organization
  const requesterRole = await getUserOrgRole(session.user.id, organizationId);
  if (requesterRole !== "ADMIN") {
    return { error: "Only admins can invite members" };
  }

  // For email invitations, check if user already exists or is already a member
  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMember = await (
        prisma as any
      ).organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: existingUser.id,
            organizationId,
          },
        },
      });

      if (existingMember) {
        return { error: "User is already a member of this organization" };
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await (
      prisma as any
    ).organizationInvitation.findFirst({
      where: {
        email,
        organizationId,
        acceptedAt: null,
      },
    });

    if (existingInvitation) {
      return { error: "An invitation has already been sent to this email" };
    }
  }

  const token = crypto.randomUUID();
  const expiresAt = expiresInDays ? addDays(new Date(), expiresInDays) : null;

  try {
    const invitation = await (prisma as any).organizationInvitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        organizationId,
        invitedById: session.user.id,
      },
      include: {
        organization: true,
        invitedBy: true,
      },
    });

    // Send email invitation if email is provided
    if (email) {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXTAUTH_URL || "http://app.localhost:3000";
      const inviteUrl = `${baseUrl}/accept-invite?token=${token}`;

      const emailContent = React.createElement(InvitationEmail, {
        inviteUrl,
        organizationName: invitation.organization.name || "an organization",
        inviterName: invitation.invitedBy.name || invitation.invitedBy.email,
        role: role,
        expiresAt,
      });

      try {
        await sendEmail({
          to: email,
          from: "Mailer",
          subject: `Invitation to join ${invitation.organization.name || "organization"}`,
          react: emailContent,
          previewText: `You've been invited to join ${invitation.organization.name}`,
        });
      } catch (emailError) {
        console.error("Error sending invitation email:", emailError);
        // Don't fail the invitation creation if email fails
      }
    }

    revalidatePath(`/organization/${organizationId}/settings/members`);

    return { success: true, invitation };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return { error: "Failed to create invitation" };
  }
}

// Accept an invitation
export async function acceptInvitation(token: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const invitation: any = await (
    prisma as any
  ).organizationInvitation.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invitation) {
    return { error: "Invalid invitation" };
  }

  if (invitation.acceptedAt) {
    return { error: "Invitation has already been accepted" };
  }

  if (invitation.expiresAt && new Date() > invitation.expiresAt) {
    return { error: "Invitation has expired" };
  }

  if (
    invitation.email &&
    invitation.email.toLowerCase() !== session.user.email?.toLowerCase()
  ) {
    return {
      error:
        "This invitation is linked to a different email address. Please sign in or create an account using the invited email.",
    };
  }

  const existingMember = await isOrgMember(
    session.user.id,
    invitation.organizationId,
  );

  if (existingMember) {
    return { error: "You are already a member of this organization" };
  }

  try {
    await (prisma as any).organizationMember.create({
      data: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    await (prisma as any).organizationInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { currentOrganizationId: invitation.organizationId },
    });

    revalidatePath(
      `/organization/${invitation.organizationId}/settings/members`,
    );
    revalidatePath(`/organization/${invitation.organizationId}`);
    revalidatePath("/");

    return {
      success: true,
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { error: "Failed to accept invitation" };
  }
}

// Revoke an invitation
export async function revokeInvitation(invitationId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const invitation: any = await (
    prisma as any
  ).organizationInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    return { error: "Invitation not found" };
  }

  // Check if user is an admin of this organization
  const role = await getUserOrgRole(session.user.id, invitation.organizationId);
  if (role !== "ADMIN") {
    return { error: "Only admins can revoke invitations" };
  }

  try {
    await (prisma as any).organizationInvitation.delete({
      where: { id: invitationId },
    });

    revalidatePath(
      `/organization/${invitation.organizationId}/settings/members`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error revoking invitation:", error);
    return { error: "Failed to revoke invitation" };
  }
}

// Get pending invitations for an organization
export async function getOrganizationInvitations(organizationId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Check if user is a member of this organization
  const member = await isOrgMember(session.user.id, organizationId);
  if (!member) {
    return { error: "Not authorized" };
  }

  const invitations = await (prisma as any).organizationInvitation.findMany({
    where: {
      organizationId,
      acceptedAt: null,
    },
    include: {
      invitedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, invitations };
}

// Remove a member from organization (admin only)
export async function removeMember(organizationId: string, userId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Check if requester is an admin
  const requesterRole = await getUserOrgRole(session.user.id, organizationId);
  if (requesterRole !== "ADMIN") {
    return { error: "Only admins can remove members" };
  }

  // Prevent self-removal
  if (userId === session.user.id) {
    return { error: "You cannot remove yourself" };
  }

  try {
    await (prisma as any).organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    revalidatePath(`/organization/${organizationId}/settings/members`);

    return { success: true };
  } catch (error) {
    console.error("Error removing member:", error);
    return { error: "Failed to remove member" };
  }
}

// Update member role (admin only)
export async function updateMemberRole(
  organizationId: string,
  userId: string,
  newRole: "ADMIN" | "MANAGER",
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Check if requester is an admin
  const requesterMemberRole = await getUserOrgRole(
    session.user.id,
    organizationId,
  );
  if (requesterMemberRole !== "ADMIN") {
    return { error: "Only admins can change member roles" };
  }

  // Prevent self-demotion if they're the only admin
  if (userId === session.user.id && newRole !== "ADMIN") {
    const adminCount = await (prisma as any).organizationMember.count({
      where: {
        organizationId,
        role: "ADMIN",
      },
    });

    if (adminCount === 1) {
      return {
        error: "Cannot demote the only admin. Promote another member first.",
      };
    }
  }

  try {
    await (prisma as any).organizationMember.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: { role: newRole },
    });

    revalidatePath(`/organization/${organizationId}/settings/members`);

    return { success: true };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { error: "Failed to update member role" };
  }
}
