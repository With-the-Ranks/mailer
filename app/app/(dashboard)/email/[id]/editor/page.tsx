import { notFound, redirect } from "next/navigation";

import Editor from "@/components/editor";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await prisma.email.findUnique({
    where: {
      id: decodeURIComponent(id),
    },
    include: {
      organization: {
        select: {
          subdomain: true,
          logo: true,
          image: true,
        },
      },
    },
  });
  if (!data || data.userId !== session.user.id) {
    notFound();
  }
  if (data.published) {
    redirect(`/email/${data.id}/`);
  }

  return <Editor email={data} />;
}
