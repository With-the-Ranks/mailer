"use server";

import { hash } from "bcryptjs";
import { addHours } from "date-fns";
import React from "react";

import { createOrganization } from "@/lib/actions";
import { createAudienceList } from "@/lib/actions/audience-list";
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

    // --- Create default org & audience list using actions ---
    try {
      // 1. Create organization
      const orgFormData = new FormData();
      orgFormData.set("name", `${defaultName}'s Organization`);
      orgFormData.set("description", "");
      orgFormData.set("subdomain", defaultName.replace(/[\W_]+/g, "-"));

      const orgResult = await createOrganization(orgFormData, user.id);

      // 2. Create default audience list if org was created

      if (orgResult && !("error" in orgResult) && orgResult.id) {
        const audienceFormData = new FormData();
        audienceFormData.set("name", "Master List");
        audienceFormData.set("description", "");
        await createAudienceList(audienceFormData, user.id, orgResult.id);
      }
    } catch (orgErr) {
      // Log the error for debugging/alerting
      console.error("Failed to create default org/audience:", orgErr);
    }
    // -------------------------------------------------------

    const token = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: addHours(new Date(), 2),
      },
    });

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://app.localhost:3000";
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
