import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import SuppressionClient from "./suppression-client";

export default async function SuppressionListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: organizationId } = await params;
  const session = await getSession();

  if (!session?.user.id) {
    notFound();
  }

  const organization = await prisma.organization.findUnique({
    where: { id: decodeURIComponent(organizationId) },
    select: {
      id: true,
      name: true,
    },
  });

  if (!organization) {
    notFound();
  }

  // Get suppression list
  const suppressionList = await prisma.emailSuppression.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Get stats
  const totalSuppressed = await prisma.emailSuppression.count();
  const bouncedCount = await prisma.emailSuppression.count({
    where: { reason: "HARD_BOUNCE" },
  });
  const complainedCount = await prisma.emailSuppression.count({
    where: { reason: "COMPLAINT" },
  });
  const manualCount = await prisma.emailSuppression.count({
    where: { reason: "MANUAL" },
  });

  return (
    <SuppressionClient
      organizationId={organization.id}
      suppressionList={suppressionList.map((s) => ({
        id: s.id,
        email: s.email,
        reason: s.reason,
        sourceEmail: s.sourceEmail,
        createdAt: s.createdAt.toISOString(),
      }))}
      stats={{
        total: totalSuppressed,
        bounced: bouncedCount,
        complained: complainedCount,
        manual: manualCount,
      }}
    />
  );
}
