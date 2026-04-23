# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Kill port + start Next.js dev server
npm run build        # Production build
npm run start        # Kill port + start production server

# Quality
npm run lint         # ESLint on src/
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # TypeScript check (tsc --noEmit)

# Testing
npm test             # Run all tests
npm run test:ui      # Vitest UI
npm run test:coverage # Coverage report

# Run a single test file
npx vitest run src/components/Navbar/index.test.tsx
```

> **Note:** Web scrapers (`src/lib/scrapers/`) and API routes (`src/app/api/`) are excluded from automated tests — they require a real AFIP connection and must be tested manually.

## Architecture

**GARCA** is a Next.js App Router app for Argentine taxpayers to manage ARCA (AFIP) invoices. Credentials are AES-256 encrypted client-side before leaving the browser; nothing is stored server-side.

### Data Flow

1. User enters AFIP credentials on `/ingresar`
2. Credentials are encrypted with `crypto-js` (`src/lib/crypto/`) before being sent
3. API routes (`src/app/api/arca/`) receive encrypted credentials, run Playwright-based scrapers (`src/lib/scrapers/afip/`), and stream results back
4. Invoice data lands in `InvoiceContext` (`src/contexts/InvoiceContext.tsx`)
5. Dashboard at `/panel` reads from context via hooks (`useInvoices`, `useMonotributo`, `useProjection`)

### Key Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| Pages/Routes | `src/app/` | App Router pages + API endpoints |
| Components | `src/components/` | Feature panels + `ui/` base components |
| Context | `src/contexts/` | Global state (InvoiceContext, ThemeProvider) |
| Hooks | `src/hooks/` | Business logic encapsulation |
| Business Logic | `src/lib/` | Scrapers, security, crypto, projection, utils |
| Types | `src/types/` | Shared TypeScript definitions |

### API Routes

- `POST /api/arca/invoices` — scrape invoices (with `/stream` variant)
- `POST /api/arca/companies` — scrape companies (with `/stream` variant)
- All routes protected by Cloudflare Turnstile + IP rate limiting (30 req/min) via `src/lib/security/`

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero, feature grid, FAQ accordion, interactive demo with mock data |
| `/ingresar` | Login | CUIT + password form → fetches companies from ARCA, selects company + date range, then redirects to `/panel` |
| `/panel` | Dashboard | Main app: orchestrates all panels below using `InvoiceContext` + hooks |
| `/calculadora-monotributo` | Calculator | Standalone Monotributo recategorization simulator — no login required |
| `/privacidad` | Privacy | Legal page explaining 100% in-browser processing and AES-256 encryption |
| `/terminos` | Terms | Legal disclaimers, MIT license, ARCA non-affiliation notice |

### Dashboard Panels (`/panel`)

The dashboard is composed of independent panel components, all reading from `InvoiceContext`:

- **`SummaryPanel`** — totals by month/year broken down by currency with weighted ARS conversions
- **`MonotributoPanel`** — current category status, margin progress bar, monthly payment estimate, recategorization alerts
- **`ChartsPanel`** — tabbed charts: cumulative income vs category limits, currency distribution pie, monthly bar chart
- **`ProjectionPanel`** — interactive 12-month billing simulator to project future Monotributo category; exports to PDF/CSV/JSON
- **`InvoiceTable`** — filterable/sortable/paginated invoice list with desktop table + mobile card views

### State & Persistence

- **`InvoiceContext`** (`src/contexts/InvoiceContext.tsx`) — global state for invoices, loading/error, company info, AFIP Monotributo data, and fetch cancellation
- **`useMonotributo`** — derives current Monotributo category from annual income; activity type persisted to `localStorage`; category data updated via GitHub Actions (no runtime API calls)
- **`useProjection`** — manages 12-month projection simulation state; settings persisted to `localStorage`

### Path Alias

`@/*` maps to `./src/*` — use this everywhere instead of relative imports.

### Styling

Tailwind CSS v4 with `clsx` + `tailwind-merge` for conditional classes. Dark mode supported via `ThemeProvider`.

### SEO checklist — nueva guía (`/monotributo/...` o `/guias`)

1. **Página** — `src/app/monotributo/<ruta>/page.tsx` (metadata, canonical absoluto con `NEXT_PUBLIC_SITE_URL`, OG/Twitter).
2. **JSON-LD** — `src/lib/seo/page-schemas.ts`: FAQ entries, `Article` con `image: buildArticleImage("<slug-og>")` y `mainEntityOfPage: buildMainEntityOfPage(url, buildArticleImage("<slug-og>"))`, breadcrumb; registrar la ruta en `getSchemasForPath`.
3. **Índice `/guias`** — `src/app/guias/guides-data.ts` (`GUIDES`) y el `ItemList` dentro de `guiasCollectionPageSchema` (misma lista de URLs).
4. **Sitemap** — `src/app/sitemap.ts` si la URL es estática (las rutas dinámicas `categoria/[letra]` ya salen de datos).
5. **OG** — `public/og/<slug>.png` (1200×630) alineado al slug usado en `buildArticleImage`.
