<a href="https://app.withtheranks.coop">
  <h1 align="center">The Mailer</h1>
</a>

<p align="center">
  <em>Revolutionize</em> your email campaign management<br/>
  with advanced features and intuitive design.
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="https://vercel.com/guides/nextjs-multi-tenant-application"><strong>Starter Guide</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="https://www.notion.so/a458bd4ddf4d400ea7cc0c5ea86e6873?v=1dcb785ca03c481b8f9a0c21924cb804&pvs=4"><strong>Notion Wiki</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</p>
<br/>

## Introduction

The Mailer is a full-stack application designed for modern email campaign management. It features a drag-and-drop builder and advanced tracking, built using [Next.js](https://nextjs.org/), [React-Email](https://react-email.com/), and supported by [Vercel PostgreSQL](https://vercel.com/storage/postgres) and [Prisma ORM](https://prisma.io/).

Note that this project is in pre-alpha development. We may introduce breaking changes without warning. Please review PR details regularly for summaries of changes when pulling new versions of this repo.

## Getting Started

To get started with the The Mailer, follow these steps:

1. **Install `pnpm`**:
   If you haven't installed `pnpm` yet, run:
   ```bash
    npm install -g pnpm
   ```
2. **Install dependencies and run the development server**:
   In your project directory, run:
   ```bash
    pnpm i && pnpm dev
   ```
   Your localhost should now be live at http://app.localhost:3000

### Create a production build

```bash
pnpm build
```

### Database Commands

Publish Prisma Schema

```bash
npx prisma db push
```

Open Prisma studio

```bash
npx prisma studio
```

## Features

1. **Multi-tenancy:** Programmatically assign unlimited custom domains, subdomains, and SSL certificates to your users using the [Vercel Domains API](https://vercel.com/docs/rest-api/endpoints#domains)
2. **Performance**: Fast & beautiful blog posts cached via [Vercel's Edge Network](https://vercel.com/docs/concepts/edge-network/overview), with the ability to invalidate the cache on-demand (when users make changes) using [Incremental Static Regeneration](https://vercel.com/docs/concepts/next.js/incremental-static-regeneration) + Next.js' `revalidateTag` API
3. **AI Editor**: AI-powered Markdown editor for a Notion-style writing experience powered by [Novel](https://novel.sh/)
4. **Image Uploads**: Drag & drop / copy & paste image uploads, backed by [Vercel Blob](https://vercel.com/storage/blob)
5. **Custom styles**: Custom fonts, 404 pages, favicons, sitemaps for each organization via the [Next.js file-based Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
6. **Dynamic OG Cards**: Each blog post comes with a dynamic OG image powered by [@vercel/og](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
7. **Dark Mode**: For a better user experience at night
8. **Multi-tenant Preview URLs**: Preview changes to your client sites using [Vercel Preview URLs](https://vercel.com/docs/deployments/generated-urls). [Learn more](https://vercel.com/guides/nextjs-multi-tenant-application#3.-multi-tenant-preview-urls).

## Built on open source

This project was built with open source technologies:

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

- [Create a pull request](https://github.com/With-the-Ranks/intrepid-email/pulls) to add new a feature or fix a bug.
- [Open an issue](https://github.com/With-the-Ranks/intrepid-email/issues) if you believe you've encountered a bug with the app.

## License

[AGPLv3](https://github.com/With-the-Ranks/intrepid-email/blob/main/LICENSE)

---
