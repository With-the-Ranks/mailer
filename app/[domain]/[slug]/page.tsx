import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getPostData, getOrganizationData } from "@/lib/fetchers";
import BlogCard from "@/components/blog-card";
import BlurImage from "@/components/blur-image";
import { placeholderBlurhash, toDateString } from "@/lib/utils";
import { Maily } from "@maily-to/render";

export async function generateMetadata({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const slug = decodeURIComponent(params.slug);

  const [data, organizationData] = await Promise.all([
    getPostData(domain, slug),
    getOrganizationData(domain),
  ]);
  if (!data || !organizationData) {
    return null;
  }
  const { title, description } = data;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@vercel",
    },
  };
}

export async function generateStaticParams() {
  const allPosts = await prisma.email.findMany({
    select: {
      slug: true,
      organization: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
    },
  });

  const allPaths = allPosts
    .flatMap(({ organization, slug }) => [
      organization?.subdomain && {
        domain: `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
        slug,
      },
      organization?.customDomain && {
        domain: organization.customDomain,
        slug,
      },
    ])
    .filter(Boolean);

  return allPaths;
}

export default async function OrganizationPostPage({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const slug = decodeURIComponent(params.slug);
  const data = await getPostData(domain, slug);

  if (!data) {
    notFound();
  }

  const emailContent = await parseEmailContent(data.content, data.previewText);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="m-auto w-full text-center md:w-7/12">
          <h1 className="mb-10 font-title text-3xl font-bold text-stone-800 dark:text-white md:text-6xl">
            Campaign: {data.title}
          </h1>
          <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 dark:text-stone-400 md:text-base">
            {toDateString(data.createdAt)}
          </p>
          <p className="text-md m-auto w-10/12 text-stone-600 dark:text-stone-400 md:text-lg">
            {data.description}
          </p>
        </div>
        {/* <a
          href="#"
          rel="noreferrer"
          target="_blank"
        >
          <div className="my-8">
            <div className="relative inline-block h-8 w-8 overflow-hidden rounded-full align-middle md:h-12 md:w-12">
              <div className="absolute flex h-full w-full select-none items-center justify-center bg-stone-100 text-4xl text-stone-500">
                ?
              </div>
            </div>
            <div className="text-md ml-3 inline-block align-middle md:text-lg dark:text-white">
              by <span className="font-semibold">User Name</span>
            </div>
          </div>
        </a> */}
      </div>
      {/* <div className="relative m-auto mb-10 h-80 w-full max-w-screen-lg overflow-hidden md:mb-20 md:h-150 md:w-5/6 md:rounded-2xl lg:w-2/3">
        <BlurImage
          alt={data.title ?? "Post image"}
          width={1200}
          height={630}
          className="h-full w-full object-cover"
          placeholder="blur"
          blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
          src={data.image ?? "/placeholder.png"}
        />
      </div> */}

      <div
        className="mt-10"
        dangerouslySetInnerHTML={{ __html: emailContent }}
      />
    </>
  );
}

async function parseEmailContent(
  content: string | null,
  previewText: string | null,
) {
  if (!content) {
    return "";
  }

  let jsonContent;
  try {
    jsonContent = JSON.parse(content);
  } catch (error) {
    console.error("Invalid JSON content:", content);
    return "Invalid email content.";
  }

  const maily = new Maily(jsonContent);
  if (previewText) {
    maily.setPreviewText(previewText);
  }
  return await maily.renderAsync();
}
