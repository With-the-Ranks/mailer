import { getOrgAndAudienceList } from "@/lib/actions";
import { getUserOrgRole } from "@/lib/auth";
import { buildOnboardingState, type OnboardingState } from "@/lib/onboarding";
import prisma from "@/lib/prisma";

export type CurrentOnboardingState = {
  organizationId: string | null;
  userRole: "ADMIN" | "MANAGER" | null;
  onboarding: OnboardingState | null;
};

export async function getCurrentOnboardingState(
  userId: string,
): Promise<CurrentOnboardingState> {
  const orgData = await getOrgAndAudienceList();
  const currentOrgId = orgData?.orgId ?? null;

  if (!currentOrgId) {
    return {
      organizationId: null,
      userRole: null,
      onboarding: null,
    };
  }

  const [role, org, contactCount, signupFormCount, emailCount] =
    await Promise.all([
      getUserOrgRole(userId, currentOrgId),
      prisma.organization.findUnique({
        where: { id: currentOrgId },
        select: {
          name: true,
          fromName: true,
          logo: true,
          timezone: true,
          activeDomain: {
            select: {
              status: true,
            },
          },
        },
      }),
      prisma.audience.count({
        where: {
          audienceList: {
            organizationId: currentOrgId,
          },
        },
      }),
      prisma.signupForm.count({
        where: {
          organizationId: currentOrgId,
        },
      }),
      prisma.email.count({
        where: {
          organizationId: currentOrgId,
        },
      }),
    ]);

  return {
    organizationId: currentOrgId,
    userRole: role === "ADMIN" || role === "MANAGER" ? role : null,
    onboarding: buildOnboardingState({
      organizationId: currentOrgId,
      organizationName: org?.name,
      organizationFromName: org?.fromName,
      organizationLogo: org?.logo,
      organizationTimezone: org?.timezone,
      activeDomainStatus: org?.activeDomain?.status,
      audienceListId: orgData?.audienceListId,
      contactCount,
      signupFormCount,
      emailCount,
    }),
  };
}
