import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { addHours } from "date-fns";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import React from "react";

import { sendEmail } from "@/lib/actions/send-email";
import prisma from "@/lib/prisma";

import ResetPasswordEmail from "./email-templates/reset-email";
import VerifyEmail from "./email-templates/verify-email";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

// Function to detect if we're on a Vercel preview deployment
function isVercelPreviewDeployment(host?: string) {
  if (process.env.VERCEL_ENV === "preview") return true;
  if (host && host.endsWith(".vercel.app")) return true;
  return false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          gh_username: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const { email, password } = credentials;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error("No user found with the entered email");
          }

          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in.");
          }

          const passwordIsValid = await bcrypt.compare(
            password,
            user.password || "",
          );

          if (!passwordIsValid) {
            throw new Error("Password is incorrect");
          }

          return user;
        } catch (error: any) {
          console.error("Login error:", error);
          throw new Error(error.message || "Login failed");
        }
      },
    }),
  ],
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: "/login", // Error code passed in query string as ?error=
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain:
          VERCEL_DEPLOYMENT &&
          !isVercelPreviewDeployment() &&
          process.env.NEXT_PUBLIC_ROOT_DOMAIN
            ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            : undefined,
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        // @ts-expect-error
        id: token.sub,
        // @ts-expect-error
        username: token?.user?.username || token?.user?.gh_username,
        // @ts-expect-error
        organizationId: token?.user?.organizationId,
      };
      return session;
    },
    redirect: async ({ baseUrl }) => {
      return `${baseUrl}/`;
    },
  },
};

export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.emailVerified) {
    return { error: "User not found or already verified." };
  }

  const token = crypto.randomUUID();

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

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

  return { success: true };
};

export const sendPasswordResetEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomUUID();
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: addHours(new Date(), 2),
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://app.localhost:3000";
  const resetUrl = `${baseUrl}/forgot-password?token=${token}`;

  const content = React.createElement(ResetPasswordEmail, { resetUrl });

  await sendEmail({
    to: email,
    from: "Mailer",
    subject: "Reset your password",
    react: content,
    previewText: "Click here to reset your password (expires in 2 hrs)",
  });

  return { success: true };
};

export function getSession() {
  return getServerSession(authOptions) as Promise<{
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      image: string;
      organizationId: string;
    };
  } | null>;
}

export function withOrgAuth(action: any) {
  return async (
    formData: FormData | null,
    organizationId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session) {
      return {
        error: "Not authenticated",
      };
    }
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
        users: {
          some: {
            id: {
              in: [session.user.id as string],
            },
          },
        },
      },
    });
    if (!organization) {
      return {
        error: "Not authorized",
      };
    }

    return action(formData, organization, key);
  };
}

export function withEmailAuth(action: any) {
  return async (
    formData: FormData | null,
    emailId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }
    const email = await prisma.email.findUnique({
      where: {
        id: emailId,
      },
      include: {
        organization: true,
      },
    });
    if (!email || email.userId !== session.user.id) {
      return {
        error: "Email not found",
      };
    }

    return action(formData, email, key);
  };
}
