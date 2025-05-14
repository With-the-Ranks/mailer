"use server";

import { Maily } from "@maily-to/render";
import type { CreateEmailOptions } from "resend";
import { Resend } from "resend";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const domain = process.env.EMAIL_DOMAIN;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : {
      emails: {
        send: async () => ({ data: null, error: null }),
        cancel: async () => ({}),
      },
    };

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
};

export const sendEmail = async ({
  to,
  from,
  subject,
  content,
  previewText,
  html,
  react,
}: SendEmailOpts) => {
  try {
    const payload: CreateEmailOptions = {
      from: `${from} <${domain}>`,
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

    const { data, error } = await resend.emails.send(payload);
    if (error) {
      const msg = typeof error === "string" ? error : JSON.stringify(error);
      return { error: msg };
    }

    if (!data) {
      throw new Error("Something went wrong");
    }

    return { data };
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "Something went wrong";
    return { error: errorMessage };
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
}: {
  audienceListId: string;
  from: string;
  subject: string | null;
  content: string | null;
  previewText: string | null;
  scheduledTime: string | undefined;
  id: string;
}) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  const audienceList = await prisma.audienceList.findUnique({
    where: { id: audienceListId },
    include: { audiences: true },
  });

  if (!audienceList) {
    return { error: "Audience list not found" };
  }

  try {
    for (const audience of audienceList.audiences) {
      const htmlContent = content
        ? await parseContent(
            content,
            {
              email: audience.email,
              first_name: audience.firstName,
              last_name: audience.lastName,
            },
            previewText,
          )
        : null;

      const emailData = {
        from: `${from} <${domain}>`,
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
        await prisma.email.update({
          where: {
            id: id,
          },
          data: {
            resendId,
          },
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
  await resend.emails.cancel(resendId);
};
