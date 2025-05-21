import { redirect } from "next/navigation";
import { Suspense } from "react";

import Emails from "@/components/emails";
import EmailStats from "@/components/EmailStats";
import Organizations from "@/components/organizations";
import OverviewOrganizationCTA from "@/components/overview-organizations-cta";
import PlaceholderCard from "@/components/placeholder-card";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function Overview() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const organizations = await prisma.organization.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const hasOrganization = organizations.length > 0;

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Your Organization
          </h1>
          {!hasOrganization && <OverviewOrganizationCTA />}
        </div>
        <Organizations limit={1} />
      </div>

      {hasOrganization && <EmailStats userId={userId} />}
      {hasOrganization && (
        <div className="flex flex-col space-y-6">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Recent Emails
          </h1>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <PlaceholderCard key={i} />
                ))}
              </div>
            }
          >
            <Emails limit={8} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
