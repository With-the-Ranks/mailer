import Image from "next/image";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import AudienceCard from "./audience-card";

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
      {audienceLists.map((audienceList) => (
        <AudienceCard key={audienceList.id} data={audienceList} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      <Image
        alt="missing audiences"
        src="/empty-state.png"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any audience lists yet. Create one to get started.
      </p>
    </div>
  );
}
