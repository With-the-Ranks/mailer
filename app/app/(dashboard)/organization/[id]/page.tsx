import { notFound, redirect } from "next/navigation";

import CreateEmailButton from "@/components/create-email-button";
import Emails from "@/components/emails";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function SiteEmails({
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
            in: [session.user.id as string],
          },
        },
      },
    },
  });

  if (!data) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center space-y-4 md:items-start">
        <h1 className="mb-0 text-center text-2xl font-bold sm:text-3xl md:text-left dark:text-white">
          Emails
        </h1>
        <div className="py-4 md:py-6 lg:py-8">
          <CreateEmailButton organizationId={decodeURIComponent(id)} />
        </div>
      </div>
      <Emails organizationId={decodeURIComponent(id)} />
    </>
  );
}
