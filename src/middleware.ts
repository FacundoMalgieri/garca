import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildCsp } from "@/lib/security/csp";

/**
 * CSP por ruta: las rutas de contenido permiten el loader de Adsterra;
 * `/ingresar` y `/panel` quedan estrictas y sin ads. Vive acá y no en
 * next.config porque tiene que variar según el pathname.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

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
