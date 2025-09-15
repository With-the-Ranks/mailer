import type { SignupForm } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import SignupFormRow from "./signup-form-row";

export default async function SignupForms({
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

  const signupForms: SignupForm[] = await prisma.signupForm.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      organization: true,
      audienceList: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    ...(limit ? { take: limit } : {}),
  });

  if (signupForms.length === 0) {
    return (
      <div className="flex flex-col items-center space-x-4">
        <Image
          alt="missing signup form"
          src="/empty-state.png"
          width={400}
          height={400}
        />
        <p className="text-lg text-stone-500">
          You do not have any signup forms yet. Create one to get started.
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
              Form Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Submissions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Created
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {signupForms.map((signupForm) => (
            <SignupFormRow key={signupForm.id} data={signupForm} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
