import { Maily } from "@maily-to/render";
import { notFound, redirect } from "next/navigation";

import Chart from "@/components/Chart";
import EmailPreview from "@/components/modal/preview-email";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Stats = { label: string; value: number };

export default async function EmailDetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const email = await prisma.email.findUnique({
    where: { id: decodeURIComponent(id) },
    include: {
      audienceList: { include: { audiences: true } },
    },
  });
  if (!email || email.userId !== session.user.id) return notFound();
  if (!email.published) redirect(`/email/${email.id}`);

  const now = new Date();
  const isScheduled = email.scheduledTime > now;
  const isSent = !isScheduled;

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

  let stats: Stats[] = [];
  let recipients: string[] = [];
  if (isSent) {
    const [sentCount, deliveredCount, openedCount, clickedCount, sentEvents] =
      await Promise.all([
        prisma.emailEvent.count({
          where: { emailId: email.id, eventType: "sent" },
        }),
        prisma.emailEvent.count({
          where: { emailId: email.id, eventType: "delivered" },
        }),
        prisma.emailEvent.count({
          where: { emailId: email.id, eventType: "opened" },
        }),
        prisma.emailEvent.count({
          where: { emailId: email.id, eventType: "clicked" },
        }),
        prisma.emailEvent.findMany({
          where: { emailId: email.id, eventType: "sent" },
          select: { emailTo: true },
          orderBy: { timestamp: "asc" },
        }),
      ]);
    stats = [
      { label: "Sent", value: sentCount },
      { label: "Delivered", value: deliveredCount },
      { label: "Opens", value: openedCount },
      { label: "Clicks", value: clickedCount },
    ];
    recipients = Array.from(
      new Set(sentEvents.map((e) => e.emailTo).filter((a): a is string => !!a)),
    );
  } else if (email.audienceList) {
    recipients = email.audienceList.audiences.map((a) => a.email);
  }

  return (
    <div className="mx-auto w-full max-w-screen-lg px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold dark:text-white sm:text-3xl">
          {email.title}
        </h1>
        {isScheduled ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Scheduled for{" "}
              <time dateTime={email.scheduledTime.toISOString()}>
                {new Date(email.scheduledTime).toLocaleString()}
              </time>
            </span>
            <form action={`/api/email/${email.id}/unschedule`} method="POST">
              <button
                type="submit"
                className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                Cancel Schedule
              </button>
            </form>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Sent at{" "}
            <time dateTime={email.updatedAt.toISOString()}>
              {new Date(email.updatedAt).toLocaleString()}
            </time>
          </div>
        )}
      </section>

      {isSent && (
        <>
          <section className="mb-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col rounded-lg bg-white p-4 shadow dark:bg-gray-800"
                >
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {label}
                  </span>
                  <span className="mt-1 text-2xl font-semibold dark:text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            {/* Chart */}
            <section className="mb-8">
              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <Chart emailId={email.id} />
              </div>
            </section>
          </section>
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold dark:text-gray-100 sm:text-2xl">
              Sent to
            </h2>
            {recipients.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No recipients recorded.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                        Recipient Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recipients.map((addr) => (
                      <tr
                        key={addr}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="break-all px-4 py-2 text-sm dark:text-gray-200">
                          {addr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Sending Recipients for Scheduled */}
      {!isSent && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold dark:text-gray-100 sm:text-2xl">
            Sending to
          </h2>
          {recipients.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No recipients found.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                      Recipient Email
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recipients.map((addr) => (
                    <tr
                      key={addr}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="break-all px-4 py-2 text-sm dark:text-gray-200">
                        {addr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section>
        <EmailPreview html={previewHtml} />
      </section>
    </div>
  );
}
