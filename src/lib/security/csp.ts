/**
 * Content Security Policy builder, evaluated per-request in middleware so the
 * policy can vary by route.
 *
 * Why per-route: Adsterra display banners run inside a sandboxed (opaque-origin)
 * `srcdoc` iframe. A `srcdoc` iframe INHERITS the parent document's CSP, so to
 * let the loader run we must allow Adsterra's script/frame sources. We only do
 * that on content routes — pages that handle credentials or user data
 * (`/ingresar`, `/panel`) keep a strict, ad-free CSP. The iframe sandbox already
 * prevents the ad from reading localStorage; the route-scoped CSP is defense in
 * depth so an XSS on a product page can never pull in third-party scripts.
 *
 * Note: only the `srcdoc` document inherits this CSP. The actual ad creative is
 * a cross-origin iframe (highperformanceformat.com) that does NOT inherit it, so
 * a tight allowlist (script + frame) is enough — its images/beacons load inside
 * that escaping context.
 */

/** Routes that must NEVER load third-party scripts (credentials / user data). */
const STRICT_PREFIXES = ["/ingresar", "/panel"];

/**
 * Origin that serves the ad HTML (cross-origin iframe host). The Adsterra loader
 * runs THERE, not on garca.app, so we only need to allow framing it — its own
 * scripts/images load inside that escaping context and never hit this CSP.
 */
const ADS_ORIGIN = process.env.NEXT_PUBLIC_ADS_ORIGIN ?? "https://ads.garca.app";

export function isStrictRoute(pathname: string): boolean {
  return STRICT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function buildCsp(pathname: string, isDev: boolean): string {
  const allowAds = !isStrictRoute(pathname);

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://challenges.cloudflare.com",
    "https://static.cloudflareinsights.com",
    "https://analytics.garca.app",
  ];

  const frameSrc = [
    "https://challenges.cloudflare.com",
    ...(allowAds ? [ADS_ORIGIN] : []),
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://github.com https://avatars.githubusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com https://analytics.garca.app",
    `frame-src ${frameSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}
