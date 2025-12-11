import { notFound, redirect } from "next/navigation";

import EmailStats from "@/components/EmailStats";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function OrganizationAnalytics({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await prisma.organization.findUnique({
    where: {
      id: decodeURIComponent(id),
      users: {
        some: {
          id: {
            in: [session!.user.id as string],
          },
        },
      },
    },
  });
  if (!data) {
    notFound();
  }

  // const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex items-center justify-center sm:justify-start">
        <div className="flex flex-col items-center space-y-2 space-x-0 sm:flex-row sm:space-y-0 sm:space-x-4"></div>
      </div>
      <EmailStats userId={session.user.id} />
    </>
  );
}
