import type { Prisma } from "@/prisma/generated/prisma/client";
import { redirect } from "next/navigation";

import Logo from "@/components/logo";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import SignupFormRow from "./signup-form-row";

type SignupFormWithRelations = Prisma.SignupFormGetPayload<{
  include: {
    organization: true;
    audienceList: true;
    _count: {
      select: {
        submissions: true;
      };
    };
  };
}>;

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

  const signupForms: SignupFormWithRelations[] =
    await prisma.signupForm.findMany({
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
      <div className="flex flex-col items-center justify-center space-y-6 py-20">
        <div className="scale-150">
          <Logo showText={false} clickable={false} />
        </div>
        <p className="text-lg text-stone-500 dark:text-stone-400">
          You do not have any signup forms yet. Create one to get started.
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
              Form Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Submissions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Created
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-[#2D2D2D]">
          {signupForms.map((signupForm) => (
            <SignupFormRow key={signupForm.id} data={signupForm} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
