import { headers } from "next/headers";

import Logo from "@/components/logo";
import { getOrganizationData } from "@/lib/fetchers";

export default async function NotFound() {
  const headersList = await headers();
  const domain = headersList
    .get("host")
    ?.replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);
  const data = await getOrganizationData(domain as string);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-20">
      <h1 className="text-4xl dark:text-white">
        {data ? `${data.name}: ` : ""}404
      </h1>
      <div className="scale-150">
        <Logo showText={false} clickable={false} />
      </div>
      <p className="text-lg text-stone-500 dark:text-stone-400">
        {data
          ? data.message404
          : "Blimey! You've found a page that doesn't exist."}
      </p>
    </div>
  );
}
