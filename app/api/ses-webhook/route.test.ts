import { beforeEach, describe, expect, test, vi } from "vitest";

const mockPrisma = {
  email: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  emailEvent: {
    create: vi.fn(),
  },
  emailSuppression: {
    upsert: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));
vi.mock("@/lib/utils", () => ({ logError: vi.fn() }));

describe("POST /api/ses-webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.email.findFirst.mockResolvedValue(null);
    mockPrisma.email.findUnique.mockResolvedValue(null);
    mockPrisma.emailSuppression.upsert.mockResolvedValue({});
  });

  test("adds permanent bounce recipients to suppression even when the email record is not found", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/ses-webhook", {
      method: "POST",
      body: JSON.stringify({
        Type: "Notification",
        MessageId: "sns-1",
        TopicArn: "arn:aws:sns:us-east-1:123:mailer",
        Timestamp: "2026-03-24T10:00:00.000Z",
        Message: JSON.stringify({
          eventType: "Bounce",
          mail: {
            messageId: "ses-message-1",
            timestamp: "2026-03-24T10:00:00.000Z",
            source: "mailer@example.com",
            destination: ["bounced@example.com"],
          },
          bounce: {
            bounceType: "Permanent",
            bounceSubType: "General",
            timestamp: "2026-03-24T10:00:00.000Z",
            bouncedRecipients: [{ emailAddress: "Bounced@Example.com" }],
          },
        }),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.emailSuppression.upsert).toHaveBeenCalledWith({
      where: { email: "bounced@example.com" },
      update: {
        reason: "HARD_BOUNCE",
        sourceEmail: undefined,
      },
      create: {
        email: "bounced@example.com",
        reason: "HARD_BOUNCE",
        sourceEmail: undefined,
      },
    });
  });

  test("adds complaint recipients to suppression even when the email record is not found", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/ses-webhook", {
      method: "POST",
      body: JSON.stringify({
        Type: "Notification",
        MessageId: "sns-complaint-1",
        TopicArn: "arn:aws:sns:us-east-1:123:mailer",
        Timestamp: "2026-03-24T11:00:00.000Z",
        Message: JSON.stringify({
          eventType: "Complaint",
          mail: {
            messageId: "ses-message-complaint-1",
            timestamp: "2026-03-24T11:00:00.000Z",
            source: "mailer@example.com",
            destination: ["complained@example.com"],
          },
          complaint: {
            complaintFeedbackType: "abuse",
            timestamp: "2026-03-24T11:00:00.000Z",
            complainedRecipients: [{ emailAddress: "Complained@Example.com" }],
          },
        }),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.emailSuppression.upsert).toHaveBeenCalledWith({
      where: { email: "complained@example.com" },
      update: {
        reason: "COMPLAINT",
        sourceEmail: undefined,
      },
      create: {
        email: "complained@example.com",
        reason: "COMPLAINT",
        sourceEmail: undefined,
      },
    });
  });

  test("does not add non-permanent bounce recipients to suppression", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/ses-webhook", {
      method: "POST",
      body: JSON.stringify({
        Type: "Notification",
        MessageId: "sns-2",
        TopicArn: "arn:aws:sns:us-east-1:123:mailer",
        Timestamp: "2026-03-24T12:00:00.000Z",
        Message: JSON.stringify({
          eventType: "Bounce",
          mail: {
            messageId: "ses-message-2",
            timestamp: "2026-03-24T12:00:00.000Z",
            source: "mailer@example.com",
            destination: ["soft-bounced@example.com"],
          },
          bounce: {
            bounceType: "Transient",
            bounceSubType: "General",
            timestamp: "2026-03-24T12:00:00.000Z",
            bouncedRecipients: [{ emailAddress: "soft-bounced@example.com" }],
          },
        }),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.emailSuppression.upsert).not.toHaveBeenCalled();
  });
});
