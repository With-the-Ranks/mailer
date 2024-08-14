import CreateOrganizationButton from "@/components/create-organization-button";
import CreateOrganizationModal from "@/components/modal/create-organization";
import Organizations from "@/components/organizations";
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
        <Organizations organizations={organizations} />
      </div>
    </div>
  );
}
