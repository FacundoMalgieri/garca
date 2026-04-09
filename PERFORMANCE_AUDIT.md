# Performance Audit — GARCA

**Date:** 2026-04-09  
**Auditor:** Claude Sonnet 4.6  
**Stack:** Next.js App Router, React 19, React Compiler, Tailwind CSS v4, Recharts, html2canvas + jsPDF, Playwright SSE API

---

## Executive Summary

The codebase is well-structured and benefits from React Compiler's automatic memoization. However, several concrete performance issues exist across bundle size, redundant computation, missing memoization in components that cannot benefit from the compiler, large synchronous localStorage operations, and PDF library loading. None are critical blockers, but addressing the high-impact items will meaningfully improve LCP, TTI, and panel interaction latency.

---

## Findings

### 1. jsPDF + html2canvas loaded eagerly on the panel chunk

**Impact:** High  
**Location:** `src/components/InvoiceTable/utils/exporters/index.ts:1-3`, `src/components/ProjectionPanel/exporters.ts:1-2`

**Description:**  
Both exporter files import `jspdf`, `jspdf-autotable`, and `html2canvas` as static top-level imports. These libraries are collectively ~1 MB minified (jsPDF ≈ 290 kB, html2canvas ≈ 420 kB, jspdf-autotable ≈ 90 kB). Because `InvoiceTable` and `ProjectionPanel` are rendered eagerly on `/panel`, the entire PDF stack is included in the initial panel JavaScript bundle even though the user only triggers PDF export via a button click.

```ts
// src/components/InvoiceTable/utils/exporters/index.ts
import html2canvas from "html2canvas";   // ~420 kB
import jsPDF from "jspdf";               // ~290 kB
import autoTable from "jspdf-autotable"; // ~90 kB
```

**Recommendation:**  
Convert the export functions to use dynamic `import()` at the call-site (inside the async handler), so the libraries are only downloaded when the user clicks "Export":

```ts
export async function exportInvoicesToPDF(invoices, ...) {
  const [{ default: jsPDF }, { default: html2canvas }, { default: autoTable }] =
    await Promise.all([
      import("jspdf"),
      import("html2canvas"),
      import("jspdf-autotable"),
    ]);
  // rest of function unchanged
}
```

Apply the same pattern in `src/components/ProjectionPanel/exporters.ts`.

---

### 2. Recharts bundle not code-split; entire library loaded for a tabbed chart

**Impact:** High  
**Location:** `src/components/ChartsPanel/index.tsx:1-18`

**Description:**  
All Recharts primitives (`AreaChart`, `BarChart`, `PieChart`, `ResponsiveContainer`, etc.) are imported at the top of `ChartsPanel`. Recharts is ~430 kB minified. The `ChartsPanel` is always rendered on the panel page, so this cannot be tree-shaken to only the active tab's chart. Furthermore, only one chart tab is visible at a time ("progreso", "distribucion", "mensual"), yet all three chart components and their Recharts dependencies are instantiated in the DOM.

```ts
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
```

**Recommendation:**  
1. Lazy-load `ChartsPanel` from the panel page with `next/dynamic` and `ssr: false`. This moves the Recharts bundle out of the critical rendering path.
2. Render only the active tab's chart component (already done via conditional rendering), but consider also lazy-importing the inactive chart sub-components with `React.lazy` so each tab's chart code is deferred until first activation.

```ts
// src/app/panel/page.tsx
const ChartsPanel = dynamic(() => import("@/components/ChartsPanel").then(m => ({ default: m.ChartsPanel })), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
```

---

### 3. Triple independent traversal of the full invoice array on every render in `PanelPage`

**Impact:** High  
**Location:** `src/app/panel/page.tsx:21-63`

**Description:**  
`PanelPage` calls three functions that each independently iterate `state.invoices` on every render:

- `parseInvoiceDate` is redefined inside the component on every render (not memoized, not hoisted).
- `hasLast12MonthsData()` at line 27: calls `state.invoices.some(...)`, traversing up to N invoices.
- `calcularIngresosAnuales()` at line 45: calls `state.invoices.filter(...).reduce(...)`, traversing N invoices twice.

Both functions share identical date-range logic (`twelveMonthsAgo`, `today`) but compute it separately, creating three `new Date()` allocations and up to 2N + N item traversals per render. With 365 invoices (1 year × 1/day), this is ~1,000 object reads per render cycle.

```ts
// Lines 21-63 — all three run unconditionally on every render
const parseInvoiceDate = (fecha: string): Date => { ... }; // recreated each render
const hasLast12MonthsData = () => { ... state.invoices.some(...) ... };
const calcularIngresosAnuales = () => { ... state.invoices.filter(...).reduce(...) ... };
const hasCurrentYearData = hasLast12MonthsData();
const ingresosAnuales = calcularIngresosAnuales();
```

**Recommendation:**  
Hoist `parseInvoiceDate` outside the component (it has no closure dependencies). Merge `hasLast12MonthsData` and `calcularIngresosAnuales` into a single `useMemo` that does one pass over the invoices:

```ts
const { ingresosAnuales, hasCurrentYearData } = useMemo(() => {
  if (state.invoices.length === 0) return { ingresosAnuales: 0, hasCurrentYearData: false };
  const today = new Date();
  const twelveMonthsAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  let total = 0;
  let hasRecent = false;
  for (const inv of state.invoices) {
    const d = parseInvoiceDate(inv.fecha);
    if (d >= twelveMonthsAgo && d <= today) {
      hasRecent = true;
      total += inv.moneda !== "ARS" && inv.xmlData?.exchangeRate
        ? inv.importeTotal * inv.xmlData.exchangeRate
        : inv.importeTotal;
    }
  }
  return { ingresosAnuales: total, hasCurrentYearData: hasRecent };
}, [state.invoices]);
```

Note: React Compiler cannot auto-memoize inline function declarations that close over component-scope variables that change every render; an explicit `useMemo` is required here.

---

### 4. `SummaryPanel` — `calculateTotals` and `getAllCurrencies` run unsafeguarded on every render

**Impact:** Medium  
**Location:** `src/components/SummaryPanel/index.tsx:23-29`, `src/components/SummaryPanel/index.tsx:76-147`

**Description:**  
`SummaryPanel` calls `calculateTotals(state.invoices)` and `getAllCurrencies(byMonth, byYear)` as bare function calls inside the render body — no `useMemo`. `calculateTotals` iterates every invoice twice (once for `byMonth`, once for `byYear`) and builds two nested record structures. `getAllCurrencies` then iterates all resulting periods again. For a year of daily invoices (~365 items), each re-render of the parent (e.g., theme toggle, any context update) re-runs this O(N) work unnecessarily.

```ts
// SummaryPanel/index.tsx:23-29
const { byMonth, byYear } = calculateTotals(state.invoices); // no useMemo
const sortedMonths = Object.entries(byMonth).sort(...);
const sortedYears = Object.entries(byYear).sort(...);
const allCurrencies = getAllCurrencies(byMonth, byYear);      // no useMemo
```

**Recommendation:**  
Wrap the calculations in `useMemo` keyed on `state.invoices`:

```ts
const { byMonth, byYear, sortedMonths, sortedYears, foreignCurrencies } = useMemo(() => {
  const { byMonth, byYear } = calculateTotals(state.invoices);
  const sortedMonths = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]));
  const sortedYears = Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0]));
  const allCurrencies = getAllCurrencies(byMonth, byYear);
  return { byMonth, byYear, sortedMonths, sortedYears, foreignCurrencies: allCurrencies.filter(c => c !== "ARS") };
}, [state.invoices]);
```

---

### 5. `ChartsPanel` data preparation runs on every render and on every tab switch

**Impact:** Medium  
**Location:** `src/components/ChartsPanel/index.tsx:46-48`

**Description:**  
`prepareMonthlyData`, `prepareDistributionData`, and `getCurrentCategory` are called unconditionally on every render of `ChartsPanel`, before checking which tab is active. `prepareMonthlyData` iterates all invoices, builds a year-keyed record, sorts it, and computes a running cumulative sum. `prepareDistributionData` similarly aggregates by currency. Both results are computed even when the user is looking at a tab that doesn't use one of them.

```ts
// ChartsPanel/index.tsx:46-48 — runs on every render
const monthlyData = prepareMonthlyData(state.invoices);
const distributionData = prepareDistributionData(state.invoices);
const currentCategory = getCurrentCategory(monotributoData, ingresosAnuales);
```

**Recommendation:**  
Memoize all three derivations:

```ts
const monthlyData = useMemo(() => prepareMonthlyData(state.invoices), [state.invoices]);
const distributionData = useMemo(() => prepareDistributionData(state.invoices), [state.invoices]);
const currentCategory = useMemo(
  () => getCurrentCategory(monotributoData, ingresosAnuales),
  [monotributoData, ingresosAnuales]
);
```

React Compiler may handle some of this, but the functions are defined outside the component and the Compiler cannot always detect that they are pure with respect to only the listed inputs. Explicit memos are the safe choice.

---

### 6. `useMonotributo` — `calcularStatus` runs on every render without memoization

**Impact:** Medium  
**Location:** `src/hooks/useMonotributo/index.ts:50-82`

**Description:**  
`calcularStatus()` is called inline in the return statement at line 81. It sorts a copy of `MONOTRIBUTO_DATA.categorias` (a new `[...array].sort(...)` spread) and performs two find/indexOf operations on every call. The hook is called twice per page render: once in `PanelPage` (line 64) and once inside `MonotributoPanel` (line 18 of `MonotributoPanel/index.tsx`). This means the sort + find runs four times per panel render cycle.

```ts
// useMonotributo/index.ts:81
return {
  ...
  status: calcularStatus(), // called on every render, sorts array each time
};
```

**Recommendation:**  
Replace with `useMemo`:

```ts
const status = useMemo(() => calcularStatus(), [ingresosAnuales, tipoActividad]);
return { data: MONOTRIBUTO_DATA, tipoActividad, updateTipoActividad, status };
```

Also hoist the `[...MONOTRIBUTO_DATA.categorias].sort(...)` result to a module-level constant since `MONOTRIBUTO_DATA` is static:

```ts
const SORTED_CATEGORIAS = [...MONOTRIBUTO_DATA.categorias].sort((a, b) => a.ingresosBrutos - b.ingresosBrutos);
```

---

### 7. `useMonotributo` called twice per page — once in `PanelPage`, once in `MonotributoPanel`

**Impact:** Medium  
**Location:** `src/app/panel/page.tsx:64` and `src/components/MonotributoPanel/index.tsx:18`

**Description:**  
`PanelPage` calls `useMonotributo(hasCurrentYearData ? ingresosAnuales : 0)` to extract `{ data: monotributoData, tipoActividad }` for passing to `ChartsPanel` and `ProjectionPanel`. `MonotributoPanel` independently calls `useMonotributo(ingresosAnuales)` again, maintaining its own `tipoActividad` state, its own `localStorage` read on mount, and running its own `calcularStatus`. The two instances share no state except through the side channel of `localStorage`. This means if the user changes `tipoActividad` in `MonotributoPanel`, the outer `tipoActividad` used by `ChartsPanel` and `ProjectionPanel` is stale until the next render cycle triggers a re-read.

**Recommendation:**  
Lift `useMonotributo` to a single call site in `PanelPage` (or the context) and pass the result down as props. This eliminates the duplicate computation and the stale-state risk:

```tsx
// PanelPage — single call
const { data: monotributoData, tipoActividad, updateTipoActividad, status } =
  useMonotributo(hasCurrentYearData ? ingresosAnuales : 0);

// Pass updateTipoActividad + status into MonotributoPanel as props
<MonotributoPanel
  ingresosAnuales={ingresosAnuales}
  isCurrentYearData={hasCurrentYearData}
  tipoActividad={tipoActividad}
  onTipoActividadChange={updateTipoActividad}
  status={status}
  monotributoData={monotributoData}
/>
```

---

### 8. Synchronous `localStorage.setItem(JSON.stringify(invoices))` on every invoice state change

**Impact:** Medium  
**Location:** `src/hooks/useInvoices/index.ts:129-133`

**Description:**  
An effect watches `[state.invoices, state.company]` and synchronously serializes the full invoices array to localStorage on every change:

```ts
useEffect(() => {
  if (state.invoices.length > 0) {
    saveToStorage(state.invoices, state.company); // JSON.stringify on every change
  }
}, [state.invoices, state.company]);
```

`JSON.stringify` of 365 invoices with `xmlData` fields can take 5–20 ms on a mid-range mobile device and blocks the main thread. After the SSE stream completes, `setState` is called once with the full array, which means the effect fires once — acceptable. However if future changes cause incremental state updates (e.g., appending invoices), each update would re-serialize the full array.

**Recommendation:**  
This is low-risk as currently implemented (single write at end of stream), but add `structuredClone` or serialize on a `MessageChannel`/`scheduler` task to avoid jank if incremental writes are added. As a cheap guard, debounce the save:

```ts
const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
useEffect(() => {
  if (state.invoices.length === 0) return;
  clearTimeout(saveTimeoutRef.current);
  saveTimeoutRef.current = setTimeout(() => {
    saveToStorage(state.invoices, state.company);
  }, 300);
}, [state.invoices, state.company]);
```

---

### 9. Invoice sort in `useInvoiceFilters` constructs `new Date()` for every comparison

**Impact:** Medium  
**Location:** `src/components/InvoiceTable/hooks/useInvoiceFilters/index.ts:93-97`

**Description:**  
When sorting by `fecha` (the default sort field), the comparator constructs two `Date` objects on every comparison call:

```ts
case "fecha": {
  const [dayA, monthA, yearA] = a.fecha.split("/");
  const [dayB, monthB, yearB] = b.fecha.split("/");
  const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
  const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
  comparison = dateA.getTime() - dateB.getTime();
  break;
}
```

For N invoices, `Array.sort` performs O(N log N) comparisons — each constructing two `Date` objects. For 365 invoices, that is ~4,000 Date object allocations per sort operation, plus 365 × 2 `split("/")` calls.

**Recommendation:**  
Pre-compute a sortable numeric key (YYYYMMDD integer) for each invoice before sorting, or convert `fecha` to a timestamp once per invoice in a map step:

```ts
const decorated = filtered.map(inv => {
  const [d, m, y] = inv.fecha.split("/");
  return { inv, fechaKey: parseInt(y) * 10000 + parseInt(m) * 100 + parseInt(d) };
});
decorated.sort((a, b) => {
  const comp = a.fechaKey - b.fechaKey;
  return sortDirection === "asc" ? comp : -comp;
});
return decorated.map(x => x.inv);
```

This reduces date parsing from O(N log N) to O(N).

---

### 10. No `key` stability — invoice list uses array index as key

**Impact:** Medium  
**Location:** `src/components/InvoiceTable/index.tsx:174-176`, `src/components/InvoiceTable/index.tsx:186-188`

**Description:**  
Both the desktop table rows and the mobile cards use `index` as the React key:

```tsx
{visibleInvoices.map((invoice, index) => (
  <InvoiceRow key={index} invoice={invoice} index={index} />
))}
{visibleInvoices.map((invoice, index) => (
  <InvoiceCard key={index} invoice={invoice} />
))}
```

When the user sorts or filters, the order of `visibleInvoices` changes. Index-based keys cause React to update every existing DOM node (because key `0` now maps to a different invoice) rather than reordering. With 100+ rows, this creates unnecessary reconciliation work.

**Recommendation:**  
Use a stable unique identifier. `numeroCompleto` is a natural candidate (it is always present and is the invoice's identifier):

```tsx
<InvoiceRow key={invoice.numeroCompleto} invoice={invoice} index={index} />
```

---

### 11. `tabs` array with JSX icon nodes defined at module level in `ChartsPanel` — new element references on each module evaluation

**Impact:** Low  
**Location:** `src/components/ChartsPanel/index.tsx:32-36`

**Description:**  
```ts
const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "progreso", label: "Progreso Monotributo", icon: <TrendingUpIcon /> },
  { id: "distribucion", label: "Distribución", icon: <PieChartIcon /> },
  { id: "mensual", label: "Mensual", icon: <BarChartIcon /> },
];
```

Icon components are instantiated as JSX elements (`<TrendingUpIcon />`) inside a module-level constant. This is evaluated once at module load — fine in isolation. However React Compiler cannot optimize over module-scope JSX. The objects are stable across renders so this is not a hot path, but the pattern is fragile: any accidental move into component scope would create new objects every render.

**Recommendation:**  
Use function references instead of pre-instantiated elements, or keep icons as lazy-rendered functions called inside JSX. If kept at module level, use `Object.freeze` to signal intent.

---

### 12. No HTTP caching headers on SSE API routes

**Impact:** Low (correctness concern with performance implications)  
**Location:** `src/app/api/arca/invoices/stream/route.ts:16`, `src/app/api/arca/companies/stream/route.ts`

**Description:**  
Both streaming routes export `export const dynamic = "force-dynamic"` which correctly opts out of Next.js response caching. However, neither route sets explicit `Cache-Control: no-store` or `no-cache` headers on the `Response`. Some CDN and proxy configurations may buffer or cache SSE responses, defeating the streaming purpose and holding connections open.

**Recommendation:**  
Explicitly set caching and connection headers on the SSE `Response`:

```ts
return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-store",
    "X-Accel-Buffering": "no", // disables nginx proxy buffering (Dokploy/nginx)
    "Connection": "keep-alive",
  },
});
```

`X-Accel-Buffering: no` is particularly important for the Dokploy/nginx deployment described in the CI config.

---

### 13. No font optimization — system fonts only, but analytics script has no `preconnect`

**Impact:** Low  
**Location:** `src/app/layout.tsx:112`

**Description:**  
The app uses no custom web fonts (good). However, the Umami analytics script is loaded with `defer` from `https://analytics.garca.app`:

```tsx
<script defer src="https://analytics.garca.app/script.js" data-website-id="..." />
```

There is no `<link rel="preconnect">` or `<link rel="dns-prefetch">` for `analytics.garca.app`. On first load the browser must resolve the DNS for this domain before it can load the script. With `defer` this does not block rendering, but it delays the script execution.

**Recommendation:**  
Add a DNS prefetch in `layout.tsx` `<head>`:

```tsx
<link rel="dns-prefetch" href="https://analytics.garca.app" />
```

Or, since Umami is self-hosted on a subdomain, a `preconnect` is warranted:

```tsx
<link rel="preconnect" href="https://analytics.garca.app" />
```

---

### 14. `InvoiceTable` renders both desktop table and mobile cards simultaneously in the DOM

**Impact:** Low  
**Location:** `src/components/InvoiceTable/index.tsx:168-190`

**Description:**  
Both the `<div className="hidden md:block">` desktop table and the `<div className="space-y-4 md:hidden">` mobile card list are always rendered and in the DOM — only CSS visibility differs. For 100 visible invoices this means 200 React component instances (`InvoiceRow` + `InvoiceCard`) are mounted, all wired to event handlers, even though only 100 are visible.

```tsx
{/* Desktop Table — always mounted */}
<div className="hidden md:block">
  {visibleInvoices.map((invoice, index) => <InvoiceRow ... />)}
</div>
{/* Mobile Cards — always mounted */}
<div className="space-y-4 md:hidden">
  {visibleInvoices.map((invoice, index) => <InvoiceCard ... />)}
</div>
```

**Recommendation:**  
Use a JS media query hook (e.g., `useMediaQuery('(min-width: 768px)')`) to conditionally render only the appropriate list, or at minimum wrap the non-visible branch in a conditional. For very large lists (page size = "all"), this doubles the render cost.

---

### 15. `next.config.ts` — no image optimization configuration (`images` domain allow-list)

**Impact:** Low  
**Location:** `next.config.ts`

**Description:**  
The `nextConfig` object does not configure `images.domains` or `images.remotePatterns`. The app appears to use only local/static images (favicon, OG image), which is fine. However, there is no explicit `images.formats` configuration to opt into AVIF/WebP:

```ts
// next.config.ts — no images block
const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  output: "standalone",
  ...
};
```

If a future feature adds user-uploaded or remote images via `next/image`, they will silently fall back to JPEG/PNG without format negotiation.

**Recommendation:**  
Add an explicit images block to document intent and future-proof the config:

```ts
images: {
  formats: ["image/avif", "image/webp"],
},
```

---

## Summary Table

| # | Finding | Impact | File |
|---|---------|--------|------|
| 1 | jsPDF + html2canvas eagerly imported (~800 kB on initial panel bundle) | **High** | `InvoiceTable/utils/exporters/index.ts:1-3`, `ProjectionPanel/exporters.ts:1-2` |
| 2 | Recharts (~430 kB) not code-split; all tabs' charts always instantiated | **High** | `ChartsPanel/index.tsx:1-18` |
| 3 | Triple invoice traversal on every render in `PanelPage`, no `useMemo` | **High** | `panel/page.tsx:21-63` |
| 4 | `calculateTotals` + `getAllCurrencies` run unguarded on every `SummaryPanel` render | **Medium** | `SummaryPanel/index.tsx:23-29` |
| 5 | `prepareMonthlyData` / `prepareDistributionData` run on every `ChartsPanel` render | **Medium** | `ChartsPanel/index.tsx:46-48` |
| 6 | `calcularStatus` sorts array and runs on every `useMonotributo` call | **Medium** | `useMonotributo/index.ts:50-82` |
| 7 | `useMonotributo` called twice per page (PanelPage + MonotributoPanel) | **Medium** | `panel/page.tsx:64`, `MonotributoPanel/index.tsx:18` |
| 8 | Synchronous `JSON.stringify(invoices)` to localStorage on state change | **Medium** | `useInvoices/index.ts:129-133` |
| 9 | `new Date()` constructed per comparison during fecha sort — O(N log N) allocations | **Medium** | `useInvoiceFilters/index.ts:93-97` |
| 10 | Array index used as React key in invoice table and cards | **Medium** | `InvoiceTable/index.tsx:174-188` |
| 11 | JSX icon nodes pre-instantiated in module-level `tabs` array | **Low** | `ChartsPanel/index.tsx:32-36` |
| 12 | SSE routes missing `X-Accel-Buffering: no` and explicit `Cache-Control` | **Low** | `api/arca/invoices/stream/route.ts`, `api/arca/companies/stream/route.ts` |
| 13 | No `preconnect`/`dns-prefetch` for analytics domain | **Low** | `app/layout.tsx:112` |
| 14 | Desktop table + mobile cards both always mounted (double render cost) | **Low** | `InvoiceTable/index.tsx:168-190` |
| 15 | No `images.formats` in next.config.ts | **Low** | `next.config.ts` |

---

## Priority Recommendations

1. **Immediately:** Dynamic-import jsPDF, jspdf-autotable, and html2canvas inside export handler functions (Finding 1). This is the single largest bundle savings (~800 kB off the initial panel chunk) and requires minimal refactoring.

2. **High priority:** Lazy-load `ChartsPanel` with `next/dynamic` (Finding 2) and consolidate the triple invoice traversal in `PanelPage` into one `useMemo` (Finding 3).

3. **Medium priority:** Add `useMemo` to `SummaryPanel.calculateTotals` (Finding 4), `ChartsPanel` data prep (Finding 5), and `useMonotributo.calcularStatus` (Finding 6). Lift `useMonotributo` to a single call site (Finding 7). Fix invoice sort keys (Finding 10) and date parsing in sort comparator (Finding 9).

4. **Maintenance:** Address SSE headers (Finding 12) before wider deployment behind nginx.

## Validation Notes (2026-04-09)

### Addressed in this pass
- #1: jsPDF + html2canvas now dynamically imported at call-site
- #2: Recharts code-split — partially addressed. React Compiler handles memoization. Full lazy-loading of ChartsPanel deferred to avoid breaking chart-to-PDF capture flow which relies on DOM elements being present.
- #3: Triple traversal merged into single `useMemo` in PanelPage
- #4: SummaryPanel calculations wrapped in `useMemo`
- #5: ChartsPanel data prep wrapped in `useMemo`
- #6: `calcularStatus` wrapped in `useMemo` with sorted categories hoisted to module level
- #7: Duplicate `useMonotributo` call — partially valid. Lifting to single call site would require significant MonotributoPanel refactor. Memoization of calcularStatus (#6) reduces the duplicate work. Accepted for now.
- #8: localStorage save debounced with 300ms timeout
- #9: Date sort optimized with pre-computed numeric keys
- #10: Invoice table now uses stable composite keys
- #11: Module-level tabs array — accepted as-is. JSX elements at module scope are evaluated once and stable across renders.
- #12: SSE routes now include `X-Accel-Buffering: no` and `Cache-Control: no-store`
- #13: Analytics script now has `preconnect` hint
- #14: Desktop+mobile double render — accepted. CSS-only visibility is simpler and avoids hydration mismatches with JS media queries. Impact is low for typical invoice counts (< 100 visible).
- #15: `images.formats` added to next.config.ts
