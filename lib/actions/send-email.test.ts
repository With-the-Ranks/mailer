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
vi.mock("@/lib/queue", () => ({
  queueBulkEmails: vi.fn(),
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

describe("unscheduleEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRemoveJobs.mockResolvedValue(undefined);
  });

  describe("SES scheduled jobs (queue)", () => {
    test("removes jobs and marks email as draft when scheduledJobIds and emailId provided", async () => {
      const { default: prisma } = await import("@/lib/prisma");
      (prisma.email.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
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
