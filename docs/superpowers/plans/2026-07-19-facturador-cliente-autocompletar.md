# Cliente del facturador: menos campos + autocompletar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el form de emisión pida lo mínimo (condición IVA + tipo/nro doc + líneas) y autocomplete el resto desde el historial de facturas + una memoria de cliente, apoyándose en que AFIP resuelve razón social/domicilio al emitir.

**Architecture:** Dos libs puras nuevas (`client-memory.ts` con persistencia en localStorage, `client-index.ts` que fusiona historial + memoria). El form consume un índice de hints (prop). Al emitir, `useEmission` guarda el hint del receptor (razón social real de AFIP + condición IVA/venta usadas). Se recortan campos redundantes del tipo `ClienteFactura` y del form. Se extiende el lookup de padrón a DNI de forma tolerante.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest + Testing Library, Tailwind v4, Playwright (scrapers, sin tests automáticos).

## Global Constraints

- Alias `@/*` para imports de `src/` (nunca relativos cruzados).
- Copy de usuario en español.
- Persistencia solo client-side; SSR-safe (`typeof window === "undefined"` guard) + `try/catch` en todo `JSON.parse` de localStorage.
- API routes y scrapers (`src/app/api/`, `src/lib/scrapers/`) NO tienen tests automáticos (requieren AFIP real) — extraer lógica testeable a `src/lib/facturador/`.
- CUIT sintético válido para fixtures: `20301234563`. NUNCA usar datos personales reales.
- No pushear. Commits por tarea, sin push.
- Baseline: 933 tests verdes, typecheck + lint limpios.

---

## File Structure

- `src/lib/facturador/client-memory.ts` (NUEVO) — tipos `ClientHint`/`ClientMemory`, load/save en localStorage (`garca_clientes`).
- `src/lib/facturador/client-index.ts` (NUEVO) — `buildClientIndex(invoices, memory)` + `resolveClient(index, doc)`; puro.
- `src/types/facturador.ts` (MODIFICAR) — `ClienteFactura`: quitar `domicilio`/`email`, `razonSocial` opcional.
- `src/lib/scrapers/afip/emit.ts` (MODIFICAR) — quitar threading de `domicilio`.
- `src/components/facturador/EmissionForm/index.tsx` (MODIFICAR) — quitar inputs razón social/email; display read-only; prefill desde hints.
- `src/app/facturar/page.tsx` (MODIFICAR) — construir el índice y pasarlo; naming de plantilla.
- `src/hooks/useEmission/index.ts` (MODIFICAR) — guardar el hint del cliente al emitir.
- `src/components/facturador/EmissionModal/index.tsx` (MODIFICAR) — default de condición IVA de la NC desde memoria.
- `src/lib/facturador/fill-plan.ts` (MODIFICAR) — lookup también para DNI.
- `src/lib/scrapers/afip/steps/emission/fill.ts` (MODIFICAR) — lookup tolerante (no throw / wait acotado).
- Tests nuevos/ajustados junto a cada archivo.

---

## Task 1: `client-memory.ts` — memoria de cliente en localStorage

**Files:**
- Create: `src/lib/facturador/client-memory.ts`
- Test: `src/lib/facturador/client-memory.test.ts`

**Interfaces:**
- Produces:
  - `interface ClientHint { razonSocial?: string; condicionIVA?: string; condicionVenta?: string[] }`
  - `type ClientMemory = Record<string, ClientHint>` (keyed by nroDoc)
  - `loadClientMemory(): ClientMemory`
  - `saveClientHint(doc: string, hint: ClientHint): void` (merge sobre el existente; no-op si `doc` vacío)
  - `const CLIENTES_STORAGE_KEY = "garca_clientes"`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/client-memory.test.ts
import { beforeEach, describe, expect, it } from "vitest";

import { CLIENTES_STORAGE_KEY, loadClientMemory, saveClientHint } from "@/lib/facturador/client-memory";

describe("client-memory", () => {
  beforeEach(() => localStorage.clear());

  it("save + load round-trip por doc", () => {
    saveClientHint("30707915281", { razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["6"] });
    expect(loadClientMemory()["30707915281"]).toEqual({ razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["6"] });
  });

  it("merge: no pisa campos previos con undefined", () => {
    saveClientHint("30707915281", { razonSocial: "GSA SA", condicionIVA: "1" });
    saveClientHint("30707915281", { condicionVenta: ["1"] });
    expect(loadClientMemory()["30707915281"]).toEqual({ razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["1"] });
  });

  it("doc vacío = no-op", () => {
    saveClientHint("", { razonSocial: "X" });
    expect(loadClientMemory()).toEqual({});
  });

  it("localStorage corrupto → {} sin tirar", () => {
    localStorage.setItem(CLIENTES_STORAGE_KEY, "{not json");
    expect(loadClientMemory()).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/client-memory.test.ts`
Expected: FAIL ("Failed to resolve import" / funciones no definidas).

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/facturador/client-memory.ts
/**
 * Memoria de clientes (Contrato del spec 2026-07-18): recuerda por documento del
 * receptor los datos que AFIP no autocompleta o que conviene reusar (condición IVA,
 * condición de venta) + la razón social real que AFIP resolvió al emitir.
 * Solo client-side. Fuente de condición IVA para autocompletar y para el default de la NC.
 */

export interface ClientHint {
  razonSocial?: string;
  condicionIVA?: string;
  condicionVenta?: string[];
}

/** Keyed by nroDoc (CUIT/DNI) del receptor. */
export type ClientMemory = Record<string, ClientHint>;

export const CLIENTES_STORAGE_KEY = "garca_clientes";

export function loadClientMemory(): ClientMemory {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CLIENTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as ClientMemory) : {};
  } catch {
    return {};
  }
}

/** Merge parcial sobre el hint existente. Campos `undefined` no pisan. `doc` vacío = no-op. */
export function saveClientHint(doc: string, hint: ClientHint): void {
  if (typeof window === "undefined") return;
  const key = doc.trim();
  if (!key) return;
  const memory = loadClientMemory();
  const prev = memory[key] ?? {};
  const next: ClientHint = { ...prev };
  if (hint.razonSocial !== undefined) next.razonSocial = hint.razonSocial;
  if (hint.condicionIVA !== undefined) next.condicionIVA = hint.condicionIVA;
  if (hint.condicionVenta !== undefined) next.condicionVenta = hint.condicionVenta;
  memory[key] = next;
  try {
    window.localStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // quota / privado: no bloquear la emisión por no poder cachear
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/client-memory.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/client-memory.ts src/lib/facturador/client-memory.test.ts
git commit -m "feat(facturador): memoria de cliente en localStorage (garca_clientes)"
```

---

## Task 2: `client-index.ts` — fusionar historial + memoria

**Files:**
- Create: `src/lib/facturador/client-index.ts`
- Test: `src/lib/facturador/client-index.test.ts`

**Interfaces:**
- Consumes: `ClientHint`, `ClientMemory` (Task 1); `AFIPInvoice` (`@/types/afip-scraper`).
- Produces:
  - `type ClientIndex = Record<string, ClientHint>` (keyed by nroDoc)
  - `buildClientIndex(invoices: AFIPInvoice[], memory: ClientMemory): ClientIndex`
  - `resolveClient(index: ClientIndex, doc: string): ClientHint | null`

**Merge rules:** el historial aporta `razonSocial` (de `razonSocialReceptor` por `cuitReceptor`); la memoria pisa/aporta `condicionIVA`, `condicionVenta`, y `razonSocial` si la tiene (es la real de AFIP). Docs vacíos o "0" se ignoran.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/client-index.test.ts
import { describe, expect, it } from "vitest";

import { buildClientIndex, resolveClient } from "@/lib/facturador/client-index";
import type { AFIPInvoice } from "@/types/afip-scraper";

const inv = (over: Partial<AFIPInvoice>): AFIPInvoice => ({
  fecha: "10/06/2026", tipo: "FACTURA C", tipoComprobante: 11, puntoVenta: 3, numero: 1,
  numeroCompleto: "0003-00000001", cuitEmisor: "20301234563", razonSocialEmisor: "YO",
  cuitReceptor: "30707915281", razonSocialReceptor: "GSA SA",
  importeNeto: 100, importeIVA: 0, importeTotal: 100, moneda: "ARS", ...over,
});

describe("client-index", () => {
  it("razón social del historial por cuitReceptor", () => {
    const idx = buildClientIndex([inv({})], {});
    expect(resolveClient(idx, "30707915281")).toEqual({ razonSocial: "GSA SA" });
  });

  it("la memoria aporta condición IVA/venta y pisa razón social", () => {
    const idx = buildClientIndex([inv({})], {
      "30707915281": { razonSocial: "GSA COLLECTIONS SA", condicionIVA: "1", condicionVenta: ["6"] },
    });
    expect(resolveClient(idx, "30707915281")).toEqual({
      razonSocial: "GSA COLLECTIONS SA", condicionIVA: "1", condicionVenta: ["6"],
    });
  });

  it("ignora receptores sin doc válido", () => {
    const idx = buildClientIndex([inv({ cuitReceptor: "0", razonSocialReceptor: "Consumidor Final" })], {});
    expect(Object.keys(idx)).toEqual([]);
  });

  it("resolveClient devuelve null para doc desconocido", () => {
    expect(resolveClient({}, "99999999999")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/client-index.test.ts`
Expected: FAIL (import no resuelve).

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/facturador/client-index.ts
import type { ClientHint, ClientMemory } from "@/lib/facturador/client-memory";
import type { AFIPInvoice } from "@/types/afip-scraper";

export type ClientIndex = Record<string, ClientHint>;

/** Doc de receptor "no identificado" que no sirve como clave. */
function docValido(doc: string): boolean {
  return doc.trim() !== "" && doc.trim() !== "0";
}

/**
 * Índice de clientes por documento: razón social del historial + memoria (que
 * aporta condición IVA/venta y la razón social real de AFIP, con prioridad).
 */
export function buildClientIndex(invoices: AFIPInvoice[], memory: ClientMemory): ClientIndex {
  const index: ClientIndex = {};

  for (const i of invoices) {
    const doc = String(i.cuitReceptor ?? "");
    if (!docValido(doc)) continue;
    if (i.razonSocialReceptor) {
      index[doc] = { ...index[doc], razonSocial: i.razonSocialReceptor };
    }
  }

  for (const [doc, hint] of Object.entries(memory)) {
    if (!docValido(doc)) continue;
    const merged: ClientHint = { ...index[doc] };
    if (hint.razonSocial !== undefined) merged.razonSocial = hint.razonSocial;
    if (hint.condicionIVA !== undefined) merged.condicionIVA = hint.condicionIVA;
    if (hint.condicionVenta !== undefined) merged.condicionVenta = hint.condicionVenta;
    index[doc] = merged;
  }

  return index;
}

export function resolveClient(index: ClientIndex, doc: string): ClientHint | null {
  return index[doc.trim()] ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/client-index.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/client-index.ts src/lib/facturador/client-index.test.ts
git commit -m "feat(facturador): índice de clientes (historial + memoria)"
```

---

## Task 3: Recortar `ClienteFactura` (quitar domicilio/email, razón social opcional)

**Files:**
- Modify: `src/types/facturador.ts:22-38` (interface `ClienteFactura`)
- Modify: `src/lib/scrapers/afip/emit.ts` (quitar `{ domicilio }` en las 2 llamadas a `fillComprobante`)
- Modify: `src/components/facturador/EmissionForm/index.tsx` (compilar sin `email`; `blankForm` sin `razonSocial`/`email`)

**Interfaces:**
- Produces: `ClienteFactura` = `{ condicionIVA: string; tipoDoc: string; nroDoc: string; razonSocial?: string; condicionVenta: string[] }`.

- [ ] **Step 1: Editar el tipo**

En `src/types/facturador.ts`, reemplazar la interface `ClienteFactura` por:

```typescript
/** Datos del receptor de la factura. */
export interface ClienteFactura {
  /** Código de condición IVA (RCEL idIVAReceptor, ej. "1" = Responsable Inscripto). */
  condicionIVA: string;
  /** Código de tipo de documento (RCEL idTipoDocReceptor, ej. "80" = CUIT). */
  tipoDoc: string;
  /** Número de documento. */
  nroDoc: string;
  /** Razón social — cache de display/almacenamiento; AFIP la resuelve al emitir. */
  razonSocial?: string;
  /** Códigos de condición de venta (RCEL formaDePago, ej. ["6"] = Transferencia). */
  condicionVenta: string[];
}
```

- [ ] **Step 2: Quitar el threading de domicilio en emit.ts**

En `src/lib/scrapers/afip/emit.ts`, en las DOS llamadas (buildEmissionPreview ~L111 y confirmEmissionFlow ~L165), cambiar:

```typescript
await fillComprobante(rcelPage, plan, { domicilio: plantilla.cliente.domicilio });
```
por:
```typescript
await fillComprobante(rcelPage, plan);
```

- [ ] **Step 3: Ajustar `blankForm` en EmissionForm**

En `src/components/facturador/EmissionForm/index.tsx`, `blankForm()`: quitar `razonSocial` y `email` del `cliente`:

```typescript
cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "", condicionVenta: ["6"] },
```

(El input de razón social/email y el uso en `hasData` se quitan en la Task 4; por ahora, para que compile, también quitar la línea del input de email `data-testid="email"` y el input `data-testid="razon-social"`, y la referencia `form.cliente.razonSocial` en `hasData` → cambiarla por `false`. La Task 4 reescribe esta sección completa; este paso es solo para dejar el árbol compilando.)

Cambios mínimos en EmissionForm para compilar:
- Borrar los dos `<div>` de "Razón social" (líneas ~222-225) y "Email (opcional)" (líneas ~226-229).
- En `hasData` (línea ~107), quitar `|| form.cliente.razonSocial.trim() !== ""`.

- [ ] **Step 4: Typecheck + suite**

Run: `npm run typecheck`
Expected: sin errores. Si `tsc` marca otros usos de `.domicilio`/`.email` (ej. smoke scripts `scripts/smoke-*.ts`, `credit-note.ts`), corregirlos: quitar `domicilio`/`email` de cualquier literal `cliente: {...}`. `credit-note.ts` NO setea domicilio/email (solo razonSocial, que sigue existiendo opcional) — no tocar.

Run: `npm test`
Expected: puede fallar en tests que asertan el input `razon-social`/`email` de EmissionForm → se reescriben en Task 4. Si fallan SOLO esos, seguir; si falla otra cosa, arreglarla acá.

- [ ] **Step 5: Commit**

```bash
git add src/types/facturador.ts src/lib/scrapers/afip/emit.ts src/components/facturador/EmissionForm/index.tsx
git commit -m "refactor(facturador): ClienteFactura sin domicilio/email; razonSocial opcional"
```

---

## Task 4: EmissionForm — quitar campos + display read-only + prefill desde hints

**Files:**
- Modify: `src/components/facturador/EmissionForm/index.tsx`
- Test: `src/components/facturador/EmissionForm/index.test.tsx`

**Interfaces:**
- Consumes: `ClientIndex`, `resolveClient` (Task 2).
- Produces: prop nueva en `EmissionFormProps`: `clientHints?: ClientIndex`.

- [ ] **Step 1: Write the failing test**

Agregar a `src/components/facturador/EmissionForm/index.test.tsx` (reusar el render helper existente del archivo; si no existe, este bloque define lo necesario):

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmissionForm } from "@/components/facturador/EmissionForm";

const noop = () => {};

describe("EmissionForm — cliente autocompletar", () => {
  it("no muestra inputs de razón social ni email", () => {
    render(<EmissionForm initial={null} onPreview={noop} onUpdateTemplate={noop} onSaveAsNew={noop} />);
    expect(screen.queryByTestId("razon-social")).toBeNull();
    expect(screen.queryByTestId("email")).toBeNull();
  });

  it("al tipear un doc conocido, prefila condición IVA + venta y muestra el nombre", () => {
    const hints = { "30707915281": { razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["1"] } };
    render(<EmissionForm initial={null} onPreview={noop} onUpdateTemplate={noop} onSaveAsNew={noop} clientHints={hints} />);
    fireEvent.change(screen.getByTestId("nro-doc"), { target: { value: "30707915281" } });
    expect(screen.getByTestId("cliente-resuelto")).toHaveTextContent("GSA SA");
  });

  it("doc desconocido muestra el aviso de que AFIP completará", () => {
    render(<EmissionForm initial={null} onPreview={noop} onUpdateTemplate={noop} onSaveAsNew={noop} clientHints={{}} />);
    fireEvent.change(screen.getByTestId("nro-doc"), { target: { value: "99999999999" } });
    expect(screen.getByTestId("cliente-resuelto")).toHaveTextContent(/AFIP/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/facturador/EmissionForm/index.test.tsx -t "cliente autocompletar"`
Expected: FAIL (`clientHints` no existe, `cliente-resuelto` no existe).

- [ ] **Step 3: Implementar**

En `src/components/facturador/EmissionForm/index.tsx`:

a) Import:
```typescript
import { resolveClient, type ClientIndex } from "@/lib/facturador/client-index";
```

b) Prop en `EmissionFormProps`:
```typescript
  /** Índice de clientes conocidos (historial + memoria) para autocompletar por documento. */
  clientHints?: ClientIndex;
```
y en la firma: `export function EmissionForm({ initial, onPreview, onUpdateTemplate, onSaveAsNew, puntosDeVenta, clientHints }: EmissionFormProps) {`

c) Nombre resuelto (después de declarar `form`):
```typescript
  const hint = clientHints ? resolveClient(clientHints, form.cliente.nroDoc) : null;
  const resolvedName = form.cliente.razonSocial || hint?.razonSocial || "";
```

d) `setNroDoc` que prefila desde el hint (reemplaza el `onChange` inline del input nro doc):
```typescript
  const setNroDoc = (nroDoc: string) =>
    setForm((f) => {
      const h = clientHints ? resolveClient(clientHints, nroDoc) : null;
      const cliente = { ...f.cliente, nroDoc };
      if (h) {
        if (h.razonSocial !== undefined) cliente.razonSocial = h.razonSocial;
        if (h.condicionIVA !== undefined) cliente.condicionIVA = h.condicionIVA;
        if (h.condicionVenta !== undefined) cliente.condicionVenta = h.condicionVenta;
      }
      return { ...f, cliente };
    });
```

e) Reemplazar el bloque de la sección "Cliente / Receptor" (todo el `<div className={sectionCls}>` de "Cliente / Receptor", líneas ~205-235) por:

```tsx
      <div className={sectionCls}>
        <p className={sectionTitleCls}>Cliente / Receptor</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Condición IVA</label>
            <Dropdown options={COND_IVA_OPTIONS} value={form.cliente.condicionIVA} onChange={setCondicionIVA} />
          </div>
          <div>
            <label className={labelCls}>Tipo doc</label>
            <Dropdown options={TIPO_DOC_OPTIONS} value={form.cliente.tipoDoc} onChange={(v) => setCliente({ tipoDoc: v })} />
          </div>
          <div>
            <label className={labelCls}>Nro documento</label>
            <input data-testid="nro-doc" className={inputCls} value={form.cliente.nroDoc} onChange={(e) => setNroDoc(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Cliente</label>
            <p data-testid="cliente-resuelto" className="text-sm px-3 py-2 rounded-md bg-muted/40 text-muted-foreground">
              {resolvedName ? `AFIP: ${resolvedName}` : "AFIP completa la razón social al emitir"}
            </p>
          </div>
          <div>
            <label className={labelCls}>Condición de venta</label>
            <Dropdown options={FORMA_PAGO_OPTIONS} value={form.cliente.condicionVenta[0] ?? "6"} onChange={(v) => setCliente({ condicionVenta: [v] })} />
          </div>
        </div>
      </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/facturador/EmissionForm/index.test.tsx`
Expected: PASS (incluyendo los tests preexistentes de CF/validación/PV; si algún test viejo asertaba `razon-social`/`email`, borrarlo — esos campos ya no existen).

- [ ] **Step 5: Commit**

```bash
git add src/components/facturador/EmissionForm/index.tsx src/components/facturador/EmissionForm/index.test.tsx
git commit -m "feat(facturador): EmissionForm sin razón social/email + autocompletar por doc"
```

---

## Task 5: Wire en `page.tsx` — construir índice, pasar prop, naming de plantilla

**Files:**
- Modify: `src/app/facturar/page.tsx`

**Interfaces:**
- Consumes: `buildClientIndex` (Task 2), `loadClientMemory` (Task 1), `resolveClient`.

- [ ] **Step 1: Imports + índice**

En `src/app/facturar/page.tsx`, agregar imports:
```typescript
import { useEffect, useMemo, useState } from "react";
import { buildClientIndex, resolveClient } from "@/lib/facturador/client-index";
import { loadClientMemory, type ClientMemory } from "@/lib/facturador/client-memory";
```
(`useEffect` ya se importa junto con `useMemo`/`useState` — dejar una sola línea de import de react.)

Dentro del componente, después de los hooks existentes:
```typescript
  const [clientMemory, setClientMemory] = useState<ClientMemory>({});
  useEffect(() => { setClientMemory(loadClientMemory()); }, [state.invoices]);
  const clientHints = useMemo(
    () => buildClientIndex(state.invoices, clientMemory),
    [state.invoices, clientMemory]
  );
```

- [ ] **Step 2: Pasar la prop al form**

En el `<EmissionForm ... />` (dentro del tab "emitir"), agregar `clientHints={clientHints}`:
```tsx
          <EmissionForm
            key={activeId ?? "blank"}
            initial={initial}
            puntosDeVenta={state.puntosDeVenta}
            clientHints={clientHints}
            onPreview={(p) => { setPlantillaAEmitir(p); setEmitOpen(true); }}
            onUpdateTemplate={(id, p) => save({ ...p, id })}
            onSaveAsNew={(p) => { const nombre = p.nombre || (p.cliente.razonSocial ? `Factura ${p.cliente.razonSocial}` : (p.cliente.nroDoc ? `Factura ${p.cliente.nroDoc}` : "Nueva plantilla")); save({ ...p, nombre }); }}
          />
```
(El naming ahora cae a `nroDoc` cuando no hay razón social, porque `razonSocial` puede venir vacío.)

- [ ] **Step 3: Typecheck + test de la página**

Run: `npm run typecheck`
Expected: sin errores.

Run: `npx vitest run src/app/facturar/page.test.tsx`
Expected: PASS (el test existente mockea el contexto; el índice se construye vacío sin romper).

- [ ] **Step 4: Commit**

```bash
git add src/app/facturar/page.tsx
git commit -m "feat(facturador): page pasa el índice de clientes al form + naming por doc"
```

---

## Task 6: Guardar el hint del cliente al emitir + default de condición IVA en la NC

**Files:**
- Modify: `src/hooks/useEmission/index.ts`
- Modify: `src/components/facturador/EmissionModal/index.tsx`
- Test: `src/hooks/useEmission/index.test.tsx`

**Interfaces:**
- Consumes: `saveClientHint`, `loadClientMemory` (Task 1).

- [ ] **Step 1: Write the failing test**

Agregar a `src/hooks/useEmission/index.test.tsx` un test que, tras un `confirm` exitoso de una `facturaC`, el hint quede en `localStorage`:

```typescript
import { loadClientMemory } from "@/lib/facturador/client-memory";
// ...dentro del describe existente:
it("guarda el hint del cliente al emitir una factura C", async () => {
  localStorage.clear();
  // arrange: fetch mock que devuelve un result con receptor.cuit + razonSocial
  // (reusar el helper de mock del archivo; el result debe traer receptor: { cuit: "30707915281", razonSocial: "GSA SA", ... })
  // target facturaC con plantilla.cliente = { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", condicionVenta: ["6"] }
  // act: await confirm(target, creds)
  // assert:
  expect(loadClientMemory()["30707915281"]).toMatchObject({ razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["6"] });
});
```
(Ajustar el arrange al helper de mocks ya presente en el archivo — mismo patrón que el test "confirm exitoso" existente.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useEmission/index.test.tsx -t "guarda el hint"`
Expected: FAIL (memoria vacía).

- [ ] **Step 3: Implementar en `useEmission.confirm`**

En `src/hooks/useEmission/index.ts`, import:
```typescript
import { saveClientHint } from "@/lib/facturador/client-memory";
```
Dentro de `confirm`, después de `addEmittedInvoice(afipInvoice);` y solo para `facturaC` (no NC), guardar el hint usando la razón social REAL del result:
```typescript
        if (target.kind !== "notaCreditoC") {
          const c = target.plantilla.cliente;
          saveClientHint(c.nroDoc, {
            razonSocial: emissionResult.receptor.razonSocial || c.razonSocial,
            condicionIVA: c.condicionIVA,
            condicionVenta: c.condicionVenta,
          });
        }
```

- [ ] **Step 4: Default de condición IVA de la NC desde memoria**

En `src/components/facturador/EmissionModal/index.tsx` (modo `creditNote`): donde hoy se inicializa la condición IVA de la NC con el default Consumidor Final, consultar la memoria por `invoiceToVoid.cuitReceptor` y usar esa condición IVA si existe. Agregar import:
```typescript
import { loadClientMemory } from "@/lib/facturador/client-memory";
```
Y al calcular el estado inicial de `ncCondIVA` (buscar `useState` que lo inicializa, ~el default `COND_IVA_RECEPTOR.consumidorFinal`):
```typescript
  const [ncCondIVA, setNcCondIVA] = useState<string>(() => {
    const doc = invoiceToVoid?.cuitReceptor ?? "";
    const remembered = doc ? loadClientMemory()[doc]?.condicionIVA : undefined;
    return remembered ?? COND_IVA_RECEPTOR.consumidorFinal;
  });
```
(Si el nombre exacto del state difiere, mantener la intención: default = memoria por doc → si no, Consumidor Final. `handleReset` que resetea `ncCondIVA` debe resetear al mismo valor calculado.)

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/hooks/useEmission/index.test.tsx src/components/facturador/EmissionModal/index.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useEmission/index.ts src/hooks/useEmission/index.test.tsx src/components/facturador/EmissionModal/index.tsx
git commit -m "feat(facturador): recordar cliente al emitir + NC usa condición IVA recordada"
```

---

## Task 7: Lookup de padrón para DNI + lookup tolerante

**Files:**
- Modify: `src/lib/facturador/fill-plan.ts:53-59`
- Test: `src/lib/facturador/fill-plan.test.ts`
- Modify: `src/lib/scrapers/afip/steps/emission/fill.ts:41-52` (applyAction `lookup`)

**Interfaces:**
- Produces: `puedeLookup` incluye DNI (`96`).

- [ ] **Step 1: Write the failing test**

Agregar a `src/lib/facturador/fill-plan.test.ts`:

```typescript
it("dispara lookup para DNI (96) con número", () => {
  const p = {
    id: "x", nombre: "x", puntoDeVenta: "3", concepto: "productos" as const,
    cliente: { condicionIVA: "5", tipoDoc: "96", nroDoc: "30123456", condicionVenta: ["1"] },
    lineas: [{ descripcion: "a", cantidad: 1, unidad: "7", precioUnitario: 1 }],
  };
  const plan = buildFillPlan(p);
  const nroAction = plan.pantalla2.find((a) => a.selector === "#nrodocreceptor");
  expect(nroAction?.action).toBe("lookup");
});

it("NO dispara lookup para DNI sin número (consumidor final sin doc)", () => {
  const p = {
    id: "x", nombre: "x", puntoDeVenta: "3", concepto: "productos" as const,
    cliente: { condicionIVA: "5", tipoDoc: "96", nroDoc: "", condicionVenta: ["1"] },
    lineas: [{ descripcion: "a", cantidad: 1, unidad: "7", precioUnitario: 1 }],
  };
  const plan = buildFillPlan(p);
  const nroAction = plan.pantalla2.find((a) => a.selector === "#nrodocreceptor");
  expect(nroAction?.action).toBe("fill");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/fill-plan.test.ts -t "DNI"`
Expected: FAIL (hoy DNI con número da `fill`, no `lookup`).

- [ ] **Step 3: Implementar en fill-plan.ts**

Cambiar (`src/lib/facturador/fill-plan.ts` ~L53-54):
```typescript
  const puedeLookup =
    (p.cliente.tipoDoc === "80" || p.cliente.tipoDoc === "86") && p.cliente.nroDoc.trim().length > 0;
```
por:
```typescript
  // Lookup de padrón: CUIT (80), CUIL (86) y DNI (96) con número. RCEL resuelve
  // razón social/domicilio para los tres (verificado en vivo). CF sin documento
  // (nroDoc vacío) NO dispara lookup: el padrón nunca respondería.
  const puedeLookup =
    ["80", "86", "96"].includes(p.cliente.tipoDoc) && p.cliente.nroDoc.trim().length > 0;
```

- [ ] **Step 4: Lookup tolerante en fill.ts**

En `src/lib/scrapers/afip/steps/emission/fill.ts`, el `case "lookup"` debe esperar la razón social con un timeout ACOTADO y NO tirar si no llega (un doc puede no estar en padrón). Reemplazar el bloque `case "lookup":` (líneas ~41-52) por:

```typescript
    case "lookup":
      await page.fill(a.selector, a.value);
      await page.press(a.selector, "Enter");
      // Esperar que el padrón llene #razonsocialreceptor, pero acotado y tolerante:
      // un DNI/CUIT no registrado no responde, y no debe colgar ni abortar la emisión.
      try {
        await page.waitForFunction(
          () => {
            const el = document.querySelector<HTMLInputElement>("#razonsocialreceptor");
            return el !== null && el.value.trim().length > 0;
          },
          { timeout: TIMING.LOOKUP_WAIT },
        );
      } catch {
        // sin resolución de padrón: seguir con lo tipeado (RCEL acepta CF sin razón social)
      }
      break;
```

Agregar `LOOKUP_WAIT` a `TIMING` en `src/lib/scrapers/afip/constants/index.ts` (buscar el objeto `TIMING`), por ejemplo `LOOKUP_WAIT: 8000` (8s), y quitar el import de `ELEMENT_TIMEOUT` en fill.ts si queda sin uso (verificar: `fillPantalla0` también usa `ELEMENT_TIMEOUT` → NO quitar el import).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/fill-plan.test.ts`
Expected: PASS. (fill.ts no tiene test automático — verificación manual vía smoke queda para después.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/facturador/fill-plan.ts src/lib/facturador/fill-plan.test.ts src/lib/scrapers/afip/steps/emission/fill.ts src/lib/scrapers/afip/constants/index.ts
git commit -m "feat(facturador): lookup de padrón para DNI + tolerante (sin colgar)"
```

---

## Task 8: Verificación final (coordinator)

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Typecheck + lint + suite completa**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck sin errores; lint 0 errores; suite verde (baseline 933 + nuevos tests de Tasks 1,2,4,6,7).

- [ ] **Step 2: Revisar migración de plantillas viejas**

Verificar que una plantilla vieja en localStorage con `domicilio`/`email`/`razonSocial` se lee sin romper (campos extra ignorados por TS en runtime; `razonSocial` opcional). No requiere código — confirmar que `useTemplates`/`templates.ts` no valida shape estricto.

- [ ] **Step 3: NO pushear**

Confirmar que no se pushea nada (instrucción vigente).

---

## Self-Review

**Spec coverage:**
- Recorte de campos (razón social/domicilio/email) → Tasks 3, 4. ✓
- Tipos → Task 3. ✓
- Índice de clientes desde historial → Task 2. ✓
- Memoria de cliente + fix default CF de NC → Tasks 1, 6. ✓
- Autocompletar en el form → Tasks 4, 5. ✓
- Lookup de DNI tolerante → Task 7. ✓
- Naming de plantillas → Task 5 (step 2). ✓
- Filtro condición IVA → tipos de doc: el spec lo menciona como refuerzo; el comportamiento actual (`setCondicionIVA` autoselecciona DNI para CF) ya cubre el caso crítico. NO se agrega filtrado dinámico de opciones de tipoDoc esta ronda (YAGNI; fuera del set mínimo). Anotado como no incluido.

**Placeholder scan:** sin TBD/TODO; todos los steps con código real. El único "ajustar al helper de mocks existente" (Task 6 step 1) refiere a un patrón ya presente en el archivo de test — no es un placeholder de implementación.

**Type consistency:** `ClientHint`/`ClientMemory` (Task 1) usados igual en Tasks 2/5/6; `ClientIndex`/`resolveClient`/`buildClientIndex` (Task 2) usados igual en Tasks 4/5; `clientHints` prop (Task 4) pasada en Task 5. `ClienteFactura` sin domicilio/email (Task 3) consistente con el form (Task 4) y emit.ts.

**Fuera de alcance (del spec, no se implementa):** API paga de constancia; persistir domicilio; typeahead difuso; filtrado dinámico de tipoDoc por condición IVA.
