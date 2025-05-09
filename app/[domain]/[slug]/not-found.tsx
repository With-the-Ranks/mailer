import { headers } from "next/headers";
import Image from "next/image";

import { getOrganizationData } from "@/lib/fetchers";

export default async function NotFound() {
  const headersList = headers();
  const domain = headersList
    .get("host")
    ?.replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);
  const data = await getOrganizationData(domain as string);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-cal text-4xl">{data ? `${data.name}: ` : ""}404</h1>
      <Image
        alt="missing organization"
        src="/empty-state.png"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        {data
          ? data.message404
          : "Blimey! You've found a page that doesn't exist."}
      </p>
    </div>
  );
}
