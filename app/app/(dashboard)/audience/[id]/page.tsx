import { notFound, redirect } from "next/navigation";

import { ContactList } from "@/components/contact-list";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await prisma.audienceList.findUnique({
    where: {
      id: decodeURIComponent(id),
    },
    include: {
      organization: {
        select: {
          subdomain: true,
        },
      },
      audiences: true,
    },
  });

  if (!data) {
    notFound();
  }

  return (
    <ContactList
      listId={data.id}
      listName={data.name}
      initialContacts={data.audiences}
    />
  );
}
