import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getOrganizationData as getOrganizationData } from "@/lib/fetchers";
import { fontMapper } from "@/styles/fonts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata | null> {
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);
  const data = await getOrganizationData(domain);
  if (!data) {
    return null;
  }
  const {
    name: title,
    description,
    image,
    logo,
  } = data as {
    name: string;
    description: string;
    image: string;
    logo: string;
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@vercel",
    },
    icons: [logo],
    metadataBase: new URL(`https://${domain}`),
    // Optional: Set canonical URL to custom domain if it exists
    // ...(params.domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
    //   data.customDomain && {
    //     alternates: {
    //       canonical: `https://${data.customDomain}`,
    //     },
    //   }),
  };
}

export default async function OrganizationLayout({
  params,
  children,
}: {
  params: Promise<{ domain: string }>;
  children: ReactNode;
}) {
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);
  const data = await getOrganizationData(domain);

  if (!data) {
    notFound();
  }

  // Optional: Redirect to custom domain if it exists
  if (
    domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
    data.customDomain &&
    process.env.REDIRECT_TO_CUSTOM_DOMAIN_IF_EXISTS === "true"
  ) {
    return redirect(`https://${data.customDomain}`);
  }

  return (
    <div className={fontMapper[data.font]}>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-10">
              <Image
                alt={data.name || ""}
                src={data.logo || ""}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-white">{data.name}</h1>
              <p className="text-sm text-white opacity-75">
                {data.description}
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="hidden text-white hover:underline sm:inline-block"
          >
            Showcase
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
