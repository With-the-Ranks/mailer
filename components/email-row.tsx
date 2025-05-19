import type { Email, Organization } from "@prisma/client";
import { Edit3, PieChart } from "lucide-react";
import Link from "next/link";

export default function EmailRow({
  data,
}: {
  data: Email & { organization?: Organization | null };
}) {
  const isPublished = data.published;
  const isScheduled = data.published && data.scheduledTime > new Date();

  const getStatus = () => {
    if (isScheduled) {
      return "Scheduled";
    } else if (isPublished) {
      return "Sent";
    }
    return "Draft";
  };
  const lastUpdated = new Date(data.updatedAt).toLocaleDateString();

  return (
    <tr className="transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
        <Link
          href={`/email/${data.id}${isPublished ? "/" : "/editor"}`}
          className="block"
        >
          {data.title || "No Subject"}
        </Link>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href={`/email/${data.id}${isPublished ? "/" : "/editor"}`}
          className="block"
        >
          {getStatus()}
        </Link>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href={`/email/${data.id}${isPublished ? "/" : "/editor"}`}
          className="block"
        >
          {lastUpdated}
        </Link>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
        <div className="flex justify-end gap-2">
          {isPublished ? (
            <>
              <Link href={`/email/${data.id}/`} className="btn" title="Report">
                <PieChart size={20} />
              </Link>
              {/* {organization && (
                <Link
                  href={
                    process.env.NEXT_PUBLIC_VERCEL_ENV
                      ? `https://${url}/${data.slug}`
                      : `http://${organization.subdomain}.localhost:3000/${data.slug}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="btn text-sm"
                  title="Preview"
                >
                  <Eye size={20} />
                </Link>
              )} */}
              {/* <Link
                href={`/email/${data.id}/settings`}
                className="btn"
                title="Settings"
              >
                <Settings size={20} />
              </Link> */}
            </>
          ) : (
            <>
              <Link
                href={`/email/${data.id}/editor`}
                className="btn"
                title="Editor"
              >
                <Edit3 size={20} />
              </Link>
              {/* <Link
                href={`/email/${data.id}/settings`}
                className="btn"
                title="Settings"
              >
                <Settings size={20} />
              </Link> */}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
