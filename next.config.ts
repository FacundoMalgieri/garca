import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * NOTE: Content-Security-Policy is NOT set here. It's applied per-route in
 * `src/middleware.ts` via `@/lib/security/csp` so content routes can allow the
 * Adsterra banner loader while `/ingresar` and `/panel` stay strict. The static
 * `headers()` config below cannot vary by pathname, so CSP cannot live here.
 *
 * Exception: the `/ads/*` ad-host documents (served on the ads.garca.app origin)
 * get their own header block — they must be framable by garca.app, so they are
 * excluded from the global `X-Frame-Options: DENY` and instead pin embedding to
 * garca.app via `frame-ancestors`.
 */

/** Who may frame the ad-host documents. */
const adFrameAncestors = ["https://garca.app", ...(isDev ? ["http://localhost:3000"] : [])].join(" ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Enable strict mode for better error catching
  reactStrictMode: true,
  // Enable React Compiler (stable in Next.js 16 + React 19)
  reactCompiler: true,
  // Standalone output for Docker deployment
  output: "standalone",
  // Security + cache headers
  async headers() {
    return [
      {
        // OG hero images - 30 days so we stay flexible if we need to
        // re-touch an image without renaming. Cloudflare edge is purged
        // on every deploy, and browsers revalidate via must-revalidate.
        source: "/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, must-revalidate",
          },
        ],
      },
      {
        // Brand + PWA assets that change very rarely but are not hashed.
        source: "/:file(favicon-16x16.png|favicon-32x32.png|favicon-192x192.png|favicon-512x512.png|apple-touch-icon.png|logo-full.svg|logo-icon.svg|og-image.png|og-image.svg|site.webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, must-revalidate",
          },
        ],
      },
      {
        // Ad-host documents (ads.garca.app/ads/*) — must be framable by garca.app.
        // Excluded from the global X-Frame-Options: DENY below.
        source: "/ads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Content-Security-Policy", value: `frame-ancestors ${adFrameAncestors}` },
        ],
      },
      {
        source: "/((?!ads/).*)",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Force HTTPS (HSTS) - 1 year, include subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Content Security Policy is set per-route in middleware (see note above).
          // Disable browser features we don't need
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Cross-Origin policies
          // NOTE: COOP/COEP removed - they interfere with Cloudflare Turnstile
          // Turnstile requires cross-origin requests that COEP blocks
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
