import { NextRequest, NextResponse } from "next/server";

export const config = {
  /*
    Matches all path exept for:
    1. /api routes
    2. /_next routes (Next.js internals)
    3. /static routes (inside /public folder)
    4. all root files inside /public (favicon.ico, robots.txt, etc.)
  */
  matcher: ["/((?!api/|_next/|_static/|_vercel|media/|[\w-]+\.\w+).*)"],
};

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  // extract the hostname
  const hostname = request.headers.get("host") || "";

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";

  if (hostname.endsWith(`.${rootDomain}`)) {
    const tenantSlug = hostname.replace(`.${rootDomain}`, "");

    return NextResponse.rewrite(
      new URL(`/tenants/${tenantSlug}${url.pathname}`, request.url),
    );
  }

  return NextResponse.next();
}
