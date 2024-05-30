import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Editor from "@/components/editor";
import { EmailWithSite } from "@/components/editor";

export default async function EmailPage({ params }: { params: { id: string } }) {
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
        },
      },
    },
  });
  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  const emailData: EmailWithSite = {
    ...data,
    key: 0
  };

  return <Editor email={emailData} />;
}
