"use server";

import { hash } from "bcrypt";
import { addHours } from "date-fns";

import { sendEmail } from "@/lib/actions/send-email";
import prisma from "@/lib/prisma";

export const registerUser = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const hashedPassword = await hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "User already exists." };
    }

    const defaultName = email.split("@")[0];

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: defaultName,
      },
    });

    const token = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: addHours(new Date(), 2),
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://app.localhost:3000";
    const verificationUrl = `${baseUrl}/api/verify-email?token=${token}`;

    await sendEmail({
      to: email,
      from: "Mailer",
      subject: "Verify your email address",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "section",
            attrs: { align: "left" },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Click the link below to verify your email:",
                  },
                ],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: verificationUrl,
                    marks: [{ type: "link", attrs: { href: verificationUrl } }],
                  },
                ],
              },
            ],
          },
        ],
      }),
      previewText: "Verify your email to finish signing up.",
    });

    return {
      message:
        "Registration successful, please check your inbox to verify your email.",
    };
  } catch (e: any) {
    return { error: "Error creating user.", details: e.message };
  }
};
