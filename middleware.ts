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

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname, search } = url;
  const host = req.headers.get("host")!;

  const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;
  const SUFFIX = process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX!;

  let hostname = host.replace(`.localhost:3000`, `.${ROOT}`);
  if (hostname.includes("---") && hostname.endsWith(`.${SUFFIX}`)) {
    hostname = hostname.split("---")[0] + `.${ROOT}`;
  }

  const isAppHost = hostname === `app.${ROOT}`;
  const isRootHost = hostname === ROOT || host === "localhost:3000";
  const session = await getToken({ req });

  if (isAppHost) {
    if (!session && !PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL(`/login${search}`, req.url));
    }

    if (session && pathname === "/login") {
      return NextResponse.redirect(new URL(`/${search}`, req.url));
    }

    return NextResponse.rewrite(new URL(`/app${pathname}${search}`, req.url));
  }

  if (isRootHost) {
    const appOrigin = new URL(req.url);
    appOrigin.host = `app.${hostname}`;

    if (pathname === "/" || PUBLIC_PATHS.includes(pathname)) {
      const target = pathname === "/" ? "/login" : pathname;
      return NextResponse.redirect(new URL(`${target}${search}`, appOrigin));
    }

    return NextResponse.rewrite(new URL(`/home${pathname}${search}`, req.url));
  }

  return NextResponse.rewrite(
    new URL(`/${hostname}${pathname}${search}`, req.url),
  );
}
