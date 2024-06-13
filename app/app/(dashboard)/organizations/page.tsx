import { Suspense } from "react";

import CreateOrganizationButton from "@/components/create-organization-button";
import CreateOrganizationModal from "@/components/modal/create-organization";
import Organizations from "@/components/organizations";
import PlaceholderCard from "@/components/placeholder-card";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function AllOrganizations({
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

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Your Organization
          </h1>
          {organizations.length === 0 && (
            <CreateOrganizationButton>
              <CreateOrganizationModal />
            </CreateOrganizationButton>
          )}
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <Organizations organizations={organizations} />
        </Suspense>
      </div>
    </div>
  );
}
