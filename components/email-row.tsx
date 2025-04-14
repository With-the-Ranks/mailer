import type { Email, Organization } from "@prisma/client";
import { Edit3, Eye, Settings } from "lucide-react";
import Link from "next/link";

export default function EmailRow({
  data,
}: {
  data: Email & { organization?: Organization | null };
}) {
  let status = "";
  status = data.published ? "sent" : "draft";

  const lastUpdated = new Date(data.updatedAt).toLocaleDateString();
  let organization = data.organization;
  const url =
    organization &&
    `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  return (
    <tr>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
        {data.title || "No Subject"}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {lastUpdated}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
        {status === "sent" ? (
          <div className="flex justify-center gap-2">
            <Link
              href={`/email/${data.id}/settings`}
              className="btn"
              title="Performance"
            >
              <Settings size={20} />
            </Link>
            <Link href={`/email/${data.id}/`} className="btn" title="Editor">
              <Edit3 size={20} />
            </Link>
            {organization ? (
              <Link
                href={
                  process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${url}/${data.slug}`
                    : `http://${organization.subdomain}.localhost:3000/${data.slug}`
                }
                target="_blank"
                rel="noreferrer"
                className="btn text-sm"
              >
                <Eye size={20} />
              </Link>
            ) : null}
          </div>
        ) : (
          <Link
            href={`/email/${data.id}/editor`}
            className="btn"
            title="Editor"
          >
            <Edit3 size={20} />
          </Link>
        )}
      </td>
    </tr>
  );
}
