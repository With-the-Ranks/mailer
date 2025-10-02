"use server";

import { Maily } from "@maily-to/render";
import type { CreateEmailOptions } from "resend";
import { Resend } from "resend";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { buildAudienceWhere, getUnsubscribeUrl } from "../utils";

async function getEmailClientForOrg(orgId?: string) {
  let apiKey = process.env.RESEND_API_KEY!;
  let domain = process.env.EMAIL_DOMAIN!;

  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { activeDomain: true },
    });
    if (org) {
      if (org.emailApiKey) apiKey = org.emailApiKey;
      if (org.activeDomain?.domain)
        domain = `mailer@${org.activeDomain.domain}`;
    }
  }

  return { resend: new Resend(apiKey), domain };
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
    console.error("Error parsing content:", error);
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
  const { resend, domain } = await getEmailClientForOrg(organizationId);
  const fromHeader = `${from} <${domain}>`;
  const payload: CreateEmailOptions = {
    from: fromHeader,
    to: [to],
    subject: subject || "No Subject",
    text: previewText ?? "",
  };

  if (html) {
    payload.html = html;
  } else if (react) {
    payload.react = react;
  } else if (content) {
    const unsubUrl = getUnsubscribeUrl({
      email: to,
      listId: audienceListId || undefined,
      organizationId,
    });
    payload.html = await parseContent(
      content,
      {
        unsubscribe_url: unsubUrl,
      },
      previewText,
    );
  } else {
    throw new Error("sendEmail: need content, html, or react");
  }

  try {
    const { data, error } = await resend.emails.send(payload);

    if (error) {
      const msg = typeof error === "string" ? error : JSON.stringify(error);
      return { error: msg };
    }

    return { data };
  } catch (err) {
    console.error("sendEmail thrown error:", err);
    return { error: "Something went wrong" };
  }
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

  const { resend, domain } = await getEmailClientForOrg(organizationId);
  const fromHeader = `${from} <${domain}>`;

  let recipients: any[] = [];
  if (segmentId) {
    const segment = await prisma.segment.findUnique({
      where: { id: segmentId },
    });
    if (!segment) return { error: "Segment not found" };
    const filterCriteria =
      segment.filterCriteria &&
      typeof segment.filterCriteria === "object" &&
      !Array.isArray(segment.filterCriteria)
        ? (segment.filterCriteria as Record<string, any>)
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
    return { error: "Must provide either segmentId or audienceListId" };
  }

  if (recipients.length === 0) return { error: "No recipients found" };

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

      const emailData = {
        from: fromHeader,
        to: [audience.email],
        subject: subject || "No Subject",
        html: htmlContent || "",
        text: "",
        scheduledAt: scheduledTime,
        tags: [
          { name: "intrepidId", value: id },
          { name: "userId", value: session.user.id },
        ],
        react: "",
      };
      const { data, error } = await resend.emails.send(emailData);

      let eventType = "sent";
      let errorMessage = null;
      let resendId = data?.id ?? null;

      if (error) {
        eventType = "failed";
        errorMessage =
          typeof error === "string" ? error : JSON.stringify(error);
        resendId = null; // Failed, so no resendId
        console.error(
          `Failed to send email to ${audience.email}: ${errorMessage}`,
        );
      } else {
        // Still update email with resendId if you want (optional)
        await prisma.email.update({
          where: { id },
          data: { resendId },
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
      } catch (err: any) {
        if (err.code !== "P2002")
          console.error("Error logging email event:", err);
      }
    }
    return { success: true };
  } catch (e) {
    console.error("Error sending bulk email:", e);
    return { error: "Something went wrong" };
  }
};

export const unscheduleEmail = async ({ resendId }: { resendId: string }) => {
  const { resend } = await getEmailClientForOrg();
  await resend.emails.cancel(resendId);
};
