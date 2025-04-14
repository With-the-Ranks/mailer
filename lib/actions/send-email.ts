"use server";

import { Maily } from "@maily-to/render";
import { Resend } from "resend";

import { getSession } from "@/lib/auth";
import WelcomeTemplate from "@/lib/email-templates/welcome-template";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.EMAIL_DOMAIN;

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
    return await maily.renderAsync();
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Failed to parse email content");
  }
};

export const sendEmail = async ({
  to,
  from,
  subject,
  content,
  previewText,
}: {
  to: string;
  from: string;
  subject: string | null;
  content: string | null;
  previewText: string | null;
}) => {
  try {
    let resendEmail: any = {
      from: `${from} <${domain}>`,
      to: [to],
      subject: subject,
    };
    if (content) {
      const htmlContent = await parseContent(content, {}, previewText);
      resendEmail.html = htmlContent;
    } else {
      resendEmail.react = WelcomeTemplate({ email: to }) as React.ReactElement;
    }

    const { data, error } = await resend.emails.send({
      ...resendEmail,
    });

    if (error) {
      return { error };
    }

    return { data };
  } catch (e) {
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
