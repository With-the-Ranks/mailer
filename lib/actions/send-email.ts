"use server";

import { Maily } from "@maily-to/render";
import type { CreateEmailOptions } from "resend";
import { Resend } from "resend";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    return await maily.render();
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
    payload.html = await parseContent(content, {}, previewText);
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
}: {
  audienceListId: string;
  from: string;
  subject: string | null;
  content: string | null;
  previewText: string | null;
  scheduledTime: string | undefined;
  id: string;
  organizationId: string;
}) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  const { resend, domain } = await getEmailClientForOrg(organizationId);
  const fromHeader = `${from} <${domain}>`;

  const audienceList = await prisma.audienceList.findUnique({
    where: { id: audienceListId },
    include: { audiences: true },
  });

  if (!audienceList) {
    return { error: "Audience list not found" };
  }

  try {
    for (const audience of audienceList.audiences) {
      const customVars =
        typeof audience.customFields === "string"
          ? JSON.parse(audience.customFields)
          : audience.customFields || {};
      const vars = {
        email: audience.email,
        first_name: audience.firstName,
        last_name: audience.lastName,
        ...customVars,
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
          {
            name: "intrepidId",
            value: id,
          },
          {
            name: "userId",
            value: session.user.id,
          },
        ],
        react: "",
      };

      const { data, error } = await resend.emails.send(emailData);

      if (error) {
        console.error(
          `Failed to send email to ${audience.email}: ${JSON.stringify(error)}`,
        );
      } else {
        const resendId = data?.id;

        try {
          await prisma.emailEvent.create({
            data: {
              emailId: id,
              userId: session.user.id,
              emailTo: audience.email,
              eventType: "sent",
              timestamp: new Date(),
            },
          });
        } catch (err: any) {
          if (err.code !== "P2002")
            console.error("Error logging sent event:", err);
        }
        await prisma.email.update({
          where: { id },
          data: { resendId },
        });
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
