import type { Email } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import EmailCard from "./email-card";

export default async function Emails({
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
  const emails = await prisma.email.findMany({
    where: {
      userId: session!.user.id as string,
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      organization: true,
    },
    ...(limit ? { take: limit } : {}),
  });

  return emails.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {emails.map((email: Email) => (
        <EmailCard key={email.id} data={email} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      {/* <h1 className="font-cal text-4xl">No Posts Yet</h1> */}
      <Image
        alt="missing email"
        src="/empty-state.png"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any emails yet. Create one to get started.
      </p>
    </div>
  );
}
