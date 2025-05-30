import { notFound, redirect } from "next/navigation";

import Audiences from "@/components/audiences";
import CreateAudienceListButton from "@/components/create-audience-list-button";
import CreateAudienceModal from "@/components/modal/create-audience-list";
import { getSession } from "@/lib/auth";
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
  const data = await prisma.organization.findUnique({
    where: {
      id: decodeURIComponent(params.id),
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
      <div className="flex flex-col items-center justify-between space-y-4 xl:flex-row xl:space-y-0">
        <div className="flex flex-col items-center space-y-2 xl:flex-row xl:space-x-4 xl:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            Audience Lists for {data.name}
          </h1>
          {/* <a
            href={
              process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${url}`
                : `http://${data.subdomain}.localhost:3000`
            }
            target="_blank"
            rel="noreferrer"
            className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            {url} ↗
          </a> */}
        </div>
        <CreateAudienceListButton>
          <CreateAudienceModal organizationId={decodeURIComponent(params.id)} />
        </CreateAudienceListButton>
      </div>
      <section>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Manage your audience lists below. Create new audience, manage custom
          fields and import data to better target your campaigns.
        </p>
      </section>
      <Audiences organizationId={decodeURIComponent(params.id)} />
    </>
  );
}
