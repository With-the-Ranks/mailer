"use server";

import { Resend } from "resend";
import { Maily } from "@maily-to/render";
import WelcomeTemplate from "@/lib/email-templates/welcome-template";
import { parse } from "path";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.EMAIL_DOMAIN;

const parseContent = (content: string, previewText: string | null) => {
  const jsonContent = JSON.parse(content);
  const maily = new Maily(jsonContent);
  if (previewText) {
    maily.setPreviewText(previewText);
  }
  return maily.renderAsync();
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
  subject: string;
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
      const htmlContent = await parseContent(content, previewText);
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
