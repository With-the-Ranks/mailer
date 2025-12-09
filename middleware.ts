import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|docs|[\\w-]+\\.\\w+).*)"],
};

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/auto-signin",
  "/unsubscribe",
];

const PUBLIC_PREFIXES = ["/app/signup-forms/", "/app/unsubscribe"];

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname, search } = url;
  const host = req.headers.get("host")!;

  const isVercelPreview =
    process.env.VERCEL_ENV === "preview" || host.endsWith(".vercel.app");

  if (isVercelPreview) {
    return NextResponse.rewrite(new URL(`/app${pathname}${search}`, req.url));
  }

  const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;
  const SUFFIX = process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX!;

  let hostname = host.replace(`.localhost:3000`, `.${ROOT}`);
  if (hostname.includes("---") && hostname.endsWith(`.${SUFFIX}`)) {
    hostname = hostname.split("---")[0] + `.${ROOT}`;
  }

  const isAppHost = hostname === `app.${ROOT}`;
  const isRootHost = hostname === ROOT || host === "localhost:3000";

  // Check if path starts with any public prefix
  const isPublicPrefix = PUBLIC_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isAppHost) {
    // Don't rewrite public prefix paths - they should be accessed directly
    if (isPublicPrefix) {
      return NextResponse.next();
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
