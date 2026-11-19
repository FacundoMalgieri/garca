/**
 * Content Security Policy, aplicada en `src/middleware.ts`. Ninguna ruta carga
 * scripts de terceros salvo Turnstile, Cloudflare Insights y Umami.
 */

export function buildCsp(isDev: boolean): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://challenges.cloudflare.com",
    "https://static.cloudflareinsights.com",
    "https://analytics.garca.app",
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://github.com https://avatars.githubusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com https://analytics.garca.app",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}
