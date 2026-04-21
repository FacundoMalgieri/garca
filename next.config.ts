import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy configuration.
 * 
 * NOTE on 'unsafe-inline':
 * - Next.js requires 'unsafe-inline' for script-src due to inline hydration scripts
 * - Tailwind/CSS requires 'unsafe-inline' for style-src
 * - To remove these, you'd need custom nonce implementation with middleware
 * - This is a known Next.js limitation: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 * 
 * NOTE on 'unsafe-eval':
 * - Only included in development for React HMR/Fast Refresh
 * - Removed in production builds
 */
const cspDirectives = [
  "default-src 'self'",
  // unsafe-eval only in dev (React HMR needs it), unsafe-inline required by Next.js
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://analytics.garca.app`,
  // unsafe-inline required for Tailwind/CSS-in-JS
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://github.com https://avatars.githubusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://analytics.garca.app",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  // Upgrade insecure requests in production
  ...(!isDev ? ["upgrade-insecure-requests"] : []),
];

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
        // OG hero images - content-addressable-ish, rarely regenerated.
        // Cache 1 year so Cloudflare edge + browsers reuse the same bytes.
        // We purge the Cloudflare cache on every deploy, so freshness is
        // handled at the edge layer; browsers eventually re-validate via
        // must-revalidate when stale.
        source: "/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, must-revalidate",
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
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
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
