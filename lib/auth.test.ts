import { beforeEach, describe, expect, test, vi } from "vitest";

// Unit tests for authentication utilities

const mockGetServerSession = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findUnique: vi.fn() },
    verificationToken: { deleteMany: vi.fn(), create: vi.fn() },
    organizationMember: { findUnique: vi.fn() },
    email: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/actions/send-email", () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
}));

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("@/lib/utils", () => ({
  getBaseAppUrl: vi.fn().mockReturnValue("http://app.localhost:3000"),
  logError: vi.fn(),
  TOTP_TIME_WINDOW: 1,
}));

describe("resendVerificationEmail", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("returns error when user not found", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    const { resendVerificationEmail } = await import("@/lib/auth");

    const result = await resendVerificationEmail("unknown@example.com");

    expect(result.error).toMatch(/not found/i);
  });

  test("returns error when user already verified", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "verified@example.com",
      emailVerified: new Date(),
    });
    const { resendVerificationEmail } = await import("@/lib/auth");

    const result = await resendVerificationEmail("verified@example.com");

    expect(result.error).toMatch(/already verified/i);
  });

  test("sends verification email for unverified user", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    const { sendEmail } = await import("@/lib/actions/send-email");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "unverified@example.com",
      emailVerified: null,
    });
    (
      prisma.verificationToken.deleteMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
    (
      prisma.verificationToken.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
    const { resendVerificationEmail } = await import("@/lib/auth");

    const result = await resendVerificationEmail("unverified@example.com");

    expect(result.success).toBe(true);
    expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: "unverified@example.com" },
    });
    expect(prisma.verificationToken.create).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "unverified@example.com",
        subject: "Verify your email address",
      }),
    );
  });
});

describe("sendPasswordResetEmail", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("returns success even when user not found (security)", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    const { sendPasswordResetEmail } = await import("@/lib/auth");

    const result = await sendPasswordResetEmail("unknown@example.com");

    expect(result.success).toBe(true);
  });

  test("sends reset email when user exists", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    const { sendEmail } = await import("@/lib/actions/send-email");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    });
    (
      prisma.verificationToken.deleteMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
    (
      prisma.verificationToken.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
    const { sendPasswordResetEmail } = await import("@/lib/auth");

    const result = await sendPasswordResetEmail("user@example.com");

    expect(result.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Reset your password",
      }),
    );
  });

  test("deletes existing tokens before creating new one", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    });
    (
      prisma.verificationToken.deleteMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
    (
      prisma.verificationToken.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
    const { sendPasswordResetEmail } = await import("@/lib/auth");

    await sendPasswordResetEmail("user@example.com");

    expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: "user@example.com" },
    });
    expect(prisma.verificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: "user@example.com",
          token: expect.any(String),
          expires: expect.any(Date),
        }),
      }),
    );
  });
});

describe("getUserOrgRole", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("returns role when user is member", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ role: "ADMIN" });
    const { getUserOrgRole } = await import("@/lib/auth");

    const result = await getUserOrgRole("user-1", "org-1");

    expect(result).toBe("ADMIN");
  });

  test("returns null when user is not member", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const { getUserOrgRole } = await import("@/lib/auth");

    const result = await getUserOrgRole("user-1", "org-1");

    expect(result).toBeNull();
  });

  test("queries with correct compound key", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ role: "MANAGER" });
    const { getUserOrgRole } = await import("@/lib/auth");

    await getUserOrgRole("user-123", "org-456");

    expect(prisma.organizationMember.findUnique).toHaveBeenCalledWith({
      where: {
        userId_organizationId: {
          userId: "user-123",
          organizationId: "org-456",
        },
      },
      select: { role: true },
    });
  });
});

describe("isOrgMember", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("returns true when user is member", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ userId: "user-1" });
    const { isOrgMember } = await import("@/lib/auth");

    const result = await isOrgMember("user-1", "org-1");

    expect(result).toBe(true);
  });

  test("returns false when user is not member", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const { isOrgMember } = await import("@/lib/auth");

    const result = await isOrgMember("user-1", "org-1");

    expect(result).toBe(false);
  });
});

describe("withOrgAuth", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("returns error when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { withOrgAuth } = await import("@/lib/auth");
    const action = vi.fn();

    const wrappedAction = withOrgAuth(action);
    const result = await wrappedAction(null, "org-1", null);

    expect(result.error).toBe("Not authenticated");
    expect(action).not.toHaveBeenCalled();
  });

  test("returns error when not a member", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const { withOrgAuth } = await import("@/lib/auth");
    const action = vi.fn();

    const wrappedAction = withOrgAuth(action);
    const result = await wrappedAction(null, "org-1", null);

    expect(result.error).toBe("Not authorized");
    expect(action).not.toHaveBeenCalled();
  });

  test("calls action when user is member", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      role: "MANAGER",
      organization: { id: "org-1", name: "Test Org" },
    });
    const { withOrgAuth } = await import("@/lib/auth");
    const action = vi.fn().mockReturnValue({ success: true });

    const wrappedAction = withOrgAuth(action);
    const result = await wrappedAction(null, "org-1", "key-1");

    expect(action).toHaveBeenCalledWith(
      null,
      { id: "org-1", name: "Test Org" },
      "key-1",
      "MANAGER",
    );
    expect(result.success).toBe(true);
  });

  test("returns error when ADMIN required but user is MANAGER", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      role: "MANAGER",
      organization: { id: "org-1" },
    });
    const { withOrgAuth } = await import("@/lib/auth");
    const action = vi.fn();

    const wrappedAction = withOrgAuth(action, "ADMIN");
    const result = await wrappedAction(null, "org-1", null);

    expect(result.error).toBe("Admin access required");
    expect(action).not.toHaveBeenCalled();
  });

  test("allows ADMIN when ADMIN role required", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      role: "ADMIN",
      organization: { id: "org-1" },
    });
    const { withOrgAuth } = await import("@/lib/auth");
    const action = vi.fn().mockReturnValue({ success: true });

    const wrappedAction = withOrgAuth(action, "ADMIN");
    const result = await wrappedAction(null, "org-1", null);

    expect(action).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});

describe("withAdminAuth", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("requires ADMIN role", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    (
      prisma.organizationMember.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      role: "MANAGER",
      organization: { id: "org-1" },
    });
    const { withAdminAuth } = await import("@/lib/auth");
    const action = vi.fn();

    const wrappedAction = withAdminAuth(action);
    const result = await wrappedAction(null, "org-1", null);

    expect(result.error).toBe("Admin access required");
  });
});

describe("withEmailAuth", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("returns error when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { withEmailAuth } = await import("@/lib/auth");
    const action = vi.fn();

    const wrappedAction = withEmailAuth(action);
    const result = await wrappedAction(null, "email-1", null);

    expect(result.error).toBe("Not authenticated");
  });

  test("returns error when email not found", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    (prisma.email.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    const { withEmailAuth } = await import("@/lib/auth");
    const action = vi.fn();

    const wrappedAction = withEmailAuth(action);
    const result = await wrappedAction(null, "email-1", null);

    expect(result.error).toBe("Email not found");
  });

  test("returns error when user does not own email", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    (prisma.email.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "email-1",
      userId: "user-2",
      organization: { id: "org-1" },
    });
    const { withEmailAuth } = await import("@/lib/auth");
    const action = vi.fn();

    const wrappedAction = withEmailAuth(action);
    const result = await wrappedAction(null, "email-1", null);

    expect(result.error).toBe("Email not found");
  });

  test("calls action when user owns email", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    const emailRecord = {
      id: "email-1",
      userId: "user-1",
      organization: { id: "org-1" },
    };
    (prisma.email.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      emailRecord,
    );
    const { withEmailAuth } = await import("@/lib/auth");
    const action = vi.fn().mockReturnValue({ success: true });

    const wrappedAction = withEmailAuth(action);
    const result = await wrappedAction(null, "email-1", "key-1");

    expect(action).toHaveBeenCalledWith(null, emailRecord, "key-1");
    expect(result.success).toBe(true);
  });
});
