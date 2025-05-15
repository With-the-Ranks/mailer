"use server";

import { hash } from "bcrypt";
import { addHours } from "date-fns";
import React from "react";

import { sendEmail } from "@/lib/actions/send-email";
import VerifyEmail from "@/lib/email-templates/verify-email";
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

    const user = await prisma.user.create({
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

    const baseUrl = process.env.NEXTAUTH_URL || "http://app.localhost:3000";
    const verificationUrl = `${baseUrl}/api/verify-email?token=${token}`;

    const content = React.createElement(VerifyEmail, {
      verificationUrl,
    });

    await sendEmail({
      to: email,
      from: "Mailer",
      subject: "Verify your email address",
      react: content,
      previewText: "Please verify your email to finish signing up.",
    });

    return {
      message:
        "Registration successful, please check your inbox to verify your email.",
      user,
    };
  } catch (e: any) {
    return { error: "Error creating user.", details: e.message };
  }
};
