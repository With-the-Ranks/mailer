import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isSameOrigin } from "@/lib/utils";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/auto-signin",
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle API routes first
  if (pathname.startsWith("/api/")) {
    // CSRF protection for sensitive API routes
    if (
      req.method !== "GET" &&
      req.method !== "OPTIONS" &&
      (pathname.startsWith("/api/2fa/") || pathname.startsWith("/api/password"))
    ) {
      if (!isSameOrigin(req)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    // Let API routes pass through without domain routing
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  const { search } = url;
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

  if (isAppHost) {
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

export const config = {
  matcher: ["/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)", "/api/:path*"],
};
