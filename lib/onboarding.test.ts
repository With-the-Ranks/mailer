import { describe, expect, test } from "vitest";

import { buildOnboardingState, type OnboardingInput } from "@/lib/onboarding";

function baseInput(overrides: Partial<OnboardingInput> = {}): OnboardingInput {
  return {
    organizationId: "org_123",
    organizationName: null,
    organizationLogo: null,
    organizationTimezone: null,
    activeDomainStatus: null,
    contactCount: 0,
    signupFormCount: 0,
    emailCount: 0,
    ...overrides,
  };
}

describe("buildOnboardingState", () => {
  test("branding is incomplete when organization logo is still the default", () => {
    const result = buildOnboardingState(
      baseInput({
        organizationName: "Acme",
        organizationLogo:
          "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/V9V9woJ-p15PivASjXuq5gIW6xpgCb6Pes69i3.png",
        organizationTimezone: "America/New_York",
      }),
    );

    const brandingStep = result.steps.find((step) => step.id === "branding");
    expect(brandingStep?.completed).toBe(false);
  });

  test("returns all steps incomplete and shouldShow true when no data exists", () => {
    const result = buildOnboardingState(baseInput());

    expect(result.completedCount).toBe(0);
    expect(result.totalCount).toBe(5);
    expect(result.progressPercent).toBe(0);
    expect(result.isComplete).toBe(false);
    expect(result.shouldShow).toBe(true);
  });

  test("brand step does not require domain verification", () => {
    const result = buildOnboardingState(
      baseInput({
        organizationName: "Acme",
        organizationLogo: "https://example.com/logo.png",
        organizationTimezone: "America/New_York",
        activeDomainStatus: null,
      }),
    );

    const brandingStep = result.steps.find((step) => step.id === "branding");
    expect(brandingStep?.completed).toBe(true);
  });

  test("domain setup step accepts verified status case-insensitively", () => {
    const result = buildOnboardingState(
      baseInput({
        activeDomainStatus: "VerIfied",
      }),
    );

    const domainStep = result.steps.find((step) => step.id === "domain-setup");
    expect(domainStep?.completed).toBe(true);
  });

  test("domain setup step is incomplete when status is missing", () => {
    const result = buildOnboardingState(
      baseInput({ activeDomainStatus: null }),
    );

    const domainStep = result.steps.find((step) => step.id === "domain-setup");
    expect(domainStep?.completed).toBe(false);
  });

  test("marks add people complete when contact count is greater than zero", () => {
    const result = buildOnboardingState(baseInput({ contactCount: 1 }));

    const peopleStep = result.steps.find((step) => step.id === "people");
    expect(peopleStep?.completed).toBe(true);
  });

  test("marks create signup complete when signup form count is greater than zero", () => {
    const result = buildOnboardingState(baseInput({ signupFormCount: 1 }));

    const signupStep = result.steps.find((step) => step.id === "signup");
    expect(signupStep?.completed).toBe(true);
  });

  test("marks create first email complete when email count is greater than zero", () => {
    const result = buildOnboardingState(baseInput({ emailCount: 1 }));

    const emailStep = result.steps.find((step) => step.id === "first-email");
    expect(emailStep?.completed).toBe(true);
  });

  test("returns fully complete state and shouldShow false when all steps are complete", () => {
    const result = buildOnboardingState(
      baseInput({
        organizationName: "Acme",
        organizationLogo: "https://example.com/logo.png",
        organizationTimezone: "America/New_York",
        activeDomainStatus: "success",
        contactCount: 2,
        signupFormCount: 1,
        emailCount: 1,
      }),
    );

    expect(result.completedCount).toBe(5);
    expect(result.totalCount).toBe(5);
    expect(result.progressPercent).toBe(100);
    expect(result.isComplete).toBe(true);
    expect(result.shouldShow).toBe(false);
  });

  test("builds step links using organization id", () => {
    const result = buildOnboardingState(
      baseInput({ organizationId: "org_abc" }),
    );
    const hrefs = result.steps.map((step) => step.href);

    expect(hrefs).toEqual([
      "/organization/org_abc/settings",
      "/organization/org_abc/settings/domains",
      "/organization/org_abc/audience",
      "/organization/org_abc/signup-forms/edit",
      "/email/create?organizationId=org_abc",
    ]);
  });

  test("uses the expected 5-step order and labels", () => {
    const result = buildOnboardingState(baseInput());

    expect(
      result.steps.map((step) => ({ id: step.id, title: step.title })),
    ).toEqual([
      { id: "branding", title: "Configure branding" },
      { id: "domain-setup", title: "Domain setup" },
      { id: "people", title: "Add people" },
      { id: "signup", title: "Create signup" },
      { id: "first-email", title: "Create your first email" },
    ]);
  });

  test("uses create-contact route when audience list id exists", () => {
    const result = buildOnboardingState(
      baseInput({
        organizationId: "org_abc",
        audienceListId: "aud_123",
      }),
    );

    const contactStep = result.steps.find((step) => step.id === "people");
    expect(contactStep?.href).toBe("/audience/aud_123?action=add-contact");
    expect(contactStep?.scroll).toBe(false);
  });
});
