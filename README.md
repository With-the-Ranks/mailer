
# Mailer
The easiest way to send organizing emails.


## Introduction

Mailer is a full-stack application designed to be the easiest way for organizers to send and manage email campaigns. Built specifically for campaigns and non-profits, it features an intuitive email editor, advanced tracking, and is built with [Next.js](https://nextjs.org/), [React-Email](https://react-email.com/), and supported by [Vercel PostgreSQL](https://vercel.com/storage/postgres) and [Prisma ORM](https://prisma.io/).

> [!NOTE]
> **This project is in pre-alpha development.** We may introduce breaking changes without warning. Please review PR details regularly for summaries of changes when pulling new versions of this repo.

## Getting Started

To get started with Mailer, follow these steps:

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

## Built on open source

This project was built with open source technologies:

- [Next.js](https://nextjs.org/) as the React framework
- [Tailwind](https://tailwindcss.com/) for CSS styling
- [Prisma](https://prisma.io/) as the ORM for database access
- [Maily](https://maily.to/) for email editing
- [Vercel Postgres](https://vercel.com/storage/postgres) for the database
- [Vercel Blob](https://vercel.com/storage/blob) for image uploads
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Tremor](https://tremor.so/) for charts
- [Vercel](http://vercel.com/) for deployment

## Contributing

- [Create a pull request](https://github.com/With-the-Ranks/mailer/pulls) to add new a feature or fix a bug.
- [Open an issue](https://github.com/With-the-Ranks/mailer/issues) if you believe you've encountered a bug with the app.

## License

[AGPLv3](https://github.com/With-the-Ranks/mailer/blob/main/LICENSE)

---
