import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware that exposes the current pathname to Server Components via the
 * `x-pathname` request header. Server Components read it with
 * `headers().get("x-pathname")` — used by the root layout to render
 * page-specific JSON-LD structured data in the initial `<head>`.
 *
 * This is required because in Next.js 16 + React 19, `<script type="application/ld+json">`
 * tags rendered inside page/child-layout components are serialized into the RSC
 * payload instead of the initial HTML. Placing them in the root layout's `<head>`
 * (driven by pathname) guarantees they appear in the server-rendered HTML.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
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
