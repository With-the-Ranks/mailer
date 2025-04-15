import { notFound, redirect } from "next/navigation";

import Chart from "@/components/Chart";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
  if (!data.published) {
    redirect(`/email/${data.id}`);
  }
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Email Analytics for {data?.title}
        </h1>
        <Chart emailId={data.id} />
      </div>
    </div>
  );
}
