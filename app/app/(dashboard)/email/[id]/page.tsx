import { notFound, redirect } from "next/navigation";

import Editor from "@/components/editor";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function EmailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await prisma.email.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
    include: {
      organization: {
        select: {
          subdomain: true,
          logo: true,
        },
      },
    },
  });
  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  return <Editor email={data} />;
}
