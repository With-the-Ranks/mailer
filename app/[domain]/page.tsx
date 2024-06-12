import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlurImage from "@/components/blur-image";
import { placeholderBlurhash, toDateString } from "@/lib/utils";
import BlogCard from "@/components/blog-card";
import { getEmailsForOrganization, getOrganizationData } from "@/lib/fetchers";
import Image from "next/image";

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
    <>
      <div className="mb-20 w-full">
        {emails.length > 0 ? (
          <div className="mx-auto w-full max-w-screen-xl md:mb-28 lg:w-5/6">
            <Link href={`/${emails[0].slug}`}>
              <div className="group relative mx-auto h-80 w-full overflow-hidden sm:h-150 lg:rounded-xl">
                <BlurImage
                  alt={emails[0].title ?? ""}
                  blurDataURL={emails[0].imageBlurhash ?? placeholderBlurhash}
                  className="h-full w-full object-cover group-hover:scale-105 group-hover:duration-300"
                  width={1300}
                  height={630}
                  placeholder="blur"
                  src={emails[0].image ?? "/placeholder.png"}
                />
              </div>
              <div className="mx-auto mt-10 w-5/6 lg:w-full">
                <h2 className="my-10 font-title text-4xl md:text-6xl dark:text-white">
                  {emails[0].title}
                </h2>
                <p className="w-full text-base md:text-lg lg:w-2/3 dark:text-white">
                  {emails[0].description}
                </p>
                <div className="flex w-full items-center justify-start space-x-4">
                  <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full">
                    {data.users[0]?.image ? (
                      <BlurImage
                        alt={data.users[0]?.name ?? "User Avatar"}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                        src={data.users[0]?.image}
                      />
                    ) : (
                      <div className="absolute flex h-full w-full select-none items-center justify-center bg-stone-100 text-4xl text-stone-500">
                        ?
                      </div>
                    )}
                  </div>
                  <p className="ml-3 inline-block whitespace-nowrap align-middle text-sm font-semibold md:text-base dark:text-white">
                    {data.users[0]?.name}
                  </p>
                  <div className="h-6 border-l border-stone-600 dark:border-stone-400" />
                  <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 md:text-base dark:text-stone-400">
                    {toDateString(emails[0].createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Image
              alt="missing email"
              src="https://illustrations.popsy.co/gray/success.svg"
              width={400}
              height={400}
              className="dark:hidden"
            />
            <Image
              alt="missing email"
              src="https://illustrations.popsy.co/white/success.svg"
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

      {emails.length > 1 && (
        <div className="mx-5 mb-20 max-w-screen-xl lg:mx-24 2xl:mx-auto">
          <h2 className="mb-10 font-title text-4xl md:text-5xl dark:text-white">
            More stories
          </h2>
          <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
            {emails.slice(1).map((metadata: any, index: number) => (
              <BlogCard key={index} data={metadata} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
