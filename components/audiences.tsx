import { redirect } from "next/navigation";

import Logo from "@/components/logo";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated/prisma/client";

import AudienceCard from "./audience-card";

type AudienceListWithRelations = Prisma.AudienceListGetPayload<{
  include: {
    organization: true;
    _count: {
      select: {
        audiences: true;
      };
    };
  };
}>;

export default async function Audiences({
  organizationId,
  limit,
}: {
  organizationId?: string;
  limit?: number;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const audienceLists = await prisma.audienceList.findMany({
    where: {
      organizationId: organizationId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      organization: true,
      _count: {
        select: {
          audiences: true,
        },
      },
    },
    ...(limit ? { take: limit } : {}),
  });

  return audienceLists.length > 0 ? (
    <div className="justify-left flex">
      {audienceLists.map((audienceList: AudienceListWithRelations) => (
        <AudienceCard key={audienceList.id} data={audienceList} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center space-y-6 py-20">
      <div className="scale-150">
        <Logo showText={false} clickable={false} />
      </div>
      <p className="text-lg text-stone-500 dark:text-stone-400">
        You do not have any audience lists yet. Create one to get started.
      </p>
    </div>
  );
}
