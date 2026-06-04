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

  const suppressionList = await prisma.emailSuppression.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const reasonCounts = await prisma.emailSuppression.groupBy({
    by: ["reason"],
    _count: true,
  });

  let totalSuppressed = 0;
  let bouncedCount = 0;
  let complainedCount = 0;
  let manualCount = 0;

  reasonCounts.forEach((item) => {
    const count = item._count;
    totalSuppressed += count;
    switch (item.reason) {
      case "HARD_BOUNCE":
        bouncedCount = count;
        break;
      case "COMPLAINT":
        complainedCount = count;
        break;
      case "MANUAL":
        manualCount = count;
        break;
    }
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
