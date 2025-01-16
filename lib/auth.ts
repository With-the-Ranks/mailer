import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

import prisma from "@/lib/prisma";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

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

          // Here bcrypt compares the provided password with the hashed password in the database
          const passwordIsValid = await bcrypt.compare(
            password,
            user.password || "",
          );

          if (!passwordIsValid) {
            throw new Error("Password is incorrect");
          }

          return user; // Successful authentication, return user object
        } catch (error) {
          console.error("Login error:", error);
          return null;
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
        domain: VERCEL_DEPLOYMENT
          ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          : undefined,
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
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
      };
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions) as Promise<{
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      image: string;
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
