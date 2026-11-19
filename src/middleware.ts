import { NextResponse } from "next/server";

import { buildCsp } from "@/lib/security/csp";

export function middleware() {
  const response = NextResponse.next();

  const isDev = process.env.NODE_ENV === "development";
  response.headers.set("Content-Security-Policy", buildCsp(isDev));

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
