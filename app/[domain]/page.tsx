import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlurImage from "@/components/blur-image";
import { getEmailsForOrganization, getOrganizationData } from "@/lib/fetchers";
import prisma from "@/lib/prisma";
import { placeholderBlurhash, toDateString } from "@/lib/utils";

export async function generateStaticParams() {
  const allOrganizations = await prisma.organization.findMany({
    select: {
      subdomain: true,
      customDomain: true,
    },
    // feel free to remove this filter if you want to generate paths for all organizations
    // where: {
    //   subdomain: "demo",
    // },
  });

  const allPaths = allOrganizations
    .flatMap(({ subdomain, customDomain }) => [
      subdomain && {
        domain: `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      },
      customDomain && {
        domain: customDomain,
      },
    ])
    .filter(Boolean);

  return allPaths;
}

export default async function OrganizationHomePage({
  params,
}: {
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const [data, emails] = await Promise.all([
    getOrganizationData(domain),
    getEmailsForOrganization(domain),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <div className="w-full">
      {emails.length > 0 ? (
        <div className="mx-auto max-w-screen-xl px-4 py-10">
          <h2 className="mb-10 font-title text-4xl dark:text-white md:text-5xl">
            Email List
          </h2>
          <ul className="space-y-4">
            {emails.map((email: any) => (
              <li key={email.slug}>
                <Link href={`/${email.slug}`} className="group block">
                  <div className="flex flex-col items-center gap-4 rounded-lg border p-4 transition hover:shadow-md md:flex-row">
                    {/* Thumbnail image container with a rectangular (16:9) aspect ratio */}
                    <div className="relative aspect-video w-full flex-shrink-0 md:w-1/4 lg:w-1/6">
                      <BlurImage
                        alt={email.title ?? ""}
                        blurDataURL={email.imageBlurhash ?? placeholderBlurhash}
                        src={email.image ?? "/placeholder.png"}
                        placeholder="blur"
                        className="rounded-md object-cover transition duration-300 group-hover:scale-105"
                        fill
                      />
                    </div>
                    {/* Email details with increased text size */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold group-hover:text-blue-600 dark:text-white">
                        {email.title}
                      </h3>
                      <p className="mt-2 text-base text-stone-600 dark:text-stone-400">
                        {email.description}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-stone-500 dark:text-stone-400 md:text-sm">
                        <span>{data.users[0]?.name}</span>
                        <span className="mx-2">|</span>
                        <span>{toDateString(email.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Image
            alt="missing email"
            src="/empty-state.png"
            width={400}
            height={400}
            className="dark:hidden"
          />
          <Image
            alt="missing email"
            src="/empty-state.png"
            width={400}
            height={400}
            className="hidden dark:block"
          />
          <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
            No emails yet.
          </p>
        </div>
      )}
    </div>
  );
}
