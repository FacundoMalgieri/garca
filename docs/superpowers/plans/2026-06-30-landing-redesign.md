# Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Visual polish:** For the section components (Tasks 5–10) the implementer SHOULD invoke the `frontend-design` skill to refine the JSX into production-grade, on-brand UI. The code in each task is a complete, functional, on-brand scaffold — not a placeholder — but the look-and-feel can be elevated during execution as long as the contract (props, tracking, structure) is preserved.

**Goal:** Rediseñar la landing (`/`) de GARCA de "logo centrado + grid de feature cards genéricas" a una landing fintech-de-confianza con hero split (copy + mockup real del panel), privacidad como sección propia, guías con peso y un inventario de secciones replanteado — sin romper funnel/tracking, SEO ni dark/light.

**Architecture:** Server-rendered hero (LCP) en `src/app/page.tsx` con islas cliente (mockup animado, demo button). El resto de la home se descompone desde el monolítico `HomeSections.tsx` (915 líneas) en componentes por sección bajo `src/components/landing/sections/`, orquestados por un `HomeSections.tsx` adelgazado que mantiene el estado de scroll y reusa los hooks de reveal existentes (extraídos a `src/components/landing/hooks/useScrollReveal.ts`).

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, TypeScript estricto, Vitest + React Testing Library, Umami analytics.

---

## Orden de secciones (embudo)

1. Hero split → 2. Privacidad → 3. Qué hace (capabilities) → 4. Guías → 5. Calculadora → 6. FAQ → 7. Apoyá el proyecto.

## File Structure

**Crear:**
- `src/components/landing/hooks/useScrollReveal.ts` — hooks `useSectionProgress` y `useSectionVisible` extraídos de `HomeSections.tsx` (reuso de la coreografía de scroll existente).
- `src/components/landing/mock-panel-data.ts` — datos mock deterministas para el mockup del hero (categoría, progreso, puntos del gráfico, filas de comprobantes).
- `src/components/landing/mock-panel-data.test.ts` — test de consistencia de los datos mock.
- `src/components/landing/PanelMockup.tsx` — componente cliente: render del panel en JSX (barra de categoría + mini-gráfico + filas), animado.
- `src/components/landing/sections/PrivacySection.tsx` — sección privacidad/confianza (3 pilares).
- `src/components/landing/sections/CapabilitiesSection.tsx` — "Qué hace": capacidades + multi-moneda fusionadas.
- `src/components/landing/sections/GuidesSection.tsx` — guías (pilar + lecturas cortas + ver todas). Incluye `MONOTRIBUTO_GUIDES`.
- `src/components/landing/sections/CalculatorSection.tsx` — CTA calculadora sin login.
- `src/components/landing/sections/FaqSection.tsx` — FAQ consumiendo `homeFaqEntries` (fuente única).
- `src/components/landing/sections/FaqSection.test.tsx` — test: renderiza todas las `homeFaqEntries`.
- `src/components/landing/sections/SupportSection.tsx` — donaciones/apoyo.

**Modificar:**
- `src/app/page.tsx` — nuevo hero split server-rendered + orden de secciones.
- `src/components/landing/HomeSections.tsx` — adelgazar a orquestador (estado scroll + montaje de secciones en el nuevo orden).

**Borrar:**
- `src/components/landing/FeaturesGrid.tsx` — reemplazado por `CapabilitiesSection`.

**No tocar:**
- `TrackedLandingCtaLink.tsx`, `HeroDemoButton.tsx`, `HeroParallax.tsx` (se reutilizan tal cual).
- `src/lib/seo/page-schemas.ts` (solo se consume `homeFaqEntries`).

## Invariantes que no se rompen (verificar al final)
- CTAs disparan `funnel_landing_cta` con `{ target: 'ingresar' | 'calculadora' }` vía `TrackedLandingCtaLink`.
- Demo button (`funnel_landing_demo_open` lo dispara internamente `HeroDemoButton`/contexto) sigue funcionando.
- JSON-LD del home (`getSchemasForPath('/')`) intacto; FAQ visible para el FAQ schema.
- Dark/light operativo.
- `NativeAd` al fondo.

---

### Task 1: Extraer hooks de scroll reveal

Reutilizamos la coreografía de scroll existente. Hoy `useSectionProgress` y `useSectionVisible` están embebidos en `HomeSections.tsx` (líneas ~131–186). Los movemos a un módulo compartido para que cada sección los consuma.

**Files:**
- Create: `src/components/landing/hooks/useScrollReveal.ts`
- Modify: `src/components/landing/HomeSections.tsx` (se hará en Task 11)

- [ ] **Step 1: Crear el módulo de hooks**

```ts
// src/components/landing/hooks/useScrollReveal.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Progreso de scroll (0..1) de una sección a medida que cruza el viewport.
 * Extraído de HomeSections para reuso entre las secciones de la landing.
 */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateProgress = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      const visibleStart = windowHeight;
      const visibleEnd = -sectionHeight;
      const currentPosition = rect.top;
      const totalRange = visibleStart - visibleEnd;
      const progressValue = (visibleStart - currentPosition) / totalRange;

      setProgress(Math.max(0, Math.min(1, progressValue)));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [ref]);

  return progress;
}

/**
 * True mientras la sección está intersectando el viewport (resetea al salir,
 * para animaciones repetibles). Extraído de HomeSections.
 */
export function useSectionVisible(ref: React.RefObject<HTMLElement | null>, threshold = 0.3) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isVisible;
}
```

- [ ] **Step 2: Typecheck**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck`
Expected: PASS (sin errores nuevos).

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/hooks/useScrollReveal.ts
git commit -m "refactor(landing): extraer hooks de scroll reveal a módulo compartido"
```

---

### Task 2: Datos mock del panel (con test)

El mockup del hero usa datos deterministas (no la fixture de 36 KB del demo). Definimos un módulo chico y testeamos su consistencia.

**Files:**
- Create: `src/components/landing/mock-panel-data.ts`
- Test: `src/components/landing/mock-panel-data.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/components/landing/mock-panel-data.test.ts
import { describe, expect, it } from "vitest";

import { MOCK_PANEL } from "./mock-panel-data";

describe("MOCK_PANEL", () => {
  it("expone una categoría de Monotributo válida (A–K)", () => {
    expect(MOCK_PANEL.categoria).toMatch(/^[A-K]$/);
  });

  it("tiene un progreso de tope entre 0 y 100", () => {
    expect(MOCK_PANEL.progresoTope).toBeGreaterThanOrEqual(0);
    expect(MOCK_PANEL.progresoTope).toBeLessThanOrEqual(100);
  });

  it("tiene al menos 6 puntos de gráfico acumulado, no decrecientes", () => {
    expect(MOCK_PANEL.acumulado.length).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < MOCK_PANEL.acumulado.length; i++) {
      expect(MOCK_PANEL.acumulado[i].total).toBeGreaterThanOrEqual(
        MOCK_PANEL.acumulado[i - 1].total,
      );
    }
  });

  it("tiene filas de comprobantes con monto positivo", () => {
    expect(MOCK_PANEL.comprobantes.length).toBeGreaterThan(0);
    for (const row of MOCK_PANEL.comprobantes) {
      expect(row.monto).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npx vitest run src/components/landing/mock-panel-data.test.ts`
Expected: FAIL — "Cannot find module './mock-panel-data'".

- [ ] **Step 3: Implementar los datos mock**

```ts
// src/components/landing/mock-panel-data.ts
/**
 * Datos deterministas para el mockup del panel en el hero de la landing.
 * NO es la fixture del demo (esa pesa ~36 KB y se carga sólo al clickear "Ver demo").
 * Estos son números chicos, on-brand, pensados para verse bien en el mockup.
 */

export interface MockChartPoint {
  mes: string;
  total: number; // acumulado anual en ARS
}

export interface MockInvoiceRow {
  fecha: string; // dd/mm
  detalle: string;
  moneda: "ARS" | "USD";
  monto: number; // en ARS equivalente
}

export interface MockPanel {
  categoria: string; // A..K
  topeAnual: number;
  acumuladoAnual: number;
  progresoTope: number; // 0..100
  acumulado: readonly MockChartPoint[];
  comprobantes: readonly MockInvoiceRow[];
}

const TOPE_G = 44_000_000;
const ACUMULADO = 31_240_000;

export const MOCK_PANEL: MockPanel = {
  categoria: "G",
  topeAnual: TOPE_G,
  acumuladoAnual: ACUMULADO,
  progresoTope: Math.round((ACUMULADO / TOPE_G) * 100),
  acumulado: [
    { mes: "Ene", total: 3_800_000 },
    { mes: "Feb", total: 8_100_000 },
    { mes: "Mar", total: 12_600_000 },
    { mes: "Abr", total: 17_900_000 },
    { mes: "May", total: 23_400_000 },
    { mes: "Jun", total: 27_700_000 },
    { mes: "Jul", total: 31_240_000 },
  ],
  comprobantes: [
    { fecha: "08/07", detalle: "Factura E · Servicios", moneda: "USD", monto: 1_240_000 },
    { fecha: "03/07", detalle: "Factura C · Consultoría", moneda: "ARS", monto: 680_000 },
    { fecha: "28/06", detalle: "Factura E · Desarrollo", moneda: "USD", monto: 2_010_000 },
  ],
};
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npx vitest run src/components/landing/mock-panel-data.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/mock-panel-data.ts src/components/landing/mock-panel-data.test.ts
git commit -m "feat(landing): datos mock deterministas para el mockup del hero"
```

---

### Task 3: PanelMockup (mockup del panel en JSX)

Componente cliente que dibuja una versión miniatura/estilizada del panel: header de empresa, barra de progreso de categoría, mini-gráfico de barras del acumulado y filas de comprobantes. On-brand, themeable, con una animación sutil de entrada de la barra. Esto es lo que va a la derecha del hero.

**Files:**
- Create: `src/components/landing/PanelMockup.tsx`

- [ ] **Step 1: Implementar el componente**

```tsx
// src/components/landing/PanelMockup.tsx
"use client";

import { useEffect, useState } from "react";

import { MOCK_PANEL } from "@/components/landing/mock-panel-data";

const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/**
 * Mockup estilizado del panel de GARCA para el hero de la landing.
 * No es interactivo: comunica "esto es lo que vas a ver" con datos mock.
 */
export function PanelMockup() {
  const [animated, setAnimated] = useState(false);
  const maxTotal = MOCK_PANEL.acumulado[MOCK_PANEL.acumulado.length - 1].total;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-border bg-white/90 dark:bg-muted/70 backdrop-blur-sm shadow-2xl shadow-primary/10 p-5 md:p-6"
      aria-hidden
    >
      {/* Header empresa */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tecnología Innovadora SRL</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Panel · 2026</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800/60">
          Categoría {MOCK_PANEL.categoria}
        </span>
      </div>

      {/* Barra de progreso de tope */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Tope anual</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {ARS.format(MOCK_PANEL.acumuladoAnual)} / {ARS.format(MOCK_PANEL.topeAnual)}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-[width] duration-1000 ease-out"
            style={{ width: animated ? `${MOCK_PANEL.progresoTope}%` : "0%" }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          {MOCK_PANEL.progresoTope}% del tope · margen para no recategorizar
        </p>
      </div>

      {/* Mini-gráfico de barras del acumulado */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Ingresos acumulados</p>
        <div className="flex items-end gap-1.5 h-20">
          {MOCK_PANEL.acumulado.map((p, i) => (
            <div key={p.mes} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-cyan-400/70 transition-[height] duration-700 ease-out"
                style={{
                  height: animated ? `${(p.total / maxTotal) * 100}%` : "0%",
                  transitionDelay: `${i * 60}ms`,
                }}
              />
              <span className="text-[9px] text-slate-400">{p.mes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filas de comprobantes */}
      <div className="space-y-2">
        {MOCK_PANEL.comprobantes.map((row) => (
          <div
            key={`${row.fecha}-${row.detalle}`}
            className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-mono text-slate-400 shrink-0">{row.fecha}</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{row.detalle}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-semibold text-slate-400">{row.moneda}</span>
              <span className="text-xs font-medium text-slate-900 dark:text-white">{ARS.format(row.monto)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/PanelMockup.tsx
git commit -m "feat(landing): PanelMockup (mockup del panel en JSX para el hero)"
```

---

### Task 4: Hero split en page.tsx

Reemplazar el hero centrado por un split: izquierda copy + 2 CTAs (igual peso) + badge de privacidad; derecha `PanelMockup`. Mantener server-rendering del contenido (LCP) y las islas cliente (`HeroParallax`, `HeroDemoButton`, `TrackedLandingCtaLink`, `PanelMockup`). El badge de privacidad es visible sin scroll.

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Reescribir el hero (sección hero de page.tsx)**

Reemplazar el `<section>` del hero (líneas ~19–101 del archivo actual) por:

```tsx
      {/* ========== HERO SECTION (server-rendered HTML) ========== */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <HeroParallax>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Columna izquierda: copy + CTAs + privacidad */}
            <div className="text-center lg:text-left">
              <div className="relative inline-block mb-6 animate-hero-entry">
                <Image
                  src="/logo-full.svg"
                  alt="GARCA - Gestor Automático de Recuperación de Comprobantes de ARCA"
                  width={96}
                  height={96}
                  priority
                  className="relative h-16 w-16 md:h-20 md:w-20"
                />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white animate-hero-entry-1">
                Tus comprobantes de ARCA, claros en segundos
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed animate-hero-entry-3">
                Visualizá tu facturación, calculá tu categoría de Monotributo 2026 y planificá para
                no pasarte de tope. <span className="font-semibold text-slate-700 dark:text-slate-300">Simple, privado y gratis.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-6 animate-hero-entry-4">
                <TrackedLandingCtaLink
                  href="/calculadora-monotributo"
                  target="calculadora"
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative">Probar la calculadora</span>
                  <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
                </TrackedLandingCtaLink>

                <TrackedLandingCtaLink
                  href="/ingresar"
                  target="ingresar"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-border bg-white/80 dark:bg-white/5 backdrop-blur-sm px-7 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <span>Ingresar con ARCA</span>
                  <ArrowRightIcon className="group-hover:translate-x-1 transition-transform duration-300" />
                </TrackedLandingCtaLink>
              </div>

              {/* Señal de privacidad (visible sin scroll) */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-medium text-emerald-700 dark:text-emerald-300 animate-hero-entry-5">
                <ShieldCheckIcon />
                <span>100% en tu navegador · credenciales cifradas AES-256 · nada se guarda</span>
              </div>

              <div className="mt-5 animate-hero-entry-5">
                <HeroDemoButton />
              </div>
            </div>

            {/* Columna derecha: mockup del panel */}
            <div className="flex justify-center lg:justify-end animate-hero-entry-3">
              <PanelMockup />
            </div>
          </div>
        </HeroParallax>
      </section>
```

- [ ] **Step 2: Actualizar imports de page.tsx**

En el bloque de imports de `src/app/page.tsx`, asegurar (agregar los que falten, quitar `SparklesIcon` si queda sin uso):

```tsx
import Image from "next/image";

import { NativeAd } from "@/components/ads/NativeAd";
import { HeroDemoButton } from "@/components/landing/HeroDemoButton";
import { HeroParallax } from "@/components/landing/HeroParallax";
import { HomeSections } from "@/components/landing/HomeSections";
import { PanelMockup } from "@/components/landing/PanelMockup";
import { TrackedLandingCtaLink } from "@/components/landing/TrackedLandingCtaLink";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/ui/icons";
```

Nota: si después de la reescritura `Link` ya no se usa en `page.tsx` (la nav de links rápidos se movió/quitó), quitar su import para que el lint no falle. Verificar en el Step 3.

- [ ] **Step 3: Typecheck + lint**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck && npm run lint`
Expected: PASS. Si lint marca import sin usar (`Link`, `SparklesIcon`), eliminarlo y re-correr.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(landing): hero split (copy + CTAs + privacidad + mockup del panel)"
```

---

### Task 5: PrivacySection

Sección dedicada al diferenciador. 3 pilares en cards: cifrado AES-256 client-side · sin base de datos · open source. Usa los hooks de reveal extraídos.

**Files:**
- Create: `src/components/landing/sections/PrivacySection.tsx`

- [ ] **Step 1: Implementar la sección**

```tsx
// src/components/landing/sections/PrivacySection.tsx
"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { GitHubIcon, LockIcon, ShieldCheckIcon } from "@/components/ui/icons";

const PILLARS = [
  {
    icon: <LockIcon />,
    title: "Cifrado en tu navegador",
    body: "Tus credenciales de ARCA se cifran con AES-256 antes de salir de tu equipo. Se usan sólo para la consulta y se descartan al terminar.",
  },
  {
    icon: <ShieldCheckIcon />,
    title: "Sin base de datos",
    body: "No guardamos credenciales ni comprobantes en ningún servidor. Tus datos viven sólo en tu navegador (localStorage) y los borrás cuando quieras.",
  },
  {
    icon: <GitHubIcon className="h-6 w-6" />,
    title: "Open source",
    body: "Todo el código es público y auditable en GitHub. No tenés que confiar: podés revisar exactamente qué hace GARCA con tus datos.",
  },
];

export function PrivacySection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.25);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden bg-background">
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
            <ShieldCheckIcon />
            Privacidad por diseño
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Tus datos no salen de tu navegador
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            GARCA está construido para que no tengas que confiar ciegamente. Esto es lo que lo hace
            distinto de cualquier planilla o servicio que guarda tu información.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-muted/60 p-6 transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 text-white shadow-lg shadow-emerald-500/25">
                {p.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{p.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/sections/PrivacySection.tsx
git commit -m "feat(landing): sección de privacidad/confianza (3 pilares)"
```

---

### Task 6: CapabilitiesSection ("Qué hace")

Fusiona las 6 capacidades + multi-moneda en una narrativa agrupada. Reusa los iconos de `landing-icons`. Conserva la mecánica de "card que aparece" pero simplificada con `useSectionVisible` (sin el sistema de "card que se prende" por scrollY, que era lo más "demo IA"). Incluye una fila de chips de monedas (absorbe la sección multi-moneda).

**Files:**
- Create: `src/components/landing/sections/CapabilitiesSection.tsx`

- [ ] **Step 1: Implementar la sección**

```tsx
// src/components/landing/sections/CapabilitiesSection.tsx
"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { SparklesIcon } from "@/components/ui/icons";
import {
  CalculatorIcon,
  ChartIcon,
  ClipboardIcon,
  DocumentIcon,
  DownloadIcon,
  TrendingIcon,
} from "@/components/ui/landing-icons";

const CAPABILITIES = [
  {
    icon: <DocumentIcon />,
    title: "Recuperación automática",
    body: "Traé todas tus facturas de ARCA, con tipo de cambio incluido en la exportación.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <ChartIcon />,
    title: "Análisis visual",
    body: "Gráficos de ingresos, progreso de Monotributo y distribución por moneda.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: <ClipboardIcon />,
    title: "Tu categoría, al instante",
    body: "Sabé en qué categoría estás y cuánto te falta para la siguiente.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: <CalculatorIcon />,
    title: "Proyección inteligente",
    body: "Calculá cuánto podés facturar para mantenerte en tu categoría objetivo.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: <TrendingIcon />,
    title: "Multi-moneda",
    body: "ARS, USD, EUR y más, con conversión ponderada a pesos.",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: <DownloadIcon />,
    title: "Exportación completa",
    body: "PDF profesional para tu contador, CSV para Excel o JSON.",
    gradient: "from-sky-500 to-indigo-500",
  },
];

const CURRENCIES = ["ARS", "USD", "EUR", "JPY", "BRL"];

export function CapabilitiesSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.15);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-blue-500/25">
            <SparklesIcon />
            Qué hace GARCA
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            De comprobantes dispersos a una foto clara
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Todo lo que necesitás para entender tu facturación y planificar tu año de Monotributo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CAPABILITIES.map((c, i) => (
            <div
              key={c.title}
              className="group rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-muted/60 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transitionDelay: `${i * 70}ms`,
              }}
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {c.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{c.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Chips de monedas (absorbe la sección multi-moneda) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Soporta:</span>
          {CURRENCIES.map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-full border border-slate-200 dark:border-border bg-white/70 dark:bg-white/5 px-4 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              {c}
            </span>
          ))}
          <span className="text-sm text-slate-500 dark:text-slate-400">y más…</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/sections/CapabilitiesSection.tsx
git commit -m "feat(landing): sección de capacidades (fusiona features + multi-moneda)"
```

---

### Task 7: GuidesSection

Guías con peso: card de la guía pilar + lista de lecturas cortas + "ver todas". Mueve `MONOTRIBUTO_GUIDES` (hoy en `HomeSections.tsx`) acá. Reusa `useSectionVisible`.

**Files:**
- Create: `src/components/landing/sections/GuidesSection.tsx`

- [ ] **Step 1: Implementar la sección**

```tsx
// src/components/landing/sections/GuidesSection.tsx
"use client";

import Link from "next/link";
import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { ArrowRightIcon } from "@/components/ui/icons";

const MONOTRIBUTO_GUIDES = [
  {
    href: "/monotributo/recategorizacion",
    category: "Trámite",
    title: "Recategorización paso a paso",
    description: "Cuándo corresponde, qué mira ARCA y qué pasa si no la hacés en enero o julio.",
    readingTime: "5 min de lectura",
    accent: "from-indigo-500 to-blue-500",
    accentText: "text-indigo-700 dark:text-indigo-300",
    chip: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-200 ring-indigo-200 dark:ring-indigo-800/60",
  },
  {
    href: "/monotributo/vs-responsable-inscripto",
    category: "Comparativa",
    title: "Monotributo vs Responsable Inscripto",
    description: "IVA, Ganancias, obligaciones formales y cuándo conviene dar el salto de régimen.",
    readingTime: "7 min de lectura",
    accent: "from-teal-500 to-cyan-500",
    accentText: "text-teal-700 dark:text-teal-300",
    chip: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-200 ring-teal-200 dark:ring-teal-800/60",
  },
  {
    href: "/monotributo/que-pasa-si-me-paso",
    category: "Caso límite",
    title: "¿Qué pasa si me paso del tope?",
    description: "Recategorización de oficio, exclusión del régimen y cómo volver si ya te excluyeron.",
    readingTime: "6 min de lectura",
    accent: "from-amber-500 to-orange-500",
    accentText: "text-amber-700 dark:text-amber-300",
    chip: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-200 ring-amber-200 dark:ring-amber-800/60",
  },
];

export function GuidesSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.15);

  return (
    <section ref={ref} id="monotributo-guias" className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-indigo-500/25">
            Guías y recursos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Todo sobre Monotributo 2026
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Artículos para entender el régimen, planificar tu año y resolver las dudas más comunes.
            Datos tomados directo de ARCA y actualizados cada semestre.
          </p>
        </div>

        {/* Guía pilar */}
        <Link
          href="/monotributo"
          className="group relative overflow-hidden block rounded-3xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 p-6 md:p-8 mb-8 hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-0.5 transition-all"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out, box-shadow 300ms ease-out",
          }}
        >
          <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 mb-3">
                Fundamentos
              </span>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                Monotributo 2026: categorías, cuotas y topes
              </h3>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                La referencia completa: las 11 categorías de la A a la K con cuotas mensuales, topes
                anuales y desglose de aportes. Datos oficiales de ARCA.
              </p>
            </div>
            <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-all shrink-0 self-start md:self-center whitespace-nowrap">
              Abrir guía completa
              <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Lecturas cortas */}
        <ol className="flex flex-col gap-3 mb-8">
          {MONOTRIBUTO_GUIDES.map((guide, index) => (
            <li
              key={guide.href}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: `${150 + index * 90}ms`,
              }}
            >
              <Link
                href={guide.href}
                className="group flex items-stretch gap-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 sm:px-6 py-5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.05] transition-colors"
              >
                <div className={`w-1 rounded-full bg-gradient-to-b ${guide.accent}`} aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${guide.chip}`}>
                      {guide.category}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{guide.readingTime}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug">{guide.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{guide.description}</p>
                </div>
                <span className={`self-center text-xs font-semibold ${guide.accentText} inline-flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform`}>
                  Leer
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="text-center">
          <Link
            href="/guias"
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-white/70 dark:bg-white/5 px-6 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105 transition-all"
          >
            Ver todas las guías
            <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/sections/GuidesSection.tsx
git commit -m "feat(landing): sección de guías con más peso (pilar + lecturas cortas)"
```

---

### Task 8: CalculatorSection

CTA fuerte a la calculadora sin login. Conserva el `TrackedLandingCtaLink` con `target="calculadora"`.

**Files:**
- Create: `src/components/landing/sections/CalculatorSection.tsx`

- [ ] **Step 1: Implementar la sección**

```tsx
// src/components/landing/sections/CalculatorSection.tsx
"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { TrackedLandingCtaLink } from "@/components/landing/TrackedLandingCtaLink";
import { ArrowRightIcon } from "@/components/ui/icons";

const FEATURES = [
  "Tabla de categorías actualizada",
  "Cuota mensual por actividad",
  "Proyección inteligente",
];

export function CalculatorSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.3);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-8 md:p-10 overflow-hidden shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" aria-hidden />
          <div className="relative text-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-blue-500/25 transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
            >
              Herramienta gratuita
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Calculadora de Monotributo 2026
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Ingresá tu facturación mes a mes y descubrí en qué categoría vas a quedar. Planificá
              cuánto podés facturar para no pasarte.{" "}
              <strong className="text-slate-800 dark:text-slate-200">Sin login, sin registrarte.</strong>
            </p>
            <div
              className="flex items-center justify-center transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transitionDelay: "200ms" }}
            >
              <TrackedLandingCtaLink
                href="/calculadora-monotributo"
                target="calculadora"
                className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">Abrir calculadora</span>
                <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
              </TrackedLandingCtaLink>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              {FEATURES.map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/sections/CalculatorSection.tsx
git commit -m "feat(landing): sección CTA calculadora (sin login)"
```

---

### Task 9: FaqSection (consume homeFaqEntries)

FAQ acordeón consumiendo `homeFaqEntries` de `page-schemas.ts` (fuente única del FAQ schema). Esto elimina el `FAQ_ITEMS` duplicado de `HomeSections.tsx`. Con test que verifica que se renderizan todas las entradas.

**Files:**
- Create: `src/components/landing/sections/FaqSection.tsx`
- Test: `src/components/landing/sections/FaqSection.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/landing/sections/FaqSection.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FaqSection } from "./FaqSection";
import { homeFaqEntries } from "@/lib/seo/page-schemas";

describe("FaqSection", () => {
  it("renderiza una pregunta por cada entrada de homeFaqEntries", () => {
    render(<FaqSection />);
    for (const entry of homeFaqEntries) {
      expect(screen.getByText(entry.question)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npx vitest run src/components/landing/sections/FaqSection.test.tsx`
Expected: FAIL — "Cannot find module './FaqSection'".

- [ ] **Step 3: Implementar la sección**

```tsx
// src/components/landing/sections/FaqSection.tsx
"use client";

import { useRef, useState } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { homeFaqEntries } from "@/lib/seo/page-schemas";

export function FaqSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.15);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section ref={ref} id="faq" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium mb-4">
            Preguntas frecuentes
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">¿Tenés dudas?</h2>
        </div>

        <div className="space-y-4">
          {homeFaqEntries.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <span>{faq.question}</span>
                  <span
                    className="shrink-0 text-slate-400 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npx vitest run src/components/landing/sections/FaqSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/sections/FaqSection.tsx src/components/landing/sections/FaqSection.test.tsx
git commit -m "feat(landing): FAQ section consumiendo homeFaqEntries (fuente única)"
```

---

### Task 10: SupportSection

Donaciones/apoyo, más discreto y abajo. Mueve el bloque de soporte (GitHub Sponsors / PayPal / BMC / star) desde `HomeSections.tsx`. Reusa `useSectionVisible`.

**Files:**
- Create: `src/components/landing/sections/SupportSection.tsx`

- [ ] **Step 1: Implementar la sección**

```tsx
// src/components/landing/sections/SupportSection.tsx
"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { GitHubSponsorsIcon, PayPalIcon } from "@/components/ui/icons";

export function SupportSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.3);

  return (
    <section ref={ref} className="relative py-20 md:py-24 overflow-hidden">
      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-amber-500/25">
          Open Source
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">Apoyá el proyecto</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          GARCA es gratis y open source. Si te ahorra tiempo, considerá apoyar el desarrollo.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
        >
          <a
            href="https://github.com/sponsors/FacundoMalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ea4aaa] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#ea4aaa]/20 hover:shadow-2xl hover:shadow-[#ea4aaa]/40 transition-all duration-300 hover:scale-105"
          >
            <GitHubSponsorsIcon className="h-5 w-5" />
            Sponsor
          </a>
          <a
            href="https://paypal.me/facundomalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0070ba] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#0070ba]/20 hover:shadow-2xl hover:shadow-[#0070ba]/40 transition-all duration-300 hover:scale-105"
          >
            <PayPalIcon className="h-5 w-5" />
            PayPal
          </a>
          <a
            href="https://buymeacoffee.com/facundo.malgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFDD00] px-6 py-4 text-sm font-semibold text-black shadow-xl shadow-[#FFDD00]/20 hover:shadow-2xl hover:shadow-[#FFDD00]/40 transition-all duration-300 hover:scale-105"
          >
            <img src="/icons/bmc-logo.svg" alt="BMC" className="h-5 w-5" />
            Buy me a coffee
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-600 dark:text-slate-400">
          También podés dejar una ⭐ en{" "}
          <a
            href="https://github.com/FacundoMalgieri/garca"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/sections/SupportSection.tsx
git commit -m "feat(landing): sección de apoyo (donaciones), más discreta"
```

---

### Task 11: Adelgazar HomeSections (orquestador) + borrar FeaturesGrid

`HomeSections.tsx` queda como orquestador delgado que monta las secciones en el nuevo orden. Las animaciones por-scrollY del monolito se reemplazan por el reveal por-sección que cada componente ya maneja con `useSectionVisible`. Borrar `FeaturesGrid.tsx`.

**Files:**
- Modify: `src/components/landing/HomeSections.tsx`
- Delete: `src/components/landing/FeaturesGrid.tsx`

- [ ] **Step 1: Reescribir HomeSections.tsx completo**

```tsx
// src/components/landing/HomeSections.tsx
import { CalculatorSection } from "@/components/landing/sections/CalculatorSection";
import { CapabilitiesSection } from "@/components/landing/sections/CapabilitiesSection";
import { FaqSection } from "@/components/landing/sections/FaqSection";
import { GuidesSection } from "@/components/landing/sections/GuidesSection";
import { PrivacySection } from "@/components/landing/sections/PrivacySection";
import { SupportSection } from "@/components/landing/sections/SupportSection";

/**
 * Orquestador de las secciones below-the-fold de la landing, en orden de embudo:
 * privacidad → capacidades → guías → calculadora → FAQ → apoyo.
 * Cada sección maneja su propio reveal con useSectionVisible.
 */
export function HomeSections() {
  return (
    <>
      <PrivacySection />
      <CapabilitiesSection />
      <GuidesSection />
      <CalculatorSection />
      <FaqSection />
      <SupportSection />
    </>
  );
}
```

- [ ] **Step 2: Borrar FeaturesGrid**

Run: `git rm src/components/landing/FeaturesGrid.tsx`
Expected: archivo eliminado del índice.

- [ ] **Step 3: Verificar que no quedan referencias a FeaturesGrid ni a FAQ_ITEMS/MONOTRIBUTO_GUIDES viejos**

Run: `grep -rn "FeaturesGrid\|FAQ_ITEMS" src/ || echo "sin referencias"`
Expected: "sin referencias" (o sólo coincidencias dentro de archivos ya borrados, ninguna).

- [ ] **Step 4: Typecheck + lint**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/HomeSections.tsx
git commit -m "refactor(landing): HomeSections como orquestador + borrar FeaturesGrid"
```

---

### Task 12: Verificación final (build + tests + manual)

**Files:** ninguno (verificación).

- [ ] **Step 1: Build de producción**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm run build`
Expected: build OK, sin errores de tipos ni de SSR de la home.

- [ ] **Step 2: Suite de tests**

Run: `export NODE_OPTIONS="--max-old-space-size=4096" && npm test`
Expected: PASS (incluye `mock-panel-data.test.ts` y `FaqSection.test.tsx`).

- [ ] **Step 3: Verificación manual en dev**

Run: `npm run dev` y abrir `http://localhost:3000`.
Checklist visual/funcional:
- Hero split: copy + 2 CTAs + badge de privacidad a la izquierda, `PanelMockup` a la derecha (barra animada, mini-gráfico, filas). En mobile el mockup baja debajo del copy.
- Orden de secciones: privacidad → capacidades → guías → calculadora → FAQ → apoyo.
- CTA "Probar la calculadora" → `/calculadora-monotributo`; "Ingresar con ARCA" → `/ingresar`; ambos disparan `funnel_landing_cta` (verificar en Network/console que `umami.track` se invoca con el `target` correcto, o con Umami real).
- "Ver demo" sigue cargando el panel (`/panel`).
- FAQ abre/cierra; muestra las 13 preguntas.
- Toggle dark/light: ninguna sección queda con fondo plano roto ni texto ilegible.
- `NativeAd` al fondo (en localhost el iframe tira CSP — ignorar, es dev-only).

- [ ] **Step 4: Verificar JSON-LD de la home intacto**

Run: `grep -n "case \"/\":" src/lib/seo/page-schemas.ts`
Expected: la línea sigue devolviendo `homeBreadcrumbSchema, homeWebPageSchema, buildFaqSchema(homeFaqEntries)` — no se tocó. Confirmar en el HTML servido que el `<script type="application/ld+json">` del FAQ está presente.

- [ ] **Step 5: Commit final (si hubo ajustes del manual)**

```bash
git add -A
git commit -m "fix(landing): ajustes del pase de verificación manual"
```

---

## Self-Review (cobertura del spec)

- Hero split (copy + CTAs iguales + privacidad + mockup JSX) → Tasks 3, 4. ✔
- Privacidad como sección propia → Task 5. ✔
- Qué hace + multi-moneda fusionadas → Task 6. ✔
- Guías con peso, antes de calculadora → Tasks 7 (guías) y 8 (calculadora), orden en Task 11. ✔
- FAQ repintada, single source of truth → Task 9. ✔
- Apoyá el proyecto, discreto y abajo → Task 10. ✔
- Reusar coreografía de scroll (hooks) → Task 1. ✔
- Funnel/tracking intacto → Tasks 4, 8 (TrackedLandingCtaLink); verificación en Task 12. ✔
- SEO/JSON-LD intacto → Task 9 (consume homeFaqEntries), verificación Task 12 Step 4. ✔
- Dark/light → verificación Task 12 Step 3. ✔
- Descomponer HomeSections (915 líneas) → Tasks 5–11. ✔
- Colores actuales (no overhaul) → se mantiene la paleta existente en todos los scaffolds. ✔
