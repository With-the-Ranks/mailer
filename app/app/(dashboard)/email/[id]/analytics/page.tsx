import { notFound, redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import Chart from "@/components/Chart";

export default async function EmailAnalytics({
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
  });
  if (!data || data.userId !== session?.user.id) {
    notFound();
  }
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Email Analytics
        </h1>
        <h2>{data?.title}</h2>
        <h3>{data?.subject}</h3>
        <Chart emailId={params.id} />
      </div>
    </div>
  );
}
