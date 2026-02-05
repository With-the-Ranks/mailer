import { beforeEach, describe, expect, test, vi } from "vitest";

// Unit tests for sendEmail functionality

const mockSendEmail = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    organization: { findUnique: vi.fn() },
    emailSuppression: { findUnique: vi.fn(), findMany: vi.fn() },
    audience: { findMany: vi.fn() },
    audienceList: { findUnique: vi.fn(), findFirst: vi.fn() },
    segment: { findUnique: vi.fn() },
    email: { update: vi.fn() },
    emailEvent: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn().mockResolvedValue({
    user: { id: "test-user-id", email: "test@example.com" },
  }),
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<html>Rendered</html>"),
}));

vi.mock("@maily-to/render", () => {
  class MockMaily {
    setPreviewText = vi.fn();
    render = vi.fn().mockResolvedValue("<html>Content</html>");
    setVariableValues = vi.fn();
  }
  return { Maily: MockMaily };
});

vi.mock("@/lib/email-providers", () => ({
  createEmailProvider: vi.fn(() => ({ sendEmail: mockSendEmail })),
  getDefaultProvider: vi.fn().mockReturnValue("ses"),
  isResendEnabled: vi.fn().mockReturnValue(false),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi
        .fn()
        .mockResolvedValue({ data: { id: "resend-id" }, error: null }),
      cancel: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  })),
}));

const mockRemoveJobs = vi.fn();
const mockQueueBulkEmails = vi.fn();
vi.mock("@/lib/queue", () => ({
  queueBulkEmails: (...args: unknown[]) => mockQueueBulkEmails(...args),
  removeJobs: (...args: unknown[]) => mockRemoveJobs(...args),
}));

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return { ...actual, logError: vi.fn() };
});

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendEmail.mockResolvedValue({ messageId: "msg-123", error: null });
  });

  describe("success paths", () => {
    test("returns message ID when sending HTML email", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (
        prisma.emailSuppression.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const { sendEmail } = await import("@/lib/actions/send-email");

      const result = await sendEmail({
        to: "recipient@example.com",
        from: "Sender",
        subject: "Test",
        html: "<p>Hello</p>",
        previewText: "Preview",
      });

      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test("calls provider sendEmail with correct parameters", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (
        prisma.emailSuppression.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const { sendEmail } = await import("@/lib/actions/send-email");

      await sendEmail({
        to: "recipient@example.com",
        from: "Sender",
        subject: "Test Subject",
        html: "<p>Hello</p>",
        previewText: "Preview",
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "recipient@example.com",
          subject: "Test Subject",
        }),
      );
    });

    test("renders Maily content to HTML before sending", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (
        prisma.emailSuppression.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const { sendEmail } = await import("@/lib/actions/send-email");
      const content = JSON.stringify({
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Hi" }] },
        ],
      });

      const result = await sendEmail({
        to: "recipient@example.com",
        from: "Sender",
        subject: "Test",
        content,
        previewText: "Preview",
      });

      expect(result.error).toBeUndefined();
      expect(mockSendEmail).toHaveBeenCalled();
    });

    test("renders React component to HTML for SES provider", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (
        prisma.emailSuppression.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const { render } = await import("@react-email/render");
      const { sendEmail } = await import("@/lib/actions/send-email");
      const React = await import("react");
      const component = React.createElement("div", null, "Test");

      const result = await sendEmail({
        to: "recipient@example.com",
        from: "Sender",
        subject: "Test",
        react: component,
        previewText: "Preview",
      });

      expect(render).toHaveBeenCalled();
      expect(result.error).toBeUndefined();
    });
  });

  describe("error handling", () => {
    test("returns error when provider fails to send", async () => {
      mockSendEmail.mockResolvedValue({
        messageId: null,
        error: "SMTP connection failed",
      });
      const { sendEmail } = await import("@/lib/actions/send-email");

      const result = await sendEmail({
        to: "recipient@example.com",
        from: "Sender",
        subject: "Test",
        html: "<p>Hello</p>",
        previewText: "Preview",
      });

      expect(result.error).toBe("SMTP connection failed");
      expect(result.data).toBeUndefined();
    });
  });

  describe("suppression list", () => {
    test("blocks sending to suppressed email addresses", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (
        prisma.emailSuppression.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: "sup-1",
        email: "bounced@example.com",
        reason: "HARD_BOUNCE",
      });
      const { sendEmail } = await import("@/lib/actions/send-email");

      const result = await sendEmail({
        to: "bounced@example.com",
        from: "Sender",
        subject: "Test",
        html: "<p>Hello</p>",
        previewText: "Preview",
      });

      expect(result.error).toContain("suppression list");
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    test("allows sending to non-suppressed email addresses", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (
        prisma.emailSuppression.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const { sendEmail } = await import("@/lib/actions/send-email");

      const result = await sendEmail({
        to: "valid@example.com",
        from: "Sender",
        subject: "Test",
        html: "<p>Hello</p>",
        previewText: "Preview",
      });

      expect(result.error).toBeUndefined();
      expect(mockSendEmail).toHaveBeenCalled();
    });
  });

  describe("from header formatting", () => {
    test("uses display name in from header", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (
        prisma.emailSuppression.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const { sendEmail } = await import("@/lib/actions/send-email");

      await sendEmail({
        to: "recipient@example.com",
        from: "Acme Corp",
        subject: "Test",
        html: "<p>Hello</p>",
        previewText: "Preview",
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining("Acme Corp"),
        }),
      );
    });

    test("extracts display name from email-like from field", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (
        prisma.emailSuppression.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const { sendEmail } = await import("@/lib/actions/send-email");

      await sendEmail({
        to: "recipient@example.com",
        from: "newsletter@company.com",
        subject: "Test",
        html: "<p>Hello</p>",
        previewText: "Preview",
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining("newsletter"),
        }),
      );
    });
  });
});

describe("sendBulkEmail SES scheduling", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: prisma } = await import("@/lib/prisma");
    (
      prisma.organization.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "org-1",
      activeDomain: {
        domain: "example.com",
        provider: "ses",
        status: "success",
        awsRegion: "us-east-1",
      },
    });
    (
      prisma.audienceList.findFirst as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "list-1",
      audiences: [
        {
          email: "a@example.com",
          firstName: "A",
          lastName: "User",
          customFields: {},
          audienceListId: "list-1",
        },
        {
          email: "b@example.com",
          firstName: "B",
          lastName: "User",
          customFields: {},
          audienceListId: "list-1",
        },
      ],
    });
    (
      prisma.emailSuppression.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (prisma.email.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    mockQueueBulkEmails.mockResolvedValue({
      success: 2,
      failed: 0,
      errors: [],
      jobIds: ["email-1-a@example.com-0", "email-1-b@example.com-1"],
    });
  });

  test("calls queueBulkEmails with correct job data and delay when scheduling in future", async () => {
    const { sendBulkEmail } = await import("@/lib/actions/send-email");
    const scheduledTime = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString();

    const result = await sendBulkEmail({
      id: "email-1",
      organizationId: "org-1",
      from: "Sender",
      subject: "Subject",
      content: null,
      previewText: null,
      scheduledTime,
    });

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(mockQueueBulkEmails).toHaveBeenCalledTimes(1);
    const [jobs, delayMs] = mockQueueBulkEmails.mock.calls[0];
    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({
      emailId: "email-1",
      to: "a@example.com",
      subject: "Subject",
      organizationId: "org-1",
      provider: "ses",
      jobIdSuffix: "-0",
    });
    expect(jobs[1].jobIdSuffix).toBe("-1");
    expect(delayMs).toBeGreaterThan(0);
    expect(delayMs).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 5000);
  });

  test("saves scheduledJobIds to database when all jobs queued", async () => {
    const { default: prisma } = await import("@/lib/prisma");
    const { sendBulkEmail } = await import("@/lib/actions/send-email");
    const scheduledTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await sendBulkEmail({
      id: "email-1",
      organizationId: "org-1",
      from: "Sender",
      subject: "Subject",
      content: null,
      previewText: null,
      scheduledTime,
    });

    expect(prisma.email.update).toHaveBeenCalledWith({
      where: { id: "email-1" },
      data: expect.objectContaining({
        published: true,
        scheduledTime: expect.any(Date),
        providerUsed: "ses",
        scheduledJobIds: ["email-1-a@example.com-0", "email-1-b@example.com-1"],
      }),
    });
  });

  test("returns error when queueBulkEmails has failures", async () => {
    mockQueueBulkEmails.mockResolvedValue({
      success: 1,
      failed: 1,
      errors: ["Batch 0: Redis error"],
      jobIds: ["email-1-a@example.com-0"],
    });

    const { sendBulkEmail } = await import("@/lib/actions/send-email");
    const scheduledTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const result = await sendBulkEmail({
      id: "email-1",
      organizationId: "org-1",
      from: "Sender",
      subject: "Subject",
      content: null,
      previewText: null,
      scheduledTime,
    });

    expect(result.success).toBeUndefined();
    expect(result.error).toContain("Failed to queue");
  });

  test("returns error when scheduled time is more than 365 days in future", async () => {
    const { sendBulkEmail } = await import("@/lib/actions/send-email");
    const scheduledTime = new Date(
      Date.now() + 366 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const result = await sendBulkEmail({
      id: "email-1",
      organizationId: "org-1",
      from: "Sender",
      subject: "Subject",
      content: null,
      previewText: null,
      scheduledTime,
    });

    expect(result.error).toContain("365 days");
    expect(mockQueueBulkEmails).not.toHaveBeenCalled();
  });
});

describe("unscheduleEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRemoveJobs.mockResolvedValue({ removed: 0, errors: [] });
  });

  describe("SES scheduled jobs (queue)", () => {
    test("removes jobs and marks email as draft when scheduledJobIds and emailId provided", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (prisma.email.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
      mockRemoveJobs.mockResolvedValue({ removed: 2, errors: [] });
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({
        emailId: "email-123",
        scheduledJobIds: ["job-1", "job-2"],
      });

      expect(result).toEqual({ success: true });
      expect(mockRemoveJobs).toHaveBeenCalledWith(["job-1", "job-2"]);
      expect(prisma.email.update).toHaveBeenCalledWith({
        where: { id: "email-123" },
        data: {
          published: false,
          scheduledJobIds: expect.anything(),
        },
      });
    });

    test("returns error when not all jobs could be removed", async () => {
      mockRemoveJobs.mockResolvedValue({
        removed: 1,
        errors: ["job-2: not found"],
      });
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({
        emailId: "email-123",
        scheduledJobIds: ["job-1", "job-2"],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Could not remove");
    });

    test("returns error when removeJobs throws", async () => {
      mockRemoveJobs.mockRejectedValue(new Error("Redis unavailable"));
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({
        emailId: "email-123",
        scheduledJobIds: ["job-1"],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Redis unavailable");
    });

    test("returns error when prisma.email.update throws", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (prisma.email.update as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("DB error"),
      );
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({
        emailId: "email-123",
        scheduledJobIds: ["job-1"],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("does not call removeJobs when scheduledJobIds is empty", async () => {
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({
        emailId: "email-123",
        scheduledJobIds: [],
      });

      expect(mockRemoveJobs).not.toHaveBeenCalled();
      expect(result.error).toBeDefined();
    });
  });

  describe("Resend scheduled emails", () => {
    test("cancels via Resend API when resendId provided and Resend enabled", async () => {
      const { isResendEnabled } = await import("@/lib/email-providers");
      vi.mocked(isResendEnabled).mockReturnValue(true);
      const { Resend } = await import("resend");
      const mockCancel = vi.fn().mockResolvedValue({ data: {}, error: null });
      vi.mocked(Resend).mockImplementation(function (this: unknown) {
        return { emails: { cancel: mockCancel } };
      });
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({ resendId: "re_123" });

      expect(result).toEqual({ success: true });
      expect(mockCancel).toHaveBeenCalledWith("re_123");
    });

    test("returns error when Resend cancel returns error", async () => {
      const { isResendEnabled } = await import("@/lib/email-providers");
      vi.mocked(isResendEnabled).mockReturnValue(true);
      const { Resend } = await import("resend");
      const mockCancel = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Scheduled send not found" },
      });
      vi.mocked(Resend).mockImplementation(function (this: unknown) {
        return { emails: { cancel: mockCancel } };
      });
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({ resendId: "re_123" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Scheduled send not found");
    });

    test("does not call Resend when isResendEnabled is false", async () => {
      const { isResendEnabled } = await import("@/lib/email-providers");
      vi.mocked(isResendEnabled).mockReturnValue(false);
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({ resendId: "re_123" });

      expect(result.error).toBeDefined();
    });
  });

  describe("fallbacks", () => {
    test("returns error when only sesMessageId provided (SES cannot cancel)", async () => {
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({
        sesMessageId: "ses-msg-123",
      });

      expect(result.error).toContain("SES does not support canceling");
    });

    test("returns error when no valid message ID or scheduled jobs provided", async () => {
      const { unscheduleEmail } = await import("@/lib/actions/send-email");

      const result = await unscheduleEmail({});

      expect(result.error).toContain("No valid message ID or scheduled jobs");
    });
  });
});
