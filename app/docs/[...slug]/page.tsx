import defaultMdxComponents from "fumadocs-ui/mdx";
import { DocsBody, DocsPage } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { source } from "@/lib/source";

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const path = params.slug.join("/") + ".mdx";

  return (
    <DocsPage
      tableOfContent={{
        style: "clerk",
      }}
      toc={page.data.toc}
      full={page.data.full}
      editOnGithub={{
        owner: "With-the-Ranks",
        repo: "mailer",
        sha: "main",
        path: `content/docs/${path}`,
      }}
    >
      <DocsBody className="docs-page prose">
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
