"use server";

import { Resend } from 'resend';
import WelcomeTemplate from '@/lib/email-templates/welcome-template';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.EMAIL_DOMAIN;

export const sendEmail = async ({ to, from, subject }: { to: string, from: string, subject: string }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${from} <${domain}>`,
      to: [to],
      subject: subject,
      react: WelcomeTemplate({ email: to }) as React.ReactElement,
    });

    if (error) {
      return { error };
    }

    return { data };
  } catch (e) {
    return { error: 'Something went wrong' };
  }
};
