import type { Email } from "@/prisma/generated/prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import EmailRow from "./email-row";

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
      <div className="flex flex-col items-center space-x-4">
        <Image
          alt="missing email"
          src="/empty-state.png"
          width={400}
          height={400}
        />
        <p className="text-lg text-stone-500">
          You do not have any emails yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-neutral-700 dark:bg-[#2D2D2D]">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-neutral-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Email Campaign
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Time
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-[#2D2D2D]">
          {emails.map((email: Email) => (
            <EmailRow key={email.id} data={email} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
