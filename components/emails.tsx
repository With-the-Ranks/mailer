import type { Email } from "@prisma/client";
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
    where: {
      userId: session!.user.id as string,
      ...(organizationId ? { organizationId } : {}),
    },
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email Campaign
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Time
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {emails.map((email: Email) => (
            <EmailRow key={email.id} data={email} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
