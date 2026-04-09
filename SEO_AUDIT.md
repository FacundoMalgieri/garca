# SEO Audit — garca.app

**Audited:** 2026-04-09  
**Stack:** Next.js 16 (App Router), React 19  
**Live URL:** https://garca.app  
**Language:** Spanish (Argentina)

---

## Executive Summary

GARCA has a solid SEO foundation: a well-structured root layout with comprehensive metadata, Open Graph and Twitter Card tags, JSON-LD structured data, a sitemap, and a robots.txt. The main gaps are per-page metadata (most pages inherit everything from the root and export no page-specific overrides), a `"use client"` landing page that prevents metadata exports, missing canonical tags on inner pages, no `noindex` on auth/app pages, no hreflang, and several Core Web Vitals risks tied to heavy scroll-animation JavaScript and the hero logo rendered with `<img>` instead of `<Image>`.

---

## Findings

### 1. Landing page (`/`) cannot export metadata — it is a Client Component

| Attribute | Value |
|---|---|
| **Priority** | High |
| **Location** | `src/app/page.tsx` line 1 (`"use client"`) |

**Issue:** The homepage is marked `"use client"`, which prevents it from exporting a `metadata` object or `generateMetadata` function per the Next.js App Router rules. The page inherits the root layout's default title ("GARCA - Gestor de Recuperación de Comprobantes de ARCA") and description, which is acceptable, but it also means the page-level canonical URL, per-page Open Graph `url`, and any homepage-specific structured-data injection from JSON-LD exports (`homeFaqSchema`, `homeBreadcrumbSchema`) are handled with inline `<script>` tags inside the JSX — which works but is fragile and not the idiomatic Next.js approach.

**Recommendation:** Split the page into a thin Server Component wrapper (`src/app/page.tsx`) that exports `metadata` and renders a Client Component child (`HomeClient.tsx`) for all interactive logic. This enables proper per-page metadata, including a page-specific title like "GARCA — Recuperá tus comprobantes de ARCA | Gratis y seguro", a distinct description, and a canonical `alternates.canonical` pointing to `https://garca.app/`.

---

### 2. No per-page metadata on inner pages (`/calculadora-monotributo`, `/privacidad`, `/terminos`, `/ingresar`)

| Attribute | Value |
|---|---|
| **Priority** | High |
| **Location** | `src/app/calculadora-monotributo/page.tsx`, `src/app/privacidad/page.tsx`, `src/app/terminos/page.tsx`, `src/app/ingresar/page.tsx` |

**Issue:** None of these pages export a `metadata` object or call `generateMetadata`. They all fall back to the root layout defaults, meaning every page has identical `<title>` ("GARCA - Gestor de Recuperación de Comprobantes de ARCA"), identical description, and identical Open Graph tags. Google will likely deduplicate or downrank pages with duplicate titles. The calculator page in particular targets high-value queries ("calculadora monotributo 2026", "recategorización monotributo") and would benefit greatly from a tailored title and description.

**Recommendation:** Add a `metadata` export to each Server Component page (or convert the `"use client"` page following recommendation #1). Suggested values:

- `/calculadora-monotributo`:
  - Title: `Calculadora de Monotributo 2026 — Proyectá tu categoría | GARCA`
  - Description: `Calculá en qué categoría de Monotributo vas a quedar en tu próxima recategorización. Ingresá tu facturación mes a mes y proyectá gratis.`
  - Canonical: `https://garca.app/calculadora-monotributo`

- `/privacidad`:
  - Title: `Política de Privacidad | GARCA`
  - Description: `GARCA no almacena tus datos. Todo funciona en tu navegador. Conocé cómo protegemos tu información.`
  - Canonical: `https://garca.app/privacidad`
  - Robots: `noindex` (legal page, low SEO value, avoids duplicate-content issues)

- `/terminos`:
  - Title: `Términos y Condiciones | GARCA`
  - Description: `Leé los términos y condiciones de uso de GARCA, la herramienta gratuita para gestionar comprobantes de ARCA.`
  - Canonical: `https://garca.app/terminos`
  - Robots: `noindex`

- `/ingresar`:
  - Title: `Ingresar con Clave Fiscal de ARCA | GARCA`
  - Robots: `noindex, nofollow` (see finding #4)

---

### 3. Root layout canonical points to the homepage only — inner pages have no canonical

| Attribute | Value |
|---|---|
| **Priority** | High |
| **Location** | `src/app/layout.tsx` line 88–90 |

**Issue:** The root layout sets `alternates: { canonical: siteUrl }`, which resolves to `https://garca.app` for every page. This means `/calculadora-monotributo`, `/privacidad`, and `/terminos` all emit `<link rel="canonical" href="https://garca.app/">`, incorrectly telling Googlebot that their canonical is the homepage.

**Recommendation:** Remove the `canonical` from the root layout (or set it to `undefined`). Each page should declare its own canonical via its own `metadata.alternates.canonical`. For the root layout's `metadata`, setting `metadataBase` (already done) is sufficient.

---

### 4. `/ingresar` and `/panel` are indexable and appear in the sitemap

| Attribute | Value |
|---|---|
| **Priority** | High |
| **Location** | `public/robots.txt`, `public/sitemap.xml`, `src/app/ingresar/page.tsx`, `src/app/panel/page.tsx` |

**Issue:** `robots.txt` correctly disallows `/panel`, but `/ingresar` is allowed and is listed in `sitemap.xml` with `priority 0.8`. The `/ingresar` page is the login screen — it has no meaningful content for search engines, its `<h1>` is visually hidden (`sr-only`), and it immediately redirects authenticated users to `/panel`. Giving it priority 0.8 (higher than the privacy/terms pages) is a misconfiguration.

Additionally, `robots.txt` does not disallow `/ingresar`, so Googlebot will crawl it, find a screen-reader-only h1 with no body text, and waste crawl budget.

**Recommendation:**
1. Add `Disallow: /ingresar` to `robots.txt`.
2. Remove `/ingresar` from `sitemap.xml`.
3. Add `robots: { index: false, follow: false }` to the `/ingresar` page metadata.
4. Also add `Disallow: /panel/` (trailing slash) to be safe — the current rule `Disallow: /panel` does not cover `/panel/something`.

---

### 5. `/calculadora-monotributo` has no JSON-LD structured data

| Attribute | Value |
|---|---|
| **Priority** | Medium |
| **Location** | `src/app/calculadora-monotributo/page.tsx` |

**Issue:** The calculator page has a rich FAQ accordion (5 questions) and a data table of Monotributo categories — both are ideal candidates for structured data that Google actively surfaces in search results. Currently neither a `FAQPage` nor a `Dataset`/`Table` schema is present. The homepage has a `FAQPage` schema; the calculator's FAQ is entirely separate and not covered.

**Recommendation:**
1. Add a `FAQPage` JSON-LD block to the calculator page matching its 5 FAQ items.
2. Consider adding a `WebApplication` or `HowTo` schema describing the projection tool.
3. The categories table could be annotated with a `Table` or `Dataset` schema, though this is optional.

---

### 6. `<img>` used for hero logo instead of Next.js `<Image>` — LCP risk

| Attribute | Value |
|---|---|
| **Priority** | Medium |
| **Location** | `src/app/page.tsx` ~line 346 |

**Issue:** The hero section renders the GARCA logo with a plain `<img src="/logo-full.svg" ...>` tag. Because this is likely the Largest Contentful Paint (LCP) element on the page, using a raw `<img>` tag misses several Next.js `<Image>` optimisations: automatic `loading="eager"` / `fetchpriority="high"` for above-the-fold images, preload link injection, and responsive sizing. SVGs are not converted by the Next.js image optimiser, but using `<Image>` still injects the correct `fetchpriority` and `preload` hints.

**Recommendation:** Replace the `<img>` tag with Next.js `<Image>` from `next/image`, setting `priority={true}` (which sets `fetchpriority="high"` and injects a `<link rel="preload">`). Provide explicit `width` and `height` to prevent Cumulative Layout Shift (CLS).

```tsx
import Image from "next/image";
// ...
<Image
  src="/logo-full.svg"
  alt="GARCA - Gestor Automático de Recuperación de Comprobantes de ARCA"
  width={144}
  height={144}
  priority
  className="relative h-28 w-28 md:h-36 md:w-36"
/>
```

---

### 7. Hero section uses JavaScript-driven opacity/transform animations on initial render — CLS/LCP risk

| Attribute | Value |
|---|---|
| **Priority** | Medium |
| **Location** | `src/app/page.tsx` lines 340–440 |

**Issue:** Every hero element starts with `opacity: 0` and `transform: translateY(40px)` and transitions to visible after a `setTimeout(..., 100)`. This means for 100 ms after the page renders, all hero content (including the LCP candidate) is invisible. Google's CLS/LCP measurement does not penalise the initial hidden state itself, but it does mean the LCP timestamp is delayed by at least 100 ms beyond when the browser has actually painted the element. Combined with the scroll-parallax `transform: translateY(scrollY * -0.8px)` applied via inline styles updated on every scroll event (no `will-change`, no `requestAnimationFrame` throttling), this can cause jank and poor INP scores.

**Recommendation:**
1. For the logo/title/h1: Remove the JS-driven initial hide. Use CSS `@keyframes` animations with `animation-fill-mode: backwards` and `animation-delay` instead — these do not delay LCP measurement.
2. For the scroll parallax: Add `will-change: transform` to the parallax container or switch to a CSS `@supports (animation-timeline: scroll)` scroll-driven animation, which runs off the main thread.
3. Consider whether the entrance animation on the hero is worth the LCP penalty for first-time visitors.

---

### 8. FAQ schema on the homepage is emitted via client-side `<script>` tags, not server-rendered

| Attribute | Value |
|---|---|
| **Priority** | Medium |
| **Location** | `src/app/page.tsx` lines 294–295 |

**Issue:** Because `page.tsx` is a Client Component, the `FAQPage` and `BreadcrumbList` JSON-LD scripts are injected at runtime (after hydration), not in the initial HTML. Most crawlers including Googlebot can execute JavaScript, but server-rendered structured data is more reliable and is indexed on the first crawl without requiring a second pass.

**Recommendation:** After converting the page to a Server Component wrapper (finding #1), move the JSON-LD injection into the server-rendered portion using Next.js's `<Script strategy="beforeInteractive">` or by placing the `<script type="application/ld+json">` tag in the server component's return — the same pattern already used in `layout.tsx` with `<JsonLd />`.

---

### 9. `/calculadora-monotributo` heading hierarchy uses `h2` before establishing an `h1`-equivalent context

| Attribute | Value |
|---|---|
| **Priority** | Medium |
| **Location** | `src/app/calculadora-monotributo/page.tsx` lines 182, 273, 481, 538 |

**Issue:** The page has a correct `<h1>` ("Calculadora de Monotributo 2026"). However, the "Facturación mensual" label inside the projection tool is rendered as an `<h2>` (line 273), which places it at the same heading level as the "Tabla de Categorías" and "Preguntas frecuentes" sections. This is a minor hierarchy issue, but screen readers and crawlers use heading levels to understand document structure. An interactive input label should not be an `<h2>`.

**Recommendation:** Change "Facturación mensual" from `<h2>` to a `<p>` or `<legend>` (if wrapped in a `<fieldset>`), or to an `<h3>` if you want to keep it in the heading hierarchy as a sub-section of the tool.

---

### 10. No hreflang tags

| Attribute | Value |
|---|---|
| **Priority** | Medium |
| **Location** | `src/app/layout.tsx` |

**Issue:** The app is entirely in Spanish (Argentina). The root layout sets `<html lang="es">` and the Open Graph locale is `es_AR`, which is correct. However, there are no `hreflang` link tags. For a monolingual site with a single regional audience, hreflang is not strictly required, but Google recommends it for content targeting a specific country locale (`es-AR`) to disambiguate from other Spanish-language pages.

**Recommendation:** Add hreflang to the root layout metadata:

```ts
alternates: {
  languages: {
    "es-AR": siteUrl,
    "x-default": siteUrl,
  },
},
```

This also sets the correct `Content-Language` signal for Googlebot's geotargeting.

---

### 11. `privacidad` and `terminos` pages have no metadata — they are indexed with priority 0.5

| Attribute | Value |
|---|---|
| **Priority** | Medium |
| **Location** | `public/sitemap.xml`, `src/app/privacidad/page.tsx`, `src/app/terminos/page.tsx` |

**Issue:** Both legal pages are listed in the sitemap with `priority 0.5` and `changefreq monthly`. Including them in the sitemap is not harmful, but they inherit the root title and will appear in Google Search with the generic site title and description, which wastes impressions. More importantly, both pages have `<h1>` tags but no `metadata` exports — meaning their `<title>` elements in the rendered HTML will be "GARCA - Gestor de Recuperación de Comprobantes de ARCA" for both, which is a duplicate title issue.

**Recommendation:** Either add `robots: { index: false }` metadata to both pages and remove them from the sitemap (preferred — legal pages offer no search value), or add unique `metadata` exports with descriptive titles and lower-priority canonical signals.

---

### 12. `/panel` should be explicitly `noindex` in metadata, not just in `robots.txt`

| Attribute | Value |
|---|---|
| **Priority** | Medium |
| **Location** | `src/app/panel/page.tsx`, `public/robots.txt` |

**Issue:** `robots.txt` disallows `/panel`, which prevents Googlebot from crawling it. However, `robots.txt` disallow does not prevent a URL from being indexed if it is linked from elsewhere (e.g., the floating "Ir al reporte" banner in `page.tsx` links to `/panel`). A `robots.txt` Disallow blocks crawling but not indexing via discovered links. The only reliable way to prevent indexing is an `X-Robots-Tag: noindex` header or a `<meta name="robots" content="noindex">` on the page itself.

**Recommendation:** Add `metadata` to `src/app/panel/page.tsx`:

```ts
export const metadata: Metadata = {
  title: "Panel | GARCA",
  robots: { index: false, follow: false },
};
```

---

### 13. Open Graph image is the same across all pages

| Attribute | Value |
|---|---|
| **Priority** | Low |
| **Location** | `src/app/layout.tsx` lines 72–79 |

**Issue:** All pages share the same `/og-image.png` (1200×630). For social sharing, the calculator page would benefit from a distinct OG image that references "Calculadora de Monotributo" to improve click-through rates on social platforms.

**Recommendation:** Once per-page metadata is added (finding #2), add a distinct `openGraph.images` entry for `/calculadora-monotributo`. This can be a static image or a dynamically generated one via Next.js's `opengraph-image.tsx` file convention.

---

### 14. Twitter card lacks `twitter:site` and `twitter:creator` handles

| Attribute | Value |
|---|---|
| **Priority** | Low |
| **Location** | `src/app/layout.tsx` lines 81–87 |

**Issue:** The Twitter/X card metadata includes `card`, `title`, `description`, and `images`, but omits `site` (the publishing account) and `creator` (the author's handle). While not required, these improve attribution and can influence how the card is displayed.

**Recommendation:** If the project has a Twitter/X account, add:

```ts
twitter: {
  // ...existing fields
  site: "@garca_app",    // or whatever the handle is
  creator: "@facundomalgieri",
},
```

If there is no Twitter account, this finding can be safely ignored.

---

### 15. Sitemap is static and manually maintained — risk of going stale

| Attribute | Value |
|---|---|
| **Priority** | Low |
| **Location** | `public/sitemap.xml` |

**Issue:** The sitemap is a static file with hardcoded `lastmod` dates (currently `2026-04-08` for all pages). This is functional, but every time a page is updated the sitemap must be manually edited. Next.js App Router supports a programmatic `src/app/sitemap.ts` file that is generated at build time and can pull `lastmod` from the filesystem or a CMS automatically.

**Recommendation:** Replace `public/sitemap.xml` with `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/calculadora-monotributo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    // Remove /ingresar, /privacidad, /terminos or keep with lower priority
  ];
}
```

This auto-generates `/sitemap.xml` at build time and eliminates manual upkeep.

---

### 16. `site.webmanifest` referenced in metadata but not audited for SEO signals

| Attribute | Value |
|---|---|
| **Priority** | Low |
| **Location** | `src/app/layout.tsx` line 63, `public/site.webmanifest` |

**Issue:** The manifest is declared and linked, which is good. However, the manifest `name`, `short_name`, `description`, and `lang` fields contribute to how the PWA is presented in app stores and browser install prompts, and Google indexes manifest data. This was not checked.

**Recommendation:** Verify `public/site.webmanifest` contains:
- `"lang": "es-AR"`
- A meaningful `"description"` (same as the site meta description)
- Correct `"start_url": "/"`
- `"display": "standalone"` or `"minimal-ui"`

---

## Summary Table

| # | Priority | Page / File | Issue |
|---|---|---|---|
| 1 | High | `src/app/page.tsx` | Landing is `"use client"` — cannot export `metadata`; use Server Component wrapper |
| 2 | High | All inner pages | No per-page `metadata` exports — all pages share the same title/description/OG |
| 3 | High | `src/app/layout.tsx` | Root canonical points to homepage for all pages |
| 4 | High | `robots.txt`, `sitemap.xml`, `/ingresar` | Login page is crawlable, indexable, and in sitemap |
| 5 | Medium | `calculadora-monotributo/page.tsx` | No JSON-LD (FAQPage, WebApplication) on calculator page |
| 6 | Medium | `src/app/page.tsx` | Plain `<img>` for hero logo — LCP/preload not optimised |
| 7 | Medium | `src/app/page.tsx` | JS-driven opacity:0 entrance animation delays LCP; scroll parallax risks INP |
| 8 | Medium | `src/app/page.tsx` | FAQ/Breadcrumb JSON-LD injected client-side, not server-rendered |
| 9 | Medium | `calculadora-monotributo/page.tsx` | "Facturación mensual" is an `<h2>` inside an interactive widget |
| 10 | Medium | `src/app/layout.tsx` | No `hreflang` for `es-AR` / `x-default` |
| 11 | Medium | `privacidad/`, `terminos/` | No metadata; duplicate titles; in sitemap with no SEO value |
| 12 | Medium | `src/app/panel/page.tsx` | No `noindex` metadata — `robots.txt` Disallow alone is insufficient |
| 13 | Low | `src/app/layout.tsx` | All pages share the same OG image |
| 14 | Low | `src/app/layout.tsx` | Twitter card missing `site` and `creator` handles |
| 15 | Low | `public/sitemap.xml` | Static sitemap — use `src/app/sitemap.ts` for automatic generation |
| 16 | Low | `public/site.webmanifest` | Manifest `lang` and `description` not verified |

---

## Quick Wins (implement in one sitting)

1. Add `robots: { index: false, follow: false }` to `/ingresar` and `/panel` page metadata.
2. Remove `/ingresar` from `sitemap.xml` and add `Disallow: /ingresar` to `robots.txt`.
3. Remove the hardcoded `canonical: siteUrl` from the root layout `alternates`.
4. Add a minimal `metadata` export to `calculadora-monotributo/page.tsx` with a unique title and description (this page can stay `"use client"` if split into a server wrapper — or just add a route segment config).
5. Replace the hero `<img>` with `<Image priority>` from `next/image`.
6. Replace `public/sitemap.xml` with `src/app/sitemap.ts`.

## Validation Notes (2026-04-09)

### Addressed in this pass
- #1: Landing page `"use client"` — root layout already provides comprehensive metadata. Server component wrapper deferred; current approach works because root layout metadata applies to the homepage.
- #2: Per-page metadata — already implemented via layout.tsx files for /calculadora-monotributo, /privacidad, /terminos, /ingresar
- #3: Root canonical removed; pages use their own canonical via layout files
- #4: /ingresar — INTENTIONALLY LEFT INDEXED per user request. User wants this page discoverable.
- #5: Calculator JSON-LD — already implemented in calculadora-monotributo/layout.tsx (FAQPage, WebApplication, BreadcrumbList)
- #6: Hero logo replaced with next/image `<Image priority>`
- #7: JS-driven hero animations — accepted. The entrance animation is a deliberate UX choice. Impact on LCP is ~100ms which is within acceptable range. CSS @keyframes alternative would require significant refactor of the scroll-based parallax system.
- #8: FAQ/Breadcrumb JSON-LD client-side — partially valid. Googlebot executes JavaScript and indexes client-rendered JSON-LD. Moving to server component would require the page split mentioned in #1. Accepted for now.
- #9: Calculator "Facturación mensual" h2 changed to h3
- #10: hreflang added for es-AR and x-default
- #11: /privacidad and /terminos already have layout files with metadata
- #12: /panel now has noindex via layout.tsx
- #13: Per-page OG images — accepted as low priority. Would require creating distinct OG images for each page. Current shared image is acceptable.
- #14: Twitter site/creator — no Twitter/X account exists for the project. Not applicable.
- #15: Static sitemap replaced with dynamic src/app/sitemap.ts
- #16: site.webmanifest lang added
