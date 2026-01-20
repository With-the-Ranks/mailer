import type { Email } from "@/prisma/generated/prisma/client";
import { redirect } from "next/navigation";

import Logo from "@/components/logo";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { EmailTable } from "./email-table";

export default async function Emails({
  organizationId,
  limit,
}: {
  organizationId?: string;
  limit?: number;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const emails: Email[] = await prisma.email.findMany({
    where: organizationId
      ? { organizationId } // Show all emails in the organization
      : { userId: session!.user.id as string }, // Fallback to user emails if no org specified
    orderBy: {
      createdAt: "desc",
    },
    include: {
      organization: true,
    },
    ...(limit ? { take: limit } : {}),
  });

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-20">
        <div className="scale-150">
          <Logo showText={false} clickable={false} />
        </div>
        <p className="text-lg text-stone-500 dark:text-stone-400">
          You do not have any emails yet. Create one to get started.
        </p>
      </div>
    );
  }

  return <EmailTable emails={emails} hidePagination={!!limit} />;
}
