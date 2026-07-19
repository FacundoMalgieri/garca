# Facturador — Plan 2: Backend de emisión (Playwright/RCEL + API routes)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> ✅ **ESTADO: COMPLETADO** (pura + steps Playwright + orquestador + rutas). **Fase 1 (preview) verificada en vivo** contra RCEL real; parsers ajustados al HTML real. Pendiente sólo la verificación de `confirm`/`downloadPdf`/`consultarEmitidas` (requiere UNA emisión real). Ver `docs/superpowers/facturador-PROGRESO.md`.

**Goal:** Emitir Factura C real sobre RCEL manejando el formulario con Playwright, exponiendo API routes, con máximo de lógica pura testeable y la conducción del navegador aislada y verificada a mano vía pre-comprobantes.

**Architecture:** Se separa en dos capas: (1) **lógica pura** (builder de instrucciones de llenado, redondeo monetario, parsers de Resumen y de Consulta) — 100% unit-testeable; (2) **conducción Playwright** (steps que ejecutan el plan de llenado sobre RCEL) + **API routes** — verificadas manualmente porque tocan AFIP real (no hay homologación en RCEL). Reusa la infra del scraper existente (`src/lib/scrapers/afip/`: login, browser, eventos, streaming).

**Tech Stack:** TypeScript estricto, Playwright, Next.js App Router (route handlers), Vitest (solo para la capa pura).

**Depende de:** Plan 1 (tipos y helpers en `src/types/facturador.ts` y `src/lib/facturador/`).

**Spec de referencia:** `docs/superpowers/specs/2026-07-03-facturador-design.md` (§6 flujo, §7 mapeo RCEL, §12 backend, §13 testing).

**Design inputs del review de Opus (incorporados abajo):**
1. Contrato de redondeo a 2 decimales para importes → Task 1 (`money.ts`) + usado en el builder.
2. Validación de `lineas` no vacías/no en blanco → Task 2 (extiende `validation.ts` del Plan 1).
3. Relajar `emittedByGarca` a `boolean` en el tipo almacenado → Task 3.

---

## Restricciones críticas de RCEL (verificadas en vivo, spec §7)

- **No deep-link:** navegar por CLICKS desde el portal → "Comprobantes en línea" → seleccionar empresa → menú. Las URLs `.do` directas dan 403 y navegar por URL rompe la sesión.
- **No inyectar `value` por JS:** RCEL valida en submit y descarta valores no ingresados con eventos reales. Usar `selectOption`, `fill`/`type`, `check`, y disparar los `change`/`keypress` que RCEL espera.
- **Lookup de receptor:** orden estricto en pantalla 2 → seleccionar Condición IVA (repuebla tipo doc) → seleccionar Tipo Doc → escribir Nro → Enter/`change` → esperar `#razonsocialreceptor` con valor → elegir Domicilio (obligatorio para RI) → marcar condición de venta.
- **RCEL es solo producción:** testear vía **pre-comprobantes** (borradores, sin CAE) o frenando antes de "Confirmar Datos...".

## File Structure

Lógica pura (testeable):
- `src/lib/facturador/money.ts` — redondeo a 2 decimales.
- `src/lib/facturador/fill-plan.ts` — `buildFillPlan(plantilla)` → estructura declarativa de acciones (selector, tipo de acción, valor) para las pantallas 0-3. Pura.
- `src/lib/facturador/resumen-parser.ts` — parsea el HTML/estructura del Resumen (pantalla 4) → objeto preview.
- `src/lib/facturador/consulta-parser.ts` — parsea la tabla de "Consulta de comprobantes" → `AFIPInvoice[]`.

Conducción Playwright (verificación manual):
- `src/lib/scrapers/afip/steps/emission/navigate.ts` — abre RCEL por clicks hasta "Generar Comprobantes".
- `src/lib/scrapers/afip/steps/emission/fill.ts` — ejecuta un fill-plan sobre las pantallas 0-3 usando eventos reales; llega al Resumen.
- `src/lib/scrapers/afip/steps/emission/preview.ts` — captura el Resumen (HTML + screenshot).
- `src/lib/scrapers/afip/steps/emission/confirm.ts` — click "Confirmar Datos..." → extrae CAE/número → descarga PDF.
- `src/lib/scrapers/afip/steps/emission/consulta.ts` — corre la Consulta y devuelve emitidas.
- `src/lib/scrapers/afip/emit.ts` — orquesta login + navigate + fill + preview (fase 1) y confirm (fase 2), con eventos/streaming.

API routes:
- `src/app/api/arca/emit/route.ts` (+ `stream/route.ts`) — fase 1 (preview, no emite).
- `src/app/api/arca/emit/confirm/route.ts` (+ `stream`) — fase 2 (confirma).
- `src/app/api/arca/emitted/route.ts` — consulta de emitidas.

Ajustes:
- `src/lib/facturador/validation.ts` — validación de líneas (Task 2).
- `src/types/facturador.ts` — tipo almacenado (Task 3) + tipos de preview/resultado (Task 4).

---

## Task 1: Redondeo monetario (money.ts)

**Files:**
- Create: `src/lib/facturador/money.ts`
- Test: `src/lib/facturador/money.test.ts`

Contexto: RCEL recalcula server-side; los importes deben ir redondeados a 2 decimales para que el preview coincida con el CAE. (Design input #1 de Opus.)

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/money.test.ts
import { describe, it, expect } from "vitest";
import { round2, lineSubtotal } from "@/lib/facturador/money";

describe("money", () => {
  it("round2 redondea a 2 decimales (half-up)", () => {
    expect(round2(53.973)).toBe(53.97);
    expect(round2(53.975)).toBe(53.98);
    expect(round2(3500000)).toBe(3500000);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });

  it("lineSubtotal aplica cantidad, precio y bonificación, redondeado", () => {
    expect(lineSubtotal({ cantidad: 3, precioUnitario: 19.99, bonificacion: 10 })).toBe(53.97);
    expect(lineSubtotal({ cantidad: 1, precioUnitario: 3500000 })).toBe(3500000);
    expect(lineSubtotal({ cantidad: 2, precioUnitario: 100, bonificacion: 0 })).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/money.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/money.ts

/** Redondea a 2 decimales con half-up estable (evita errores binarios de coma flotante). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Subtotal de una línea: precio × cantidad − bonificación%, redondeado a 2 decimales. */
export function lineSubtotal(l: { cantidad: number; precioUnitario: number; bonificacion?: number }): number {
  const bruto = l.precioUnitario * l.cantidad;
  const bonif = bruto * ((l.bonificacion ?? 0) / 100);
  return round2(bruto - bonif);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/money.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/money.ts src/lib/facturador/money.test.ts
git commit -m "feat(facturador): redondeo monetario a 2 decimales"
```

---

## Task 2: Validación de líneas (extiende validation.ts)

**Files:**
- Modify: `src/lib/facturador/validation.ts`
- Modify: `src/lib/facturador/validation.test.ts`

Contexto: Design input #2 de Opus — validar que haya al menos una línea con descripción no vacía. Además, migrar `totalImporte` a usar `lineSubtotal` (redondeo consistente con Task 1).

- [ ] **Step 1: Add failing tests**

Agregar estos casos al `describe("validateEmissionInput")` existente en `src/lib/facturador/validation.test.ts`:

```typescript
  it("rechaza cuando no hay líneas", () => {
    const bad = { ...base, lineas: [] };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("El comprobante debe tener al menos una línea");
  });

  it("rechaza líneas con descripción en blanco", () => {
    const bad = { ...base, lineas: [{ descripcion: "   ", cantidad: 1, unidad: "7", precioUnitario: 3500000 }] };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("Todas las líneas deben tener descripción");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/facturador/validation.test.ts`
Expected: FAIL en los 2 casos nuevos (los mensajes no se emiten aún).

- [ ] **Step 3: Update the implementation**

En `src/lib/facturador/validation.ts`:

1. Reemplazar la importación y el cuerpo de `totalImporte` para reutilizar el redondeo:

```typescript
import { lineSubtotal } from "@/lib/facturador/money";
```

```typescript
/** Suma total de las líneas, cada una redondeada a 2 decimales. */
export function totalImporte(p: Plantilla): number {
  return round2(p.lineas.reduce((acc, l) => acc + lineSubtotal(l), 0));
}
```

(importar también `round2` desde `@/lib/facturador/money`).

2. En `validateEmissionInput`, ANTES del chequeo de `totalImporte`, agregar:

```typescript
  if (p.lineas.length === 0) {
    errors.push("El comprobante debe tener al menos una línea");
  } else if (p.lineas.some((l) => l.descripcion.trim() === "")) {
    errors.push("Todas las líneas deben tener descripción");
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/facturador/validation.test.ts`
Expected: PASS (todos, incluidos los previos).

- [ ] **Step 5: Full pure suite + gates**

Run: `npx vitest run src/lib/facturador && npm run typecheck && npm run lint`
Expected: verde.

- [ ] **Step 6: Commit**

```bash
git add src/lib/facturador/validation.ts src/lib/facturador/validation.test.ts
git commit -m "feat(facturador): validar líneas no vacías + redondeo consistente en total"
```

---

## Task 3: Tipo almacenado con emittedByGarca boolean

**Files:**
- Modify: `src/types/facturador.ts`
- Modify: `src/types/facturador.test.ts`

Contexto: Design input #3 de Opus — leer de localStorage devuelve `boolean`, no el literal `true`. Se introduce `StoredInvoice` (boolean) y `EmittedInvoice` sigue siendo el literal para el retorno del constructor.

- [ ] **Step 1: Add failing test**

Agregar a `src/types/facturador.test.ts`:

```typescript
import type { StoredInvoice } from "@/types/facturador";

it("StoredInvoice acepta emittedByGarca boolean (round-trip localStorage)", () => {
  const raw: Pick<StoredInvoice, "emittedByGarca"> = { emittedByGarca: false };
  expect(raw.emittedByGarca).toBe(false);
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run src/types/facturador.test.ts`
Expected: FAIL en typecheck del nuevo import (o al correr con tsc). Ejecutar `npm run typecheck` para ver el error `StoredInvoice` inexistente.

- [ ] **Step 3: Update types**

En `src/types/facturador.ts`, reemplazar el bloque de `EmittedInvoice` por:

```typescript
/**
 * Factura conocida por GARCA con marca de origen. `emittedByGarca` es boolean para
 * tolerar el round-trip por localStorage (JSON.parse no preserva literales).
 */
export interface StoredInvoice extends AFIPInvoice {
  emittedByGarca: boolean;
}

/** Retorno del constructor de emisión: garantiza que fue emitida por GARCA. */
export interface EmittedInvoice extends AFIPInvoice {
  emittedByGarca: true;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/types/facturador.test.ts && npm run typecheck`
Expected: PASS + typecheck limpio.

- [ ] **Step 5: Commit**

```bash
git add src/types/facturador.ts src/types/facturador.test.ts
git commit -m "feat(facturador): StoredInvoice con emittedByGarca boolean"
```

---

## Task 4: Tipos de emisión (preview, request, resultado)

**Files:**
- Modify: `src/types/facturador.ts`
- Test: `src/types/facturador.test.ts`

- [ ] **Step 1: Add failing test**

```typescript
import type { EmissionPreview, EmissionResult } from "@/types/facturador";

it("EmissionPreview y EmissionResult tienen la forma esperada", () => {
  const preview: EmissionPreview = {
    puntoVenta: "3", tipoComprobante: 11, importeTotal: 3500000,
    razonSocialReceptor: "GSA", lineas: [{ descripcion: "Serv", cantidad: 1, precioUnitario: 3500000, subtotal: 3500000 }],
    html: "<html/>",
  };
  const result: EmissionResult = { ...preview, numeroCompleto: "00003-00000089", cae: "123", vencimientoCae: "13/07/2026" };
  expect(result.cae).toBe("123");
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npm run typecheck`
Expected: error — tipos inexistentes.

- [ ] **Step 3: Add types**

Agregar a `src/types/facturador.ts`:

```typescript
/** Línea tal como se muestra en el Resumen (pantalla 4 de RCEL). */
export interface PreviewLinea {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** Datos parseados del Resumen de RCEL (preview real, antes de confirmar). */
export interface EmissionPreview {
  puntoVenta: string;
  tipoComprobante: number;
  importeTotal: number;
  razonSocialReceptor: string;
  lineas: PreviewLinea[];
  /** HTML crudo del Resumen para render fiel opcional. */
  html: string;
}

/** Resultado de una emisión confirmada. */
export interface EmissionResult extends EmissionPreview {
  numeroCompleto: string;
  cae: string;
  vencimientoCae: string;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/types/facturador.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/facturador.ts src/types/facturador.test.ts
git commit -m "feat(facturador): tipos de preview y resultado de emisión"
```

---

## Task 5: Builder del plan de llenado (fill-plan.ts)

**Files:**
- Create: `src/lib/facturador/fill-plan.ts`
- Test: `src/lib/facturador/fill-plan.test.ts`

Contexto: transforma una `Plantilla` en una lista declarativa de acciones sobre RCEL. Pura y testeable; la ejecución (Task 8) sólo interpreta estas acciones. Usa códigos del Plan 1 (`CONCEPTO_CODE`, etc.).

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/fill-plan.test.ts
import { describe, it, expect } from "vitest";
import { buildFillPlan } from "@/lib/facturador/fill-plan";
import type { Plantilla } from "@/types/facturador";

const p: Plantilla = {
  id: "t1", nombre: "GSA", puntoDeVenta: "3", concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "GSA", domicilio: "Belgrano 2687", condicionVenta: ["6"] },
  periodo: { desde: "01/06/2026", hasta: "30/06/2026", vtoPago: "13/07/2026" },
  lineas: [{ descripcion: "Por 120 horas", cantidad: 1, unidad: "7", precioUnitario: 3500000 }],
};

describe("buildFillPlan", () => {
  it("pantalla 0: setea PV y tipo de comprobante (Factura C = universo 2)", () => {
    const plan = buildFillPlan(p);
    expect(plan.pantalla0).toEqual([
      { selector: "#puntodeventa", action: "select", value: "3" },
      { selector: "#universocomprobante", action: "select", value: "2" },
    ]);
  });

  it("pantalla 1: concepto servicios agrega período; setea actividad y fecha", () => {
    const plan = buildFillPlan(p);
    expect(plan.pantalla1).toContainEqual({ selector: "#idconcepto", action: "select", value: "2" });
    expect(plan.pantalla1).toContainEqual({ selector: "#fsd", action: "fill", value: "01/06/2026" });
    expect(plan.pantalla1).toContainEqual({ selector: "#fsh", action: "fill", value: "30/06/2026" });
    expect(plan.pantalla1).toContainEqual({ selector: "#vencimientopago", action: "fill", value: "13/07/2026" });
  });

  it("pantalla 2: orden IVA→tipoDoc→nro→lookup, domicilio y condición de venta", () => {
    const plan = buildFillPlan(p);
    const selectors = plan.pantalla2.map((a) => a.selector);
    expect(selectors.indexOf("#idivareceptor")).toBeLessThan(selectors.indexOf("#idtipodocreceptor"));
    expect(selectors.indexOf("#idtipodocreceptor")).toBeLessThan(selectors.indexOf("#nrodocreceptor"));
    expect(plan.pantalla2).toContainEqual({ selector: "#nrodocreceptor", action: "lookup", value: "30707915281" });
    expect(plan.pantalla2).toContainEqual({ selector: "#formadepago6", action: "check", value: "true" });
  });

  it("pantalla 3: primera línea con descripción, cantidad, unidad, precio", () => {
    const plan = buildFillPlan(p);
    expect(plan.pantalla3).toContainEqual({ selector: "#detalle_descripcion1", action: "fill", value: "Por 120 horas" });
    expect(plan.pantalla3).toContainEqual({ selector: "#detalle_cantidad1", action: "fill", value: "1" });
    expect(plan.pantalla3).toContainEqual({ selector: "#detalle_medida1", action: "select", value: "7" });
    expect(plan.pantalla3).toContainEqual({ selector: "#detalle_precio1", action: "fill", value: "3500000" });
  });

  it("productos: no agrega período", () => {
    const prod = { ...p, concepto: "productos" as const };
    const plan = buildFillPlan(prod);
    expect(plan.pantalla1.some((a) => a.selector === "#fsd")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/fill-plan.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/fill-plan.ts
import type { Plantilla } from "@/types/facturador";
import { CONCEPTO_CODE, UNIVERSO_COMPROBANTE } from "@/lib/facturador/codes";

/** Una acción de llenado sobre RCEL. `lookup` = escribir y disparar la búsqueda de padrón. */
export interface FillAction {
  selector: string;
  action: "select" | "fill" | "check" | "lookup";
  value: string;
}

export interface FillPlan {
  pantalla0: FillAction[];
  pantalla1: FillAction[];
  pantalla2: FillAction[];
  pantalla3: FillAction[];
}

/** Convierte una Plantilla en un plan declarativo de acciones para las pantallas 0-3 de RCEL. */
export function buildFillPlan(p: Plantilla): FillPlan {
  const pantalla0: FillAction[] = [
    { selector: "#puntodeventa", action: "select", value: p.puntoDeVenta },
    { selector: "#universocomprobante", action: "select", value: UNIVERSO_COMPROBANTE.facturaC },
  ];

  const pantalla1: FillAction[] = [
    { selector: "#idconcepto", action: "select", value: CONCEPTO_CODE[p.concepto] },
  ];
  if (p.concepto !== "productos") {
    if (p.periodo?.desde) pantalla1.push({ selector: "#fsd", action: "fill", value: p.periodo.desde });
    if (p.periodo?.hasta) pantalla1.push({ selector: "#fsh", action: "fill", value: p.periodo.hasta });
    if (p.periodo?.vtoPago) pantalla1.push({ selector: "#vencimientopago", action: "fill", value: p.periodo.vtoPago });
  }

  const pantalla2: FillAction[] = [
    { selector: "#idivareceptor", action: "select", value: p.cliente.condicionIVA },
    { selector: "#idtipodocreceptor", action: "select", value: p.cliente.tipoDoc },
    { selector: "#nrodocreceptor", action: "lookup", value: p.cliente.nroDoc },
  ];
  for (const fp of p.cliente.condicionVenta) {
    pantalla2.push({ selector: `#formadepago${fp}`, action: "check", value: "true" });
  }

  const pantalla3: FillAction[] = [];
  p.lineas.forEach((l, i) => {
    const n = i + 1;
    pantalla3.push({ selector: `#detalle_descripcion${n}`, action: "fill", value: l.descripcion });
    pantalla3.push({ selector: `#detalle_cantidad${n}`, action: "fill", value: String(l.cantidad) });
    pantalla3.push({ selector: `#detalle_medida${n}`, action: "select", value: l.unidad });
    pantalla3.push({ selector: `#detalle_precio${n}`, action: "fill", value: String(l.precioUnitario) });
    if (l.bonificacion) pantalla3.push({ selector: `#detalle_porcentaje${n}`, action: "fill", value: String(l.bonificacion) });
  });

  return { pantalla0, pantalla1, pantalla2, pantalla3 };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/fill-plan.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/fill-plan.ts src/lib/facturador/fill-plan.test.ts
git commit -m "feat(facturador): builder del plan de llenado de RCEL"
```

> Nota para pantalla 3 con múltiples líneas: la ejecución (Task 8) debe llamar `insertarFilaDetalle()` antes de llenar la fila n>1 (los ids `detalle_*${n}` sólo existen tras insertar la fila). El plan declara las acciones; el ejecutor inserta filas según el índice.

---

## Task 6: Parser del Resumen (resumen-parser.ts)

**Files:**
- Create: `src/lib/facturador/resumen-parser.ts`
- Test: `src/lib/facturador/resumen-parser.test.ts`
- Create fixture: `src/lib/facturador/__fixtures__/resumen.html`

Contexto: parsea el HTML del Resumen (pantalla 4) → `EmissionPreview`. Testeable con un fixture HTML. Usa `linkedom` si está disponible; si no, parseo por regex/estructura conocida.

- [ ] **Step 1: Create the fixture**

Crear `src/lib/facturador/__fixtures__/resumen.html` con un extracto representativo del Resumen (obtenerlo en la verificación manual guardando `page.content()` de la pantalla 4; mientras tanto, un HTML mínimo con la fila de totales y una línea):

```html
<div>
  <table id="detalle">
    <tr><th>Código</th><th>Producto/Servicio</th><th>Cant.</th><th>U. Medida</th><th>Prec. Unitario</th><th>Subtotal</th></tr>
    <tr><td></td><td>Por 120 horas de servicios</td><td>1,00</td><td>unidades</td><td>3.500.000,00</td><td>3.500.000,00</td></tr>
  </table>
  <span id="razonSocialReceptor">GSA COLLECTIONS ARGENTINA SA</span>
  <span id="importeTotal">3.500.000,00</span>
</div>
```

- [ ] **Step 2: Write the failing test**

```typescript
// src/lib/facturador/resumen-parser.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseResumen } from "@/lib/facturador/resumen-parser";

const html = readFileSync(join(__dirname, "__fixtures__/resumen.html"), "utf8");

describe("parseResumen", () => {
  it("extrae importe total, receptor y líneas", () => {
    const preview = parseResumen(html, { puntoVenta: "3", tipoComprobante: 11 });
    expect(preview.importeTotal).toBe(3500000);
    expect(preview.razonSocialReceptor).toBe("GSA COLLECTIONS ARGENTINA SA");
    expect(preview.lineas).toHaveLength(1);
    expect(preview.lineas[0].descripcion).toContain("120 horas");
    expect(preview.lineas[0].subtotal).toBe(3500000);
    expect(preview.puntoVenta).toBe("3");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/resumen-parser.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 4: Write the implementation**

Parsear con DOM. En este repo el parseo de XML del scraper usa utilidades propias; para HTML usar `linkedom` si está en dependencias, si no un parseo robusto por regex sobre la estructura conocida. Implementación con regex (sin dependencias nuevas):

```typescript
// src/lib/facturador/resumen-parser.ts
import type { EmissionPreview, PreviewLinea } from "@/types/facturador";

/** Convierte "3.500.000,00" (formato AR) a number. */
function parseARNumber(s: string): number {
  const clean = s.trim().replace(/\./g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

function extractText(html: string, id: string): string {
  const m = new RegExp(`id="${id}"[^>]*>([^<]*)<`, "i").exec(html);
  return m ? m[1].trim() : "";
}

/** Parsea el HTML del Resumen de RCEL a un EmissionPreview. */
export function parseResumen(
  html: string,
  meta: { puntoVenta: string; tipoComprobante: number },
): EmissionPreview {
  const importeTotal = parseARNumber(extractText(html, "importeTotal"));
  const razonSocialReceptor = extractText(html, "razonSocialReceptor");

  const lineas: PreviewLinea[] = [];
  const tbody = /<table id="detalle">([\s\S]*?)<\/table>/i.exec(html)?.[1] ?? "";
  const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].slice(1); // saltar header
  for (const r of rows) {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1].replace(/<[^>]*>/g, "").trim());
    if (cells.length < 6) continue;
    lineas.push({
      descripcion: cells[1],
      cantidad: parseARNumber(cells[2]),
      precioUnitario: parseARNumber(cells[4]),
      subtotal: parseARNumber(cells[5]),
    });
  }

  return { ...meta, importeTotal, razonSocialReceptor, lineas, html };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/resumen-parser.test.ts`
Expected: PASS.

> ⚠️ El fixture es provisional. En la verificación manual (Task 11) hay que **reemplazar `resumen.html` por el `page.content()` real** de la pantalla 4 y ajustar los selectores/ids del parser a la estructura real de RCEL, luego re-correr el test.

- [ ] **Step 6: Commit**

```bash
git add src/lib/facturador/resumen-parser.ts src/lib/facturador/resumen-parser.test.ts src/lib/facturador/__fixtures__/resumen.html
git commit -m "feat(facturador): parser del Resumen de RCEL (provisional, ajustar con HTML real)"
```

---

## Task 7: Parser de la Consulta de comprobantes (consulta-parser.ts)

**Files:**
- Create: `src/lib/facturador/consulta-parser.ts`
- Test: `src/lib/facturador/consulta-parser.test.ts`
- Create fixture: `src/lib/facturador/__fixtures__/consulta.html`

Contexto: parsea la tabla de `buscarComprobantesGenerados.do` → `AFIPInvoice[]` (para la lista de emitidas y el dedupe). Columnas verificadas: Fecha, Tipo, Nro (`0003-00000088`), Tipo/Nro Doc receptor, CAE, Importe.

- [ ] **Step 1: Create the fixture**

Crear `src/lib/facturador/__fixtures__/consulta.html` con 1-2 filas representativas (reemplazar por HTML real en Task 11):

```html
<table id="tablaComprobantes">
  <tr><th>Fecha</th><th>Tipo</th><th>Nro</th><th>TipoDoc</th><th>NroDoc</th><th>CAE</th><th>Importe</th></tr>
  <tr><td>03/07/2026</td><td>Factura C</td><td>0003-00000088</td><td>CUIT</td><td>30707915281</td><td>86272300559273</td><td>3.500.000,00</td></tr>
</table>
```

- [ ] **Step 2: Write the failing test**

```typescript
// src/lib/facturador/consulta-parser.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseConsulta } from "@/lib/facturador/consulta-parser";

const html = readFileSync(join(__dirname, "__fixtures__/consulta.html"), "utf8");

describe("parseConsulta", () => {
  it("mapea filas a AFIPInvoice con emittedByGarca", () => {
    const invoices = parseConsulta(html);
    expect(invoices).toHaveLength(1);
    const inv = invoices[0];
    expect(inv.puntoVenta).toBe(3);
    expect(inv.numero).toBe(88);
    expect(inv.numeroCompleto).toBe("0003-00000088");
    expect(inv.tipoComprobante).toBe(11); // Factura C oficial
    expect(inv.cae).toBe("86272300559273");
    expect(inv.importeTotal).toBe(3500000);
    expect(inv.cuitReceptor).toBe("30707915281");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/consulta-parser.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 4: Write the implementation**

```typescript
// src/lib/facturador/consulta-parser.ts
import type { AFIPInvoice } from "@/types/afip-scraper";
import { TIPO_OFICIAL } from "@/lib/facturador/codes";

function parseARNumber(s: string): number {
  const clean = s.trim().replace(/\./g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

/** "Factura C" → 11, "Nota de Crédito C" → 13, etc. */
function tipoTextToCode(t: string): number {
  const s = t.toLowerCase();
  if (s.includes("crédito") || s.includes("credito")) return TIPO_OFICIAL.notaCreditoC;
  if (s.includes("débito") || s.includes("debito")) return TIPO_OFICIAL.notaDebitoC;
  return TIPO_OFICIAL.facturaC;
}

/** Parsea la tabla de "Consulta de comprobantes" de RCEL a AFIPInvoice[]. */
export function parseConsulta(html: string): AFIPInvoice[] {
  const tbody = /<table id="tablaComprobantes">([\s\S]*?)<\/table>/i.exec(html)?.[1] ?? "";
  const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].slice(1);
  const out: AFIPInvoice[] = [];
  for (const r of rows) {
    const c = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1].replace(/<[^>]*>/g, "").trim());
    if (c.length < 7) continue;
    const numeroCompleto = c[2];
    const [pv, nro] = numeroCompleto.split("-");
    out.push({
      fecha: c[0],
      tipo: c[1],
      tipoComprobante: tipoTextToCode(c[1]),
      puntoVenta: Number(pv),
      numero: Number(nro),
      numeroCompleto,
      cuitEmisor: "",
      razonSocialEmisor: "",
      cuitReceptor: c[4],
      razonSocialReceptor: "",
      importeNeto: parseARNumber(c[6]),
      importeIVA: 0,
      importeTotal: parseARNumber(c[6]),
      moneda: "PES",
      cae: c[5],
    });
  }
  return out;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/consulta-parser.test.ts`
Expected: PASS.

> ⚠️ Fixture provisional — reemplazar por HTML real de la Consulta en Task 11 y ajustar índices de columnas.

- [ ] **Step 6: Commit**

```bash
git add src/lib/facturador/consulta-parser.ts src/lib/facturador/consulta-parser.test.ts src/lib/facturador/__fixtures__/consulta.html
git commit -m "feat(facturador): parser de la Consulta de comprobantes (provisional)"
```

---

## Task 8: Steps de Playwright — navegación + llenado (verificación manual)

**Files:**
- Create: `src/lib/scrapers/afip/steps/emission/navigate.ts`
- Create: `src/lib/scrapers/afip/steps/emission/fill.ts`

Contexto: NO hay tests automatizados (tocan AFIP real; excluidos por convención del repo, spec §13). Se implementan siguiendo el mapeo de selectores del spec §7 y se verifican a mano en Task 11 vía pre-comprobantes. Reusar el patrón de los steps existentes en `src/lib/scrapers/afip/steps/` (mirar `login`, `navigation` para el estilo: firma `(page: Page, ...) => Promise<...>`, uso de `emitter`/eventos y `DEFAULT_TIMEOUT`).

- [ ] **Step 1: Read existing step patterns**

Leer `src/lib/scrapers/afip/steps/login/` y `src/lib/scrapers/afip/steps/navigation/` para copiar el estilo (imports de `playwright`, manejo de timeouts, eventos `SCRAPER_EVENTS`, `noopEmitter`).

- [ ] **Step 2: Implement `navigate.ts`**

```typescript
// src/lib/scrapers/afip/steps/emission/navigate.ts
import type { Page } from "playwright";

/**
 * Navega desde el portal a RCEL → Generar Comprobantes, SIEMPRE por clicks
 * (RCEL da 403 en deep-links y rompe sesión si se navega por URL).
 * Asume que el login ya se hizo (reusar el step de login existente).
 */
export async function navigateToEmission(page: Page): Promise<void> {
  // Portal → Comprobantes en línea (abre nueva pestaña/su propio flujo)
  await page.goto("https://portalcf.cloud.afip.gob.ar/portal/app/", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Comprobantes en línea" }).click();
  // El servicio abre RCEL; seleccionar empresa a representar
  const rcel = await waitForRcelPage(page);
  await rcel.getByRole("button").first().click(); // botón "PEREZ JUAN CARLOS" (empresa)
  // Menú principal → Generar Comprobantes
  await rcel.getByText("Generar Comprobantes").click();
}

/** Espera y devuelve la página de RCEL (fe.afip.gob.ar/rcel). Ajustar en verificación manual. */
async function waitForRcelPage(page: Page): Promise<Page> {
  // En verificación manual: manejar la apertura de pestaña nueva (context.on("page"))
  // y devolver la page correcta. Placeholder: misma page si RCEL abre en el mismo tab.
  await page.waitForURL(/fe\.afip\.gob\.ar\/rcel/, { timeout: 30000 }).catch(() => undefined);
  return page;
}
```

> ⚠️ La apertura de RCEL puede ser en pestaña nueva (visto en la exploración). En Task 11 ajustar `waitForRcelPage` para capturar la nueva `page` vía `context.waitForEvent("page")`. Documentar el comportamiento real.

- [ ] **Step 3: Implement `fill.ts`**

```typescript
// src/lib/scrapers/afip/steps/emission/fill.ts
import type { Page } from "playwright";

import type { FillAction, FillPlan } from "@/lib/facturador/fill-plan";

/** Ejecuta una acción de llenado con eventos REALES (no inyección de value). */
async function applyAction(page: Page, a: FillAction): Promise<void> {
  switch (a.action) {
    case "select":
      await page.selectOption(a.selector, a.value);
      break;
    case "fill":
      await page.fill(a.selector, a.value);
      break;
    case "check":
      await page.check(a.selector);
      break;
    case "lookup":
      await page.fill(a.selector, a.value);
      await page.press(a.selector, "Enter"); // dispara recuperarReceptorSiEnter → change → padrón
      await page.waitForFunction(
        () => {
          const el = document.getElementById("razonsocialreceptor") as HTMLInputElement | null;
          return !!el && el.value.trim().length > 0;
        },
        { timeout: 15000 },
      );
      break;
  }
}

async function clickContinuar(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Continuar/ }).click();
}

/**
 * Ejecuta el fill-plan sobre las pantallas 0-3 de RCEL y deja la página en el
 * Resumen (pantalla 4). NO confirma. La selección de Domicilio Comercial (obligatoria
 * para RI) debe manejarse dentro de pantalla 2 (ver nota).
 */
export async function fillComprobante(page: Page, plan: FillPlan, domicilio?: string): Promise<void> {
  for (const a of plan.pantalla0) await applyAction(page, a);
  await clickContinuar(page);

  for (const a of plan.pantalla1) await applyAction(page, a);
  await clickContinuar(page);

  for (const a of plan.pantalla2) await applyAction(page, a);
  if (domicilio) {
    await page.selectOption("#domicilioreceptorcombo", { label: domicilio }).catch(async () => {
      await page.selectOption("#domicilioreceptorcombo", { index: 1 });
    });
  } else {
    await page.selectOption("#domicilioreceptorcombo", { index: 1 });
  }
  await clickContinuar(page);

  // Pantalla 3: insertar filas adicionales antes de llenar líneas n>1
  const lineCount = new Set(plan.pantalla3.map((a) => a.selector.match(/(\d+)$/)?.[1])).size;
  for (let i = 1; i < lineCount; i++) {
    await page.evaluate(() => (window as unknown as { insertarFilaDetalle: () => void }).insertarFilaDetalle());
  }
  for (const a of plan.pantalla3) await applyAction(page, a);
  await clickContinuar(page); // → Resumen (pantalla 4)
}
```

- [ ] **Step 4: Typecheck + lint (no tests — no automatizable)**

Run: `npm run typecheck && npm run lint`
Expected: limpio. (No hay tests: estos steps se verifican en Task 11.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/afip/steps/emission/navigate.ts src/lib/scrapers/afip/steps/emission/fill.ts
git commit -m "feat(facturador): steps Playwright de navegación y llenado (a verificar manual)"
```

---

## Task 9: Steps de Playwright — preview, confirm, consulta (verificación manual)

**Files:**
- Create: `src/lib/scrapers/afip/steps/emission/preview.ts`
- Create: `src/lib/scrapers/afip/steps/emission/confirm.ts`
- Create: `src/lib/scrapers/afip/steps/emission/consulta.ts`

- [ ] **Step 1: Implement `preview.ts`**

```typescript
// src/lib/scrapers/afip/steps/emission/preview.ts
import type { Page } from "playwright";

import { parseResumen } from "@/lib/facturador/resumen-parser";
import type { EmissionPreview } from "@/types/facturador";

/** Captura el Resumen (pantalla 4) sin confirmar. */
export async function capturePreview(
  page: Page,
  meta: { puntoVenta: string; tipoComprobante: number },
): Promise<EmissionPreview> {
  await page.getByText(/RESUMEN DE DATOS/i).waitFor({ timeout: 30000 });
  const html = await page.content();
  return parseResumen(html, meta);
}
```

- [ ] **Step 2: Implement `confirm.ts`**

```typescript
// src/lib/scrapers/afip/steps/emission/confirm.ts
import type { Page } from "playwright";

/** Resultado crudo de la confirmación (número + CAE + id interno para el PDF). */
export interface ConfirmRaw {
  numeroCompleto: string;
  cae: string;
  vencimientoCae: string;
  idComprobante: string;
}

/**
 * Confirma la emisión (click "Confirmar Datos..." → observarOConfirmar()).
 * ⚠️ ACCIÓN IRREVERSIBLE: emite el comprobante real con CAE.
 * Extrae número/CAE de la pantalla post-emisión. Ajustar selectores en verificación manual.
 */
export async function confirmEmission(page: Page): Promise<ConfirmRaw> {
  await page.getByRole("button", { name: /Confirmar Datos/ }).click();
  // Puede aparecer un paso de "observaciones" antes del CAE (observarOConfirmar) — manejar en manual.
  await page.getByText(/CAE|Comprobante nro/i).first().waitFor({ timeout: 30000 });

  const idComprobante = await page.evaluate(
    () => (window as unknown as { idComprobante?: string | number }).idComprobante?.toString() ?? "",
  );
  // Los siguientes selectores se ajustan con el HTML real post-emisión (Task 11):
  const numeroCompleto = (await page.locator("#numeroComprobante").textContent().catch(() => ""))?.trim() ?? "";
  const cae = (await page.locator("#cae").textContent().catch(() => ""))?.trim() ?? "";
  const vencimientoCae = (await page.locator("#caeVto").textContent().catch(() => ""))?.trim() ?? "";
  return { numeroCompleto, cae, vencimientoCae, idComprobante };
}

/** Descarga el PDF del comprobante emitido. */
export async function downloadPdf(page: Page, idComprobante: string): Promise<Buffer> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.evaluate((id) => {
      window.location.href = `imprimirComprobante.do?c=${id}`;
    }, idComprobante),
  ]);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}
```

- [ ] **Step 3: Implement `consulta.ts`**

```typescript
// src/lib/scrapers/afip/steps/emission/consulta.ts
import type { Page } from "playwright";

import { parseConsulta } from "@/lib/facturador/consulta-parser";
import type { AFIPInvoice } from "@/types/afip-scraper";

/**
 * Corre la Consulta de comprobantes de RCEL para un rango de fechas y devuelve
 * las emitidas parseadas. Navegar por clicks desde el menú (no deep-link).
 */
export async function consultarEmitidas(
  page: Page,
  fechaDesde: string,
  fechaHasta: string,
): Promise<AFIPInvoice[]> {
  await page.getByText("Consultas").click();
  await page.fill("#fed", fechaDesde);
  await page.fill("#feh", fechaHasta);
  await page.getByRole("button", { name: /Buscar/ }).click();
  const html = await page.content();
  return parseConsulta(html);
}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: limpio.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/afip/steps/emission/preview.ts src/lib/scrapers/afip/steps/emission/confirm.ts src/lib/scrapers/afip/steps/emission/consulta.ts
git commit -m "feat(facturador): steps Playwright preview/confirm/consulta (a verificar manual)"
```

---

## Task 10: Orquestador + API routes (verificación manual)

**Files:**
- Create: `src/lib/scrapers/afip/emit.ts`
- Create: `src/app/api/arca/emit/route.ts`
- Create: `src/app/api/arca/emit/confirm/route.ts`
- Create: `src/app/api/arca/emitted/route.ts`

Contexto: seguir el patrón EXACTO de las rutas existentes `src/app/api/arca/invoices/route.ts` (Turnstile + rate limiting + decrypt de credenciales + manejo de errores). Leerla antes de escribir.

- [ ] **Step 1: Read the existing route pattern**

Leer `src/app/api/arca/invoices/route.ts` y `src/app/api/arca/companies/route.ts` para copiar: validación Turnstile, rate limiting (`src/lib/security/`), `decryptCredentials`, forma del body, y manejo de errores/CORS.

- [ ] **Step 2: Implement `emit.ts` (orquestador fase 1)**

```typescript
// src/lib/scrapers/afip/emit.ts
import { chromium } from "playwright";

import { buildFillPlan } from "@/lib/facturador/fill-plan";
import { TIPO_OFICIAL } from "@/lib/facturador/codes";
import type { EmissionPreview } from "@/types/facturador";
import type { Plantilla } from "@/types/facturador";

import { DEFAULT_HEADLESS, DEFAULT_TIMEOUT, USER_AGENT } from "./constants";
import { login } from "./steps/login";
import { navigateToEmission } from "./steps/emission/navigate";
import { fillComprobante } from "./steps/emission/fill";
import { capturePreview } from "./steps/emission/preview";

/** Fase 1: login + navegar + llenar hasta el Resumen; devuelve el preview SIN emitir. */
export async function buildEmissionPreview(
  credentials: { cuit: string; password: string },
  plantilla: Plantilla,
): Promise<EmissionPreview> {
  const browser = await chromium.launch({ headless: DEFAULT_HEADLESS });
  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);
    await login(page, credentials);
    await navigateToEmission(page);
    await fillComprobante(page, buildFillPlan(plantilla), plantilla.cliente.domicilio);
    return await capturePreview(page, {
      puntoVenta: plantilla.puntoDeVenta,
      tipoComprobante: TIPO_OFICIAL.facturaC,
    });
  } finally {
    await browser.close();
  }
}
```

> ⚠️ La firma de `login` debe coincidir con el step existente — ajustar el import/uso a la firma real (leerla en Step 1). El manejo de "sesión viva entre fase 1 y 2" y el recovery vía pre-comprobante se resuelve en la verificación manual (Task 11): decidir si se mantiene el browser abierto entre requests (no trivial en serverless) o si la fase 2 re-navega y usa el pre-comprobante guardado. **Documentar la decisión antes de codear la fase 2 final.**

- [ ] **Step 3: Implement the three routes**

Copiando el patrón de `invoices/route.ts` (Turnstile + rate limit + decrypt), crear:
- `POST /api/arca/emit` → llama `buildEmissionPreview`, devuelve `EmissionPreview`.
- `POST /api/arca/emit/confirm` → confirma (usa el orquestador de fase 2; ver nota arriba).
- `POST /api/arca/emitted` → corre `consultarEmitidas`.

(El código exacto depende del patrón real de las rutas existentes — replicarlo 1:1 cambiando sólo la lógica de negocio. No inventar un patrón nuevo de seguridad.)

- [ ] **Step 4: Typecheck + lint + build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: build de Next.js exitoso (las rutas compilan).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/afip/emit.ts src/app/api/arca/emit src/app/api/arca/emitted
git commit -m "feat(facturador): orquestador de emisión + API routes (fase 1)"
```

---

## Task 11: Verificación manual end-to-end vía pre-comprobantes

**No genera código de producción** salvo ajustes de selectores/fixtures. Es el gate de calidad de la capa Playwright.

- [ ] **Step 1: Preparar entorno**

Confirmar credenciales de prueba y `NEXT_PUBLIC_*` necesarios. Correr `npm run dev`.

- [ ] **Step 2: Ejecutar fase 1 (preview) contra RCEL real**

Con una plantilla de prueba, invocar `POST /api/arca/emit`. Verificar que:
- Navega por clicks (no 403).
- Llena las 4 pantallas con eventos reales.
- El lookup de padrón trae la razón social.
- Llega al Resumen y devuelve un `EmissionPreview` correcto.

- [ ] **Step 3: Capturar HTML real y ajustar parsers**

Guardar `page.content()` del **Resumen** y de la **Consulta** reales. Reemplazar los fixtures `resumen.html` y `consulta.html` con esos HTML. Ajustar `resumen-parser.ts` y `consulta-parser.ts` a los ids/estructura reales. Re-correr sus tests hasta verde.

- [ ] **Step 4: Probar sin emitir (pre-comprobante)**

Verificar el mecanismo de guardado como pre-comprobante (borrador) o frenar antes de "Confirmar Datos...". Confirmar que NO se genera CAE. (Esto valida `fill` + `preview` sin riesgo fiscal.)

- [ ] **Step 5: Una emisión real controlada (opcional, con el dueño presente)**

Sólo si el dueño lo autoriza explícitamente: emitir UNA factura real de monto simbólico para validar `confirm.ts` (CAE + PDF), y luego prepararse para anularla con la NC del Plan 4. Ajustar los selectores post-emisión (`#cae`, número, `idComprobante`) con el HTML real.

- [ ] **Step 6: Documentar hallazgos**

Actualizar el spec (§7) con cualquier selector/comportamiento que difiera de lo mapeado (ej. pestaña nueva de RCEL, paso de "observaciones" en `observarOConfirmar`, ids reales del CAE). Commit de los ajustes.

```bash
git add -A
git commit -m "fix(facturador): ajustar selectores/parsers al HTML real de RCEL"
```

---

## Cierre del plan

- [ ] Suite pura verde: `npx vitest run src/lib/facturador src/types/facturador.test.ts`
- [ ] `npm run typecheck && npm run lint && npm run build` verdes.
- [ ] Fase 1 (preview) verificada contra RCEL real; parsers ajustados a HTML real.
- [ ] Decisión documentada sobre fase 2 (sesión viva vs re-navegar con pre-comprobante).

## Cobertura del spec (self-review)

- §6 flujo 2 fases (preview → confirm) → Tasks 8, 9, 10. ✅
- §7 mapeo RCEL (selectores, no-deep-link, no-JS-inject, orden lookup, 2 code sets) → Tasks 5, 8, 9 + Task 11 (ajuste real). ✅
- §7 parser de Consulta (CAE, PDF, dedupe source) → Task 7, 9. ✅
- §12 backend (steps + API routes, Turnstile + rate limit) → Tasks 8-10. ✅
- §13 testing vía pre-comprobantes → Task 11. ✅
- Design inputs Opus (redondeo, líneas, boolean) → Tasks 1, 2, 3. ✅
- **Fuera de alcance:** UI (Plan 3), notas de crédito (Plan 4), integración con InvoiceContext/dedupe en el front (Plan 3).

## Riesgos conocidos (a resolver en Task 11)

- **Fase 2 en serverless:** mantener el browser vivo entre requests no es trivial. Alternativas: (a) un único request que hace preview→espera confirm del user vía un token→confirma en la misma invocación con streaming; (b) re-navegar en fase 2 y usar el pre-comprobante como estado. Decidir y documentar.
- **Pestaña nueva de RCEL** al entrar desde el portal (visto en exploración) → `context.waitForEvent("page")`.
- **`observarOConfirmar`** puede intercalar un paso de observaciones antes del CAE.
- **Selectores post-emisión** (CAE, número, idComprobante) no fueron mapeados en vivo (no se emitió) → ajustar en Task 11.
- Fixtures de parsers son **provisionales** hasta tener HTML real.
