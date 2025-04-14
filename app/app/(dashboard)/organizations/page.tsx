import Link from "next/link";

import CreateOrganizationButton from "@/components/create-organization-button";
import CreateOrganizationModal from "@/components/modal/create-organization";
import Organizations from "@/components/organizations";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function Dashboard({
  params,
}: {
  params: { id: string; limit?: number };
}) {
  const session = await getSession();

  const organizations = await prisma.organization.findMany({
    where: {
      users: {
        some: {
          id: {
            in: [session!.user.id as string],
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    ...(params.limit ? { take: params.limit } : {}),
  });

  const siteId = organizations.length > 0 ? organizations[0].id : null;
  let data = organizations.length > 0 ? organizations[0] : null;
  const url =
    data && `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <h1 className="font-cal text-3xl font-bold dark:text-white">
              Your Organization
            </h1>
            <div className="flex space-x-4">
              {organizations.length === 0 && (
                <CreateOrganizationButton>
                  <CreateOrganizationModal />
                </CreateOrganizationButton>
              )}
            </div>
          </div>

          {/* Responsive Button Group */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={
                siteId ? `/organization/${siteId}/settings` : "/organizations"
              }
              className="btn w-full sm:w-auto"
            >
              Go to Settings
            </Link>
            <Link
              href={
                siteId
                  ? `/organization/${siteId}/settings/appearance`
                  : "/organizations"
              }
              className="btn w-full sm:w-auto"
            >
              Customize Appearance
            </Link>
            <Link
              href={
                siteId ? `/organization/${siteId}/audience` : "/organizations"
              }
              className="btn w-full sm:w-auto"
            >
              View Audience
            </Link>
            <Link
              href={siteId ? `/organization/${siteId}` : "/organizations"}
              className="btn w-full sm:w-auto"
            >
              Manage Emails
            </Link>
            {data ? (
              <Link
                href={
                  process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${url}`
                    : `http://${data.subdomain}.localhost:3000`
                }
                target="_blank"
                rel="noreferrer"
                className="btn w-full sm:w-auto"
              >
                Email Showcase
              </Link>
            ) : null}
            <Link
              href={
                siteId ? `/organization/${siteId}/analytics` : "/organizations"
              }
              className="btn w-full sm:w-auto"
            >
              Analytics
            </Link>
          </div>

          {/* Organization List */}
          <Organizations organizations={organizations} />
        </div>
      </main>
    </div>
  );
}
