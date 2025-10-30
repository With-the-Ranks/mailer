// app/organization/[id]/audience/page.tsx

import { notFound, redirect } from "next/navigation";

import Audiences from "@/components/audiences";
import CreateAudienceListButton from "@/components/create-audience-list-button";
import CreateAudienceModal from "@/components/modal/create-audience-list";
import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function AudienceList({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const orgId = decodeURIComponent(params.id);

  const isMember = await isOrgMember(session.user.id as string, orgId);
  if (!isMember) {
    notFound();
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: orgId,
    },
    include: {
      audienceLists: true,
    },
  });

  if (!organization) {
    notFound();
  }

  const hasList = organization.audienceLists.length > 0;

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 xl:flex-row xl:space-y-0">
        <div className="flex flex-col items-center space-y-2 xl:flex-row xl:space-x-4 xl:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            All Contacts – {organization.name}
          </h1>
        </div>
        {/* Only show the create button if no list exists */}
        {!hasList && (
          <CreateAudienceListButton>
            <CreateAudienceModal organizationId={orgId} />
          </CreateAudienceListButton>
        )}
      </div>
      <section>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {hasList
            ? "This is your organization's global audience list. Manage your contacts and custom fields here."
            : "No audience list found. Create your Master List to get started."}
        </p>
      </section>
      <Audiences organizationId={orgId} />
    </>
  );
}
