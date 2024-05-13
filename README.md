<a href="https://app.vercel.pub">
  <h1 align="center">Intrepid Email Campaigning Tool </h1>
</a>

<p align="center">
  <em>Revolutionize</em> your email campaign management<br/>
  with advanced features and intuitive design.
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="https://app.vercel.pub/"><strong>Demo</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="https://vercel.com/guides/nextjs-multi-tenant-application"><strong>Guide</strong></a> ·
  <a href="https://steven.vercel.pub/kitchen-sink"><strong>Kitchen Sink</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</p>
<br/>

## Introduction

The Intrepid Email Campaigning Tool is a full-stack application designed for modern email campaign management. It features a drag-and-drop builder and advanced tracking, built using [Next.js](https://nextjs.org/), [React-Email](https://react-email.com/), and supported by [Vercel PostgreSQL](https://vercel.com/storage/postgres) and [Prisma ORM](https://prisma.io/).

## Features

1. **Multi-tenancy:** Programmatically assign unlimited custom domains, subdomains, and SSL certificates to your users using the [Vercel Domains API](https://vercel.com/docs/rest-api/endpoints#domains)
2. **Performance**: Fast & beautiful blog posts cached via [Vercel's Edge Network](https://vercel.com/docs/concepts/edge-network/overview), with the ability to invalidate the cache on-demand (when users make changes) using [Incremental Static Regeneration](https://vercel.com/docs/concepts/next.js/incremental-static-regeneration) + Next.js' `revalidateTag` API
3. **AI Editor**: AI-powered Markdown editor for a Notion-style writing experience powered by [Novel](https://novel.sh/)
4. **Image Uploads**: Drag & drop / copy & paste image uploads, backed by [Vercel Blob](https://vercel.com/storage/blob)
5. **Custom styles**: Custom fonts, 404 pages, favicons, sitemaps for each site via the [Next.js file-based Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
6. **Dynamic OG Cards**: Each blog post comes with a dynamic OG image powered by [@vercel/og](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
7. **Dark Mode**: For a better user experience at night
8. **Multi-tenant Preview URLs**: Preview changes to your client sites using [Vercel Preview URLs](https://vercel.com/docs/deployments/generated-urls). [Learn more](https://vercel.com/guides/nextjs-multi-tenant-application#3.-multi-tenant-preview-urls).

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://images.ctfassets.net/e5382hct74si/k7XpXIE0rDsHCAYvkKhff/ff44c07588068d8fefa334cd6a318c8a/CleanShot_2023-07-05_at_08.39.02.png">
    <source media="(prefers-color-scheme: light)" srcset="https://images.ctfassets.net/e5382hct74si/7tiAitb8kdgUGktycr540c/d33f2834f9356bce25e0721c4ebe4f9a/CleanShot_2023-07-05_at_08.39.10.png">
    <img alt="Demo" src="https://images.ctfassets.net/e5382hct74si/7tiAitb8kdgUGktycr540c/d33f2834f9356bce25e0721c4ebe4f9a/CleanShot_2023-07-05_at_08.39.10.png">
</picture>

## Deploy Your Own

Deploy your own version of this starter kit with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-title=Platforms+Starter+Kit&demo-description=A+template+for+site+builders+and+low-code+tools.&demo-url=https%3A%2F%2Fdemo.vercel.pub%2F&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F40JwjdHlPr0Z575MPYbxUA%2Fd5903afc68cb34569a3886293414c37c%2FOG_Image.png&project-name=Platforms+Starter+Kit&repository-name=platforms-starter-kit&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fplatforms&from=templates&env=NEXT_PUBLIC_ROOT_DOMAIN%2CNEXTAUTH_SECRET%2CAUTH_GITHUB_ID%2CAUTH_GITHUB_SECRET%2CAUTH_BEARER_TOKEN%2CPROJECT_ID_VERCEL%2CTEAM_ID_VERCEL%2COPENAI_API_KEY&envDescription=These+environment+variables+are+required+to+run+this+application.&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fplatforms%2Fblob%2Fmain%2F.env.example&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

You can also [read the guide](https://vercel.com/guides/nextjs-multi-tenant-application) to learn how to develop your own version of this template.

## Built on open source

This working demo site was built using the Platforms Starter Kit and:

- [Next.js](https://nextjs.org/) as the React framework
- [Tailwind](https://tailwindcss.com/) for CSS styling
- [Prisma](https://prisma.io/) as the ORM for database access
- [Novel](https://novel.sh/) for the WYSIWYG editor
- [Vercel Postgres](https://vercel.com/storage/postgres) for the database
- [Vercel Blob](https://vercel.com/storage/blob) for image uploads
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Tremor](https://tremor.so/) for charts
- [Vercel](http://vercel.com/) for deployment

## Contributing

- [Start a discussion](https://github.com/vercel/platforms/discussions) with a question, piece of feedback, or idea you want to share with the team.
- [Open an issue](https://github.com/vercel/platforms/issues) if you believe you've encountered a bug with the starter kit.

## Author

- Steven Tey ([@steventey](https://twitter.com/steventey))

## License

The MIT License.

---

<a aria-label="Vercel logo" href="https://vercel.com">
  <img src="https://badgen.net/badge/icon/Made%20by%20Vercel?icon=zeit&label&color=black&labelColor=black">
</a>
