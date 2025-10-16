import { notFound, redirect } from "next/navigation";

import EmailStats from "@/components/EmailStats";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function OrganizationAnalytics({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const organizationId = decodeURIComponent(params.id);

  // Check if user is a member of this organization
  const member = await (prisma as any).organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id as string,
        organizationId: organizationId,
      },
    },
  });

  if (!member) {
    notFound();
  }

  const data = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });
  if (!data) {
    notFound();
  }

  // const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex items-center justify-center sm:justify-start">
        <div className="flex flex-col items-center space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="font-cal text-xl font-bold dark:text-white sm:text-3xl">
            Analytics for {data.name}
          </h1>
          {/* <a
            href={`https://${url}`}
            target="_blank"
            rel="noreferrer"
            className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            {url} ↗
          </a> */}
        </div>
      </div>
      <EmailStats organizationId={organizationId} />
    </>
  );
}
