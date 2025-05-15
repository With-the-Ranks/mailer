import { Maily } from "@maily-to/render";
import { notFound, redirect } from "next/navigation";

import Chart from "@/components/Chart";
import EmailPreview from "@/components/modal/preview-email";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function EmailDetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const email = await prisma.email.findUnique({
    where: { id: decodeURIComponent(id) },
  });
  if (!email || email.userId !== session.user.id) return notFound();
  if (!email.published) redirect(`/email/${email.id}`);

  const [sentCount, openedCount, clickedCount] = await Promise.all([
    prisma.emailEvent.count({
      where: { emailId: email.id, eventType: "delivered" },
    }),
    prisma.emailEvent.count({
      where: { emailId: email.id, eventType: "opened" },
    }),
    prisma.emailEvent.count({
      where: { emailId: email.id, eventType: "clicked" },
    }),
  ]);

  let previewHtml = "<p>No preview available</p>";
  if (email.content) {
    try {
      const json = JSON.parse(email.content);
      const maily = new Maily(json);
      if (email.previewText) maily.setPreviewText(email.previewText);
      previewHtml = await maily.render();
    } catch {
      previewHtml = "<p>Invalid email content</p>";
    }
  }

  const recipients = email.emailsTo || [];

  return (
    <div className="mx-auto w-full max-w-screen-lg p-6">
      <section className="my-8 space-y-6">
        <h1 className="text-3xl font-bold dark:text-white">{email.title}</h1>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Sent", value: sentCount },
            { label: "Opens", value: openedCount },
            { label: "Clicks", value: clickedCount },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-white p-4 shadow dark:bg-gray-800"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {label}
              </h3>
              <p className="mt-1 text-2xl font-semibold dark:text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="h-80 w-full">
          <Chart emailId={email.id} />
        </div>
      </section>

      <section className="my-8 space-y-4">
        <h2 className="text-xl font-semibold">Sent To</h2>
        {recipients.length === 0 ? (
          <p>No recipients recorded.</p>
        ) : (
          <ul className="divide-y rounded-lg bg-white shadow dark:bg-gray-800">
            {recipients.map((addr) => (
              <li key={addr} className="px-4 py-2 text-sm dark:text-gray-200">
                {addr}
              </li>
            ))}
          </ul>
        )}
      </section>

      <EmailPreview html={previewHtml} />
    </div>
  );
}
