import { headers } from "next/headers";

import { getEmailsForOrganization } from "@/lib/fetchers";

export default async function Sitemap() {
  const headersList = headers();
  const domain =
    headersList
      .get("host")
      ?.replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) ??
    "vercel.pub";

  const emails = await getEmailsForOrganization(domain);

  return [
    {
      url: `https://${domain}`,
      lastModified: new Date(),
    },
    ...emails.map(({ slug }) => ({
      url: `https://${domain}/${slug}`,
      lastModified: new Date(),
    })),
  ];
}
