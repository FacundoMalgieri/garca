import type { NextConfig } from "next";

/**
 * NOTE: Content-Security-Policy is NOT set here; it lives in `src/middleware.ts`
 * via `@/lib/security/csp`.
 */

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
  // playwright-core lee browsers.json en runtime, no con un require estático, así
  // que el file tracing no lo detecta y el standalone quedaba sin él: todas las
  // rutas de scraping tiraban 500 con "Cannot find module .../browsers.json".
  outputFileTracingIncludes: {
    "/api/arca/**": ["./node_modules/playwright-core/browsers.json"],
  },
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
        source: "/(.*)",
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
