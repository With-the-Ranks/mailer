import { NextRequest } from 'next/server';
import WelcomeTemplate from '@/lib/email-templates/welcome-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.EMAIL_DOMAIN;

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { email, from, subject, content } = requestBody;  
    const { data, error } = await resend.emails.send({
      from: `${from} <${domain}>`,
      to: [email],
      subject: subject || "Hello Bernie & Friends!",
      react: WelcomeTemplate({}) as React.ReactElement,
    });

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  }
}