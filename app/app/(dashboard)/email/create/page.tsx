import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EmailWizard } from "@/components/email-wizard";
import type { WizardState } from "@/components/email-wizard/types";

export default async function EmailCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ emailId?: string; organizationId?: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { emailId: emailIdParam, organizationId: orgIdParam } =
    await searchParams;

  // Get organization ID - either from params or from user's current org
  let organizationId: string | null = null;

  if (orgIdParam) {
    organizationId = orgIdParam;
  } else {
    // Get user's current organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentOrganizationId: true,
        organizationId: true,
      },
    });

    // Try currentOrganizationId first, fallback to organizationId
    organizationId =
      user?.currentOrganizationId || user?.organizationId || null;
  }

  if (!organizationId) {
    notFound();
  }

  // Check if user is a member of this organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
    include: {
      organization: {
        select: {
          subdomain: true,
          logo: true,
          image: true,
        },
      },
    },
  });

  if (!membership) {
    notFound();
  }

  let emailId: string | null = null;
  let existingEmail: any = null;

  // If emailId is provided in query params, load existing draft
  if (emailIdParam) {
    existingEmail = await prisma.email.findUnique({
      where: { id: emailIdParam },
      select: {
        id: true,
        title: true,
        subject: true,
        from: true,
        replyTo: true,
        previewText: true,
        content: true,
        template: true,
        segmentId: true,
        audienceListId: true,
        scheduledTime: true,
        published: true,
      },
    });

    // Only allow loading unpublished drafts
    if (existingEmail && !existingEmail.published) {
      emailId = existingEmail.id;
    }
  }

  // Build initial wizard state - don't create email yet, wait for campaign name
  const initialState: WizardState = {
    emailId,
    organizationId,
    currentStep: 1,
    formData: {
      title: existingEmail?.title || "",
      subject: existingEmail?.subject || "",
      from: existingEmail?.from || "With The Ranks",
      replyTo: existingEmail?.replyTo || "",
      previewText: existingEmail?.previewText || "",
      content:
        existingEmail?.content || JSON.stringify({ type: "doc", content: [] }),
      template: existingEmail?.template || null,
      selectedSegment: existingEmail?.segmentId || null,
      audienceListId: existingEmail?.audienceListId || null,
      scheduledTime: existingEmail?.scheduledTime?.toISOString() || null,
    },
    isDirty: false,
    isSaving: false,
    lastSaved: null,
  };

  return (
    <EmailWizard
      initialState={initialState}
      organizationData={membership.organization}
    />
  );
}
