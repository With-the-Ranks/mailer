export type OnboardingStepId =
  | "branding"
  | "domain-setup"
  | "people"
  | "signup"
  | "first-email";

export type OnboardingStep = {
  id: OnboardingStepId;
  title: string;
  description: string;
  href: string;
  scroll?: boolean;
  completed: boolean;
};

export type OnboardingInput = {
  organizationId: string;
  organizationName: string | null | undefined;
  organizationFromName: string | null | undefined;
  organizationLogo: string | null | undefined;
  organizationTimezone: string | null | undefined;
  activeDomainStatus: string | null | undefined;
  audienceListId?: string | null | undefined;
  contactCount: number;
  signupFormCount: number;
  emailCount: number;
};

export type OnboardingState = {
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  isComplete: boolean;
  shouldShow: boolean;
};

const DEFAULT_ORGANIZATION_LOGO_URL =
  "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/V9V9woJ-p15PivASjXuq5gIW6xpgCb6Pes69i3.png";

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function hasCustomLogo(logo: string | null | undefined): boolean {
  if (!hasText(logo)) return false;
  return logo!.trim() !== DEFAULT_ORGANIZATION_LOGO_URL;
}

function isDomainVerified(status: string | null | undefined): boolean {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  return normalized === "success" || normalized === "verified";
}

export function buildOnboardingState(input: OnboardingInput): OnboardingState {
  const brandingComplete =
    (hasText(input.organizationFromName) || hasText(input.organizationName)) &&
    hasCustomLogo(input.organizationLogo) &&
    hasText(input.organizationTimezone);
  const domainSetupComplete = isDomainVerified(input.activeDomainStatus);

  const contactHref = input.audienceListId
    ? `/audience/${input.audienceListId}?action=add-contact`
    : `/organization/${input.organizationId}/audience`;

  const steps: OnboardingStep[] = [
    {
      id: "branding",
      title: "Configure branding",
      description: "Organization name, default from name, logo, and timezone",
      href: `/organization/${input.organizationId}/settings`,
      completed: brandingComplete,
    },
    {
      id: "domain-setup",
      title: "Domain setup",
      description: "Add and verify your sending domain",
      href: `/organization/${input.organizationId}/settings/domains`,
      completed: domainSetupComplete,
    },
    {
      id: "people",
      title: "Add people",
      description: "Create your first contact",
      href: contactHref,
      scroll: false,
      completed: input.contactCount > 0,
    },
    {
      id: "signup",
      title: "Create signup",
      description: "Create your first signup form",
      href: `/organization/${input.organizationId}/signup-forms/edit`,
      completed: input.signupFormCount > 0,
    },
    {
      id: "first-email",
      title: "Create your first email",
      description: "Create your first email draft",
      href: `/email/create?organizationId=${input.organizationId}`,
      scroll: false,
      completed: input.emailCount > 0,
    },
  ];

  const totalCount = steps.length;
  const completedCount = steps.filter((step) => step.completed).length;
  const isComplete = completedCount === totalCount;
  const shouldShow = !isComplete;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    steps,
    completedCount,
    totalCount,
    progressPercent,
    isComplete,
    shouldShow,
  };
}
