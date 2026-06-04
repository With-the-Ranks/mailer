import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import QueueClient from "./queue-client";

export default async function QueueMonitorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: organizationId } = await params;
  const session = await getSession();

  if (!session?.user.id) {
    notFound();
  }

  const organization = await prisma.organization.findFirst({
    where: {
      id: decodeURIComponent(organizationId),
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!organization) {
    notFound();
  }

  return <QueueClient organizationId={organization.id} />;
}
