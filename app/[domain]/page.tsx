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
  params: Promise<{ domain: string }>;
}) {
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);
  const [data, emails] = await Promise.all([
    getOrganizationData(domain),
    getEmailsForOrganization(domain),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="mx-auto max-w-screen-xl px-4 py-12 text-center">
        <h1 className="text-5xl font-bold text-stone-800 dark:text-white">
          Email Showcase
        </h1>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-300">
          Discover our unique email campaigns.
        </p>
      </div>

      {emails.length > 0 ? (
        <div className="mx-auto max-w-screen-xl px-4 py-10">
          <h2 className="mb-6 border-b pb-4 font-title text-4xl text-stone-800 dark:text-white md:text-5xl">
            All Created Emails
          </h2>
          <ul className="space-y-6">
            {emails.map((email: any) => (
              <li key={email.slug}>
                <Link href={`/${email.slug}`} className="group block">
                  <div className="flex flex-col items-center gap-4 rounded-xl border bg-white p-6 transition duration-300 hover:shadow-xl dark:border-stone-700 dark:bg-stone-800 md:flex-row">
                    {/* Image Container – rectangular 16:9 aspect ratio */}
                    <div className="relative aspect-video w-full flex-shrink-0 md:w-1/3 lg:w-1/4">
                      <BlurImage
                        alt={email.title || ""}
                        blurDataURL={email.imageBlurhash || placeholderBlurhash}
                        src={email.image || "/placeholder.png"}
                        placeholder="blur"
                        className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                      />
                    </div>
                    {/* Email details */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-stone-800 group-hover:text-blue-600 dark:text-white">
                        {email.title}
                      </h3>
                      <p className="mt-3 text-lg text-stone-600 dark:text-stone-300">
                        {email.description}
                      </p>
                      <div className="mt-4 flex flex-col items-center justify-center text-sm text-stone-500 dark:text-stone-400 md:flex-row md:justify-start">
                        <span>{data.users[0]?.name}</span>
                        <span className="mx-2 hidden md:inline">|</span>
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
          <p className="mt-6 font-title text-2xl text-stone-600 dark:text-stone-400">
            No emails yet.
          </p>
        </div>
      )}
    </div>
  );
}
