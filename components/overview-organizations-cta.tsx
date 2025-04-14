import Link from "next/link";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import CreateOrganizationButton from "./create-organization-button";
import CreateOrganizationModal from "./modal/create-organization";

export default async function OverviewOrganizationCTA() {
  const session = await getSession();
  if (!session) {
    return 0;
  }
  const organizations = await prisma.organization.count({
    where: {
      users: {
        some: {
          id: {
            in: [session.user.id as string],
          },
        },
      },
    },
  });

  return organizations > 0 ? (
    <Link href="/organizations" className="btn">
      View Dashboard
    </Link>
  ) : (
    <CreateOrganizationButton>
      <CreateOrganizationModal />
    </CreateOrganizationButton>
  );
}
