"use server";

import { Maily } from "@maily-to/render";
import { render } from "@react-email/render";
import type { CreateEmailOptions } from "resend";
import { Resend } from "resend";

import {
  createEmailProvider,
  getDefaultProvider,
  isResendEnabled,
  type EmailProvider,
  type EmailProviderClient,
} from "@/lib/email-providers";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { buildAudienceWhere, getUnsubscribeUrl, logError } from "../utils";

interface OrgEmailClient {
  client: EmailProviderClient;
  domain: string;
  provider: EmailProvider;
  configurationSetName?: string;
  isVerified: boolean;
  error?: string;
}

async function getEmailClientForOrg(orgId?: string): Promise<OrgEmailClient> {
  let domain = process.env.EMAIL_DOMAIN || "localhost";
  let provider: EmailProvider = getDefaultProvider();
  let apiKey: string | undefined;
  let awsRegion: string | undefined;
  let clickTracking = false;
  let openTracking = false;
  let isVerified = false;
  let error: string | undefined;

  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { activeDomain: true },
    });

    if (org) {
      // Use org's custom API key for Resend if available
      if (org.emailApiKey) {
        apiKey = org.emailApiKey;
      }

      if (org.activeDomain) {
        // Check if domain is verified
        const domainStatus = org.activeDomain.status?.toLowerCase();
        if (domainStatus !== "success" && domainStatus !== "verified") {
          error = `Domain ${org.activeDomain.domain} is not verified. Please complete domain verification before sending emails.`;
        } else {
          isVerified = true;
        }

        // From address always uses the org's active sending domain (domain management)
        domain = `mailer@${org.activeDomain.domain}`;
        // Use the domain's provider setting (defaults to "ses")
        provider = (org.activeDomain.provider as EmailProvider) || "ses";
        awsRegion = org.activeDomain.awsRegion || undefined;
        clickTracking = org.activeDomain.clickTracking;
        openTracking = org.activeDomain.openTracking;
      } else {
        // No active domain configured - do not send; require domain management setup
        error =
          "No sending domain configured. Add and verify a domain in Settings → Domains, then set it as Active.";
      }
    } else if (orgId) {
      // Organization not found
      error = "Organization not found.";
    }
  } else {
    // No organization ID - use default domain (for system emails)
    isVerified = true; // System emails use default verified domain
  }

  // Validate that Resend is enabled if trying to use it
  if (provider === "resend" && !isResendEnabled()) {
    // Fall back to SES if Resend is not enabled
    provider = "ses";
  }

  // Omit configuration set so sends work without creating a set in AWS.
  // Set AWS_SES_CONFIG_SET only if you have created that configuration set in SES (e.g. via initializeSesRegion).
  const configurationSetName = undefined;

  const client = createEmailProvider({
    provider,
    apiKey,
    awsRegion,
    configurationSetName,
  });

  return { client, domain, provider, configurationSetName, isVerified, error };
}

/**
 * Check if an email is in the suppression list (for SES compliance)
 */
async function isEmailSuppressed(email: string): Promise<boolean> {
  const suppressed = await prisma.emailSuppression.findUnique({
    where: { email },
  });
  return !!suppressed;
}

/**
 * Filter out suppressed emails from a list of recipients
 */
async function filterSuppressedRecipients(emails: string[]): Promise<string[]> {
  const suppressedRecords = await prisma.emailSuppression.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const suppressedSet = new Set(suppressedRecords.map((s) => s.email));
  return emails.filter((e) => !suppressedSet.has(e));
}

const parseContent = async (
  content: string,
  variables: Record<string, string>,
  previewText: string | null,
) => {
  try {
    const jsonContent = JSON.parse(content);
    const maily = new Maily(jsonContent);
    maily.setVariableValues(variables);
    if (previewText) {
      maily.setPreviewText(previewText);
    }
    let html = await maily.render();

    // Replace variable placeholders in href attributes (Maily doesn't do this automatically)
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      html = html.replaceAll(placeholder, value);
    }

    return html;
  } catch (error) {
    logError("Error parsing content", error);
    throw new Error("Failed to parse email content");
  }
};

export type SendEmailOpts = {
  to: string;
  from: string;
  subject: string | null;
  content?: string | null;
  previewText: string | null;
  html?: string;
  react?: React.ReactElement;
  organizationId?: string;
  audienceListId?: string | null;
};

export const sendEmail = async ({
  to,
  from,
  subject,
  content,
  previewText,
  html,
  react,
  organizationId,
  audienceListId,
}: SendEmailOpts) => {
  const {
    client,
    domain,
    provider,
    isVerified,
    error: domainError,
  } = await getEmailClientForOrg(organizationId);

  // Check if domain is verified (required for organization emails)
  if (organizationId && !isVerified) {
    return { error: domainError || "Domain not verified" };
  }

  // From address must always be the verified domain from domain management (never a user-entered email).
  // If "from" looks like an email (e.g. user typed it in the From Name field), use only the local part as display name.
  const displayName = from.includes("@")
    ? from.split("@")[0]?.trim() || "Mailer"
    : from.trim() || "Mailer";
  const fromHeader = `${displayName} <${domain}>`;

  // For SES, check suppression list
  if (provider === "ses") {
    const suppressed = await isEmailSuppressed(to);
    if (suppressed) {
      return { error: `Email ${to} is on the suppression list` };
    }
  }

  let htmlContent: string | undefined;

  if (html) {
    htmlContent = html;
  } else if (react) {
    // Render React email component to HTML
    // For Resend, we can either use their built-in React support or render ourselves
    // For SES, we must render to HTML first
    if (provider === "resend" && isResendEnabled()) {
      // Use Resend directly for React components (they handle rendering)
      const resend = new Resend(process.env.RESEND_API_KEY);
      const payload: CreateEmailOptions = {
        from: fromHeader,
        to: [to],
        subject: subject || "No Subject",
        text: previewText ?? "",
        react,
      };

      try {
        const { data, error } = await resend.emails.send(payload);
        if (error) {
          const msg = typeof error === "string" ? error : JSON.stringify(error);
          return { error: msg };
        }
        return { data };
      } catch (err) {
        logError("sendEmail thrown error", err);
        return { error: "Something went wrong" };
      }
    } else {
      // For SES (or any other provider), render React to HTML using @react-email/render
      try {
        htmlContent = await render(react);
      } catch (err) {
        logError("Failed to render React email", err);
        return { error: "Failed to render email template" };
      }
    }
  } else if (content) {
    const unsubUrl = getUnsubscribeUrl({
      email: to,
      listId: audienceListId || undefined,
      organizationId,
    });
    htmlContent = await parseContent(
      content,
      {
        unsubscribe_url: unsubUrl,
      },
      previewText,
    );
  } else {
    throw new Error("sendEmail: need content, html, or react");
  }

  const result = await client.sendEmail({
    from: fromHeader,
    to,
    subject: subject || "No Subject",
    html: htmlContent,
    text: previewText ?? "",
  });

  if (result.error) {
    let message = result.error;
    // In SES sandbox, the recipient (To) must also be verified; clarify for the user
    if (
      provider === "ses" &&
      /not verified|identities failed/i.test(result.error) &&
      result.error.includes(to)
    ) {
      message = `${result.error} In SES sandbox mode, the recipient address must be verified in the AWS SES console (Verified identities), or request production access.`;
    }
    return { error: message };
  }

  return { data: { id: result.messageId } };
};

export const sendBulkEmail = async ({
  audienceListId,
  from,
  subject,
  content,
  previewText,
  scheduledTime,
  id,
  organizationId,
  segmentId,
}: {
  audienceListId?: string | null;
  from: string;
  subject: string | null;
  content: string | null;
  previewText: string | null;
  scheduledTime: string | undefined;
  id: string;
  organizationId: string;
  segmentId?: string | null;
}) => {
  const session = await getSession();
  if (!session?.user.id) return { error: "Not authenticated" };

  const {
    client,
    domain,
    provider,
    isVerified,
    error: domainError,
  } = await getEmailClientForOrg(organizationId);

  // Check if domain is verified (required for bulk emails)
  if (!isVerified) {
    return {
      error:
        domainError ||
        "Domain not verified. Please verify your sending domain before sending emails.",
    };
  }

  const displayName = from.includes("@")
    ? from.split("@")[0]?.trim() || "Mailer"
    : from.trim() || "Mailer";
  const fromHeader = `${displayName} <${domain}>`;

  let recipients: {
    email: string;
    firstName: string;
    lastName: string;
    customFields: unknown;
    audienceListId: string;
  }[] = [];

  if (segmentId) {
    const segment = await prisma.segment.findUnique({
      where: { id: segmentId },
    });
    if (!segment) return { error: "Segment not found" };
    const filterCriteria =
      segment.filterCriteria &&
      typeof segment.filterCriteria === "object" &&
      !Array.isArray(segment.filterCriteria)
        ? (segment.filterCriteria as Record<string, unknown>)
        : {};
    const whereClause = buildAudienceWhere(
      segment.audienceListId,
      filterCriteria,
    );
    // Add filter to exclude unsubscribed contacts
    recipients = await prisma.audience.findMany({
      where: {
        ...whereClause,
        isUnsubscribed: false,
      },
    });
  } else if (audienceListId) {
    const audienceList = await prisma.audienceList.findUnique({
      where: { id: audienceListId },
      include: {
        audiences: {
          where: {
            isUnsubscribed: false,
          },
        },
      },
    });
    if (!audienceList) return { error: "Audience list not found" };
    recipients = audienceList.audiences;
  } else {
    // No segment and no audienceListId: use org's first audience list (all contacts)
    const firstList = await prisma.audienceList.findFirst({
      where: { organizationId },
      include: {
        audiences: {
          where: { isUnsubscribed: false },
        },
      },
    });
    if (!firstList)
      return {
        error:
          "No audience list found for this organization. Create an audience list first.",
      };
    recipients = firstList.audiences;
  }

  if (recipients.length === 0) return { error: "No recipients found" };

  // For SES, filter out suppressed recipients
  if (provider === "ses") {
    const recipientEmails = recipients.map((r) => r.email);
    const validEmails = await filterSuppressedRecipients(recipientEmails);
    const validEmailSet = new Set(validEmails);
    recipients = recipients.filter((r) => validEmailSet.has(r.email));

    if (recipients.length === 0) {
      return { error: "All recipients are on the suppression list" };
    }
  }

  try {
    for (const audience of recipients) {
      const customVars =
        typeof audience.customFields === "string"
          ? JSON.parse(audience.customFields)
          : audience.customFields || {};
      const vars = {
        email: audience.email,
        first_name: audience.firstName,
        last_name: audience.lastName,
        ...customVars,
        unsubscribe_url: getUnsubscribeUrl({
          email: audience.email,
          listId: audience.audienceListId,
          organizationId,
        }),
      };
      const htmlContent = content
        ? await parseContent(content, vars, previewText)
        : "";

      const result = await client.sendEmail({
        from: fromHeader,
        to: audience.email,
        subject: subject || "No Subject",
        html: htmlContent || "",
        text: previewText ?? "",
        tags: [
          { name: "intrepidId", value: id },
          { name: "userId", value: session.user.id },
        ],
        headers: {
          "X-Mailer-Email-ID": id,
          "X-Intrepid-ID": id,
        },
        scheduledAt: scheduledTime || undefined,
      });

      let eventType = "sent";
      let messageId = result.messageId;

      if (result.error) {
        eventType = "failed";
        messageId = null;
        logError("Failed to send email", null, {
          to: audience.email,
          error: result.error,
        });
      } else if (messageId) {
        // Update email with provider-specific message ID
        const updateData: {
          resendId?: string;
          sesMessageId?: string;
          providerUsed: string;
        } = {
          providerUsed: provider,
        };

        if (provider === "resend") {
          updateData.resendId = messageId;
        } else {
          updateData.sesMessageId = messageId;
        }

        await prisma.email.update({
          where: { id },
          data: updateData,
        });
      }

      try {
        await prisma.emailEvent.create({
          data: {
            emailId: id,
            userId: session.user.id,
            emailTo: audience.email,
            eventType,
            timestamp: new Date(),
          },
        });
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          err.code !== "P2002"
        ) {
          logError("Error logging email event", err);
        }
      }
    }

    // Mark email as published and set scheduledTime
    await prisma.email.update({
      where: { id },
      data: {
        published: true,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(),
        providerUsed: provider,
      },
    });

    return { success: true };
  } catch (e) {
    logError("Error sending bulk email", e);
    return { error: "Something went wrong" };
  }
};

export const unscheduleEmail = async ({
  resendId,
  sesMessageId,
}: {
  resendId?: string;
  sesMessageId?: string;
}) => {
  // Currently only Resend supports unscheduling
  if (resendId && isResendEnabled()) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.cancel(resendId);

      const error = (result as { error?: unknown })?.error;
      if (error) {
        const errorMsg =
          typeof error === "string"
            ? error
            : (error as { message?: string })?.message || JSON.stringify(error);
        logError("Failed to cancel Resend email", null, {
          resendId,
          error: errorMsg,
        });
        return { success: false, error: errorMsg };
      }

      return { success: true };
    } catch (err) {
      logError("Error canceling scheduled email", err, { resendId });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to cancel email",
      };
    }
  }

  if (sesMessageId) {
    // SES doesn't support canceling scheduled emails
    return { error: "SES does not support canceling scheduled emails" };
  }

  return { error: "No valid message ID provided" };
};
