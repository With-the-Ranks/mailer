import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

// SES event types mapped to our email event types
const EVENT_TYPE_MAP: Record<string, string> = {
  Send: "sent",
  Delivery: "delivered",
  Bounce: "bounced",
  Complaint: "complained",
  Reject: "rejected",
  Open: "opened",
  Click: "clicked",
  DeliveryDelay: "delayed",
  "Rendering Failure": "failed",
};

interface SesMailHeader {
  name: string;
  value: string;
}

interface SesMail {
  messageId: string;
  timestamp: string;
  source: string;
  destination: string[];
  headers?: SesMailHeader[];
  commonHeaders?: {
    from?: string[];
    to?: string[];
    subject?: string;
  };
}

interface SesBounceRecipient {
  emailAddress: string;
  action?: string;
  status?: string;
  diagnosticCode?: string;
}

interface SesComplaintRecipient {
  emailAddress: string;
}

interface SesEvent {
  eventType: string;
  mail: SesMail;
  bounce?: {
    bounceType: string;
    bounceSubType: string;
    bouncedRecipients: SesBounceRecipient[];
    timestamp: string;
  };
  complaint?: {
    complainedRecipients: SesComplaintRecipient[];
    timestamp: string;
    complaintFeedbackType?: string;
  };
  delivery?: {
    timestamp: string;
    recipients: string[];
  };
  open?: {
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
  };
  click?: {
    timestamp: string;
    link: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

interface SnsMessage {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
  SubscribeURL?: string;
  SignatureVersion?: string;
  Signature?: string;
  SigningCertURL?: string;
}

const SNS_CONFIRM_TIMEOUT_MS = 5000;

// Validate SigningCertURL is from AWS SNS
function isValidSnsSigningCertUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === "https:" &&
      /^sns\.[a-z0-9-]+\.amazonaws\.com$/.test(parsedUrl.hostname)
    );
  } catch {
    return false;
  }
}

// Basic SNS message signature validation
function validateSnsMessage(message: SnsMessage): boolean {
  if (message.SignatureVersion !== "1") {
    logError("Invalid SNS signature version", null, {
      version: message.SignatureVersion,
    });
    return false;
  }

  // Validate signing cert URL is from AWS
  if (
    !message.SigningCertURL ||
    !isValidSnsSigningCertUrl(message.SigningCertURL)
  ) {
    logError("Invalid SNS signing cert URL", null, {
      url: message.SigningCertURL,
    });
    return false;
  }

  return true;
}

/**
 * Add emails to suppression list (for hard bounces and complaints)
 */
async function addToSuppressionList(
  emails: string[],
  reason: string,
  sourceEmailId?: string,
) {
  for (const email of emails) {
    try {
      await prisma.emailSuppression.upsert({
        where: { email },
        update: {
          reason,
          sourceEmail: sourceEmailId,
        },
        create: {
          email,
          reason,
          sourceEmail: sourceEmailId,
        },
      });
    } catch (error) {
      logError("Failed to add email to suppression list", error, { email });
    }
  }
}

/**
 * Process SES event and update database
 */
async function processSesEvent(event: SesEvent) {
  const sesMessageId = event.mail.messageId;
  const eventType = EVENT_TYPE_MAP[event.eventType] || "unknown";

  // Try to find email by SES message ID first
  let email = await prisma.email.findFirst({
    where: { sesMessageId },
  });

  // Fallback: find by custom header (handles race conditions)
  if (!email && event.mail.headers) {
    const emailIdHeader = event.mail.headers.find(
      (h) => h.name === "X-Mailer-Email-ID",
    );
    if (emailIdHeader) {
      email = await prisma.email.findUnique({
        where: { id: emailIdHeader.value },
      });
    }
  }

  // If still not found, try finding by intrepidId tag (backward compatibility)
  if (!email && event.mail.headers) {
    const intrepidHeader = event.mail.headers.find(
      (h) => h.name === "X-Intrepid-ID",
    );
    if (intrepidHeader) {
      email = await prisma.email.findUnique({
        where: { id: intrepidHeader.value },
      });
    }
  }

  if (!email) {
    // Log but don't fail - email might have been deleted
    logError("SES webhook: email not found", null, {
      sesMessageId,
      eventType: event.eventType,
    });
    return;
  }

  // Update email with SES message ID if not already set
  if (!email.sesMessageId) {
    await prisma.email.update({
      where: { id: email.id },
      data: { sesMessageId },
    });
  }

  // Determine the recipient email for this event
  let emailTo: string | undefined;
  if (event.bounce?.bouncedRecipients?.[0]) {
    emailTo = event.bounce.bouncedRecipients[0].emailAddress;
  } else if (event.complaint?.complainedRecipients?.[0]) {
    emailTo = event.complaint.complainedRecipients[0].emailAddress;
  } else if (event.delivery?.recipients?.[0]) {
    emailTo = event.delivery.recipients[0];
  } else if (event.mail.destination?.[0]) {
    emailTo = event.mail.destination[0];
  }

  // Determine the actual event timestamp from the SES payload
  // Use the specific event timestamp or fall back to mail timestamp, then server time
  const eventTimestamp =
    event.bounce?.timestamp ||
    event.complaint?.timestamp ||
    event.delivery?.timestamp ||
    event.open?.timestamp ||
    event.click?.timestamp ||
    event.mail.timestamp;

  const timestamp = eventTimestamp ? new Date(eventTimestamp) : new Date();

  // Store email event
  try {
    await prisma.emailEvent.create({
      data: {
        emailId: email.id,
        eventType,
        emailTo,
        link: event.click?.link,
        timestamp,
      },
    });
  } catch (error: unknown) {
    // Ignore duplicate events (unique constraint violation)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code !== "P2002"
    ) {
      logError("Error creating email event", error);
    }
  }

  // Handle hard bounces - add to suppression list
  if (
    event.eventType === "Bounce" &&
    event.bounce?.bounceType === "Permanent"
  ) {
    const bouncedEmails = event.bounce.bouncedRecipients.map(
      (r) => r.emailAddress,
    );
    await addToSuppressionList(bouncedEmails, "HARD_BOUNCE", email.id);
  }

  // Handle complaints - add to suppression list
  if (event.eventType === "Complaint" && event.complaint) {
    const complainedEmails = event.complaint.complainedRecipients.map(
      (r) => r.emailAddress,
    );
    await addToSuppressionList(complainedEmails, "COMPLAINT", email.id);
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as SnsMessage;

    if (data.Type === "SubscriptionConfirmation") {
      if (!validateSnsMessage(data)) {
        logError(
          "SNS subscription confirmation failed signature validation",
          null,
          {
            messageId: data.MessageId,
          },
        );
        return NextResponse.json(
          { error: "Invalid SNS message signature" },
          { status: 403 },
        );
      }

      if (data.SubscribeURL) {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          SNS_CONFIRM_TIMEOUT_MS,
        );

        try {
          const response = await fetch(data.SubscribeURL, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            logError("SNS subscription confirmation failed", null, {
              status: response.status,
              statusText: response.statusText,
            });
            return NextResponse.json(
              { error: "Failed to confirm subscription" },
              { status: 500 },
            );
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          const errorMessage =
            fetchError instanceof Error && fetchError.name === "AbortError"
              ? "Subscription confirmation timed out"
              : "Failed to confirm subscription";
          logError(errorMessage, fetchError, { messageId: data.MessageId });
          return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
      }
      return NextResponse.json({
        success: true,
        message: "Subscription confirmed",
      });
    }

    // Handle SNS notification
    if (data.Type === "Notification") {
      try {
        const sesEvent = JSON.parse(data.Message) as SesEvent;
        await processSesEvent(sesEvent);
      } catch (parseError) {
        logError("Failed to parse SES event", parseError, {
          messageId: data.MessageId,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("SES webhook error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Support GET for health checks
export async function GET() {
  return NextResponse.json({ status: "ok", handler: "ses-webhook" });
}
