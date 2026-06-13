import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildCsp } from "@/lib/security/csp";

/**
 * Middleware that:
 * 1. Exposes the current pathname to Server Components via the `x-pathname`
 *    request header. Server Components read it with `headers().get("x-pathname")`
 *    — used by the root layout to render page-specific JSON-LD in the initial
 *    `<head>` (in Next 16 + React 19, ld+json rendered inside page/child layouts
 *    is serialized into the RSC payload instead of the server HTML).
 * 2. Sets a per-route Content-Security-Policy. Content routes allow the Adsterra
 *    banner loader; `/ingresar` and `/panel` stay strict and ad-free. See
 *    `@/lib/security/csp`. (CSP lives here, not in next.config, because it must
 *    vary by pathname — header config there is static.)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const isDev = process.env.NODE_ENV === "development";
  response.headers.set("Content-Security-Policy", buildCsp(pathname, isDev));

  return response;
}

export const config = {
  matcher: [
    /**
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml (root metadata)
     * - any file with a dot (extension) like images, css, js
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
