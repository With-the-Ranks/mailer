import type { Prisma } from "@/prisma/generated/prisma/client";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
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
        <EmptyState
          icon="form"
          message="You do not have any signup forms yet. Create one to get started."
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <div className="min-w-[520px]">
        <table className="min-w-full table-fixed border-separate border-spacing-0">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
            <col className="w-[26%]" />
          </colgroup>
          <thead className="bg-transparent">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                Form Name
              </th>
              <th className="px-3 py-2 text-center text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                Status
              </th>
              <th className="px-3 py-2 text-center text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                Submissions
              </th>
              <th className="px-3 py-2 text-center text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                Created
              </th>
              <th className="px-3 py-2 text-right text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
        </table>
        <div className="rounded-lg border border-[#D3D3D3]">
          <table className="min-w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
              <col className="w-[26%]" />
            </colgroup>
            <tbody className="bg-white dark:bg-[#2D2D2D] [&>tr:first-child>td:first-child]:rounded-tl-lg [&>tr:first-child>td:last-child]:rounded-tr-lg [&>tr:last-child>td:first-child]:rounded-bl-lg [&>tr:last-child>td:last-child]:rounded-br-lg [&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-[#D3D3D3]">
              {signupForms.map((signupForm) => (
                <SignupFormRow key={signupForm.id} data={signupForm} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
