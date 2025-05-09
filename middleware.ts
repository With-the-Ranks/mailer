import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const { pathname, search, origin } = req.nextUrl;
  const hostHeader = req.headers.get("host")!;
  let hostname = hostHeader.replace(
    ".localhost:3000",
    `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
  );

  // strip off Vercel preview suffixes
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname =
      hostname.split("---")[0] + `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  }

  if (hostname === `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    const session = await getToken({ req });

    if (!session && pathname !== "/login" && pathname !== "/register") {
      return NextResponse.redirect(new URL(`/login${search}`, req.url));
    }

    if (session && pathname === "/login") {
      return NextResponse.redirect(new URL(`/${search}`, req.url));
    }

    return NextResponse.rewrite(new URL(`/app${pathname}${search}`, req.url));
  }

  if (
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    hostname === "localhost:3000"
  ) {
    const appOrigin = origin.replace(hostname, `app.${hostname}`);

    if (pathname === "/login") {
      return NextResponse.redirect(new URL(`/login${search}`, appOrigin));
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL(`/login${search}`, appOrigin));
    }

    return NextResponse.rewrite(new URL(`/home${pathname}${search}`, req.url));
  }

  return NextResponse.rewrite(
    new URL(`/${hostname}${pathname}${search}`, req.url),
  );
}
