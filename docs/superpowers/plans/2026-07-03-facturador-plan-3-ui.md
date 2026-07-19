# Facturador — Plan 3: UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task. Componentes visuales: usar superpowers/frontend-design. Steps con checkbox `- [ ]`.

> 🟡 **ESTADO: hooks (Tasks 1-4) COMPLETADOS y testeados; componentes (Tasks 5-9) PENDIENTES** — próximo brainstorm de UI/UX. Ver `docs/superpowers/facturador-PROGRESO.md`.

**Goal:** UI del facturador en `/facturar` (solo logueados): elegir plantilla / repetir última, completar el form, ver un **preview propio con TODO lo que se emite** + alerta de tope, confirmar, y listar lo emitido. Persistencia de plantillas en localStorage; lo emitido se integra a `InvoiceContext` con dedupe.

**Architecture:** Hooks puros (testeables) sobre la lógica del Plan 1/2 (`templates.ts`, `computeTopeAlert`, `dedupeInvoices`) + un hook de emisión que llama las API routes (`/api/arca/emit`, `/emit/confirm`) en 2 fases. Componentes React siguiendo patrones del repo (`useInvoiceContext`, `Card`, `ConfirmDialog`, `Dropdown`, `InvoiceTable`, `LoginForm`, `TurnstileWidget`). Diseño propio para el preview mostrando emisor/receptor/líneas/totales; el `html` crudo del Resumen queda como respaldo colapsable.

**Tech Stack:** Next.js App Router, React, Tailwind v4, Vitest + Testing Library (para hooks y componentes lógicos).

**Depende de:** Plan 1 (tipos, templates, tope, dedupe) y Plan 2 (tipos `EmissionPreview`/`EmissionResult`, rutas). **Deshacer/NC** se cablea en Plan 4 (acá se deja el botón deshabilitado con TODO).

**Spec:** `docs/superpowers/specs/2026-07-03-facturador-design.md` (§5 credenciales, §9 tope, §10 UX, §11 componentes).

## File Structure
- `src/hooks/useTemplates/index.ts` (+ test) — estado reactivo de plantillas (list/save/delete sobre `templates.ts`).
- `src/hooks/useEmission/index.ts` (+ test) — máquina de estados de emisión (idle→previewing→preview→confirming→done/error), llama las rutas, appendea a `InvoiceContext` con dedupe.
- `src/hooks/useEmittedRepeat/index.ts` (+ test) — "repetir última a [cliente]" desde el histórico del contexto.
- `src/app/facturar/page.tsx` — gate de login + orquesta la UI.
- `src/components/facturador/TemplateSelector.tsx` — grilla de plantillas + "repetir última".
- `src/components/facturador/EmissionForm.tsx` — form de emisión (cliente/concepto/período/líneas/monto).
- `src/components/facturador/EmissionPreviewModal.tsx` — preview propio + alerta de tope + confirmación monto grande.
- `src/components/facturador/EmittedList.tsx` — emitidas por GARCA (reusa `InvoiceTable`), botón "Deshacer" (Plan 4).
- `src/components/facturador/TemplatesManager.tsx` — CRUD de plantillas.

---

## Task 1: useTemplates (hook reactivo de plantillas)

**Files:** Create `src/hooks/useTemplates/index.ts`, Test `src/hooks/useTemplates/index.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTemplates } from "@/hooks/useTemplates";

describe("useTemplates", () => {
  beforeEach(() => localStorage.clear());

  it("arranca vacío y agrega una plantilla", () => {
    const { result } = renderHook(() => useTemplates());
    expect(result.current.templates).toEqual([]);
    act(() => {
      result.current.save({
        nombre: "GSA", puntoDeVenta: "3", concepto: "servicios",
        cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "GSA", condicionVenta: ["6"] },
        lineas: [{ descripcion: "Serv", cantidad: 1, unidad: "7", precioUnitario: 1000 }],
      });
    });
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].id).toBeTruthy();
  });

  it("elimina una plantilla", () => {
    const { result } = renderHook(() => useTemplates());
    let id = "";
    act(() => { id = result.current.save({ nombre: "X", puntoDeVenta: "3", concepto: "servicios", cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "X", condicionVenta: ["6"] }, lineas: [{ descripcion: "s", cantidad: 1, unidad: "7", precioUnitario: 1 }] }).id; });
    act(() => { result.current.remove(id); });
    expect(result.current.templates).toEqual([]);
  });
});
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement**

```tsx
import { useCallback, useEffect, useState } from "react";
import { deleteTemplate, listTemplates, saveTemplate } from "@/lib/facturador/templates";
import type { Plantilla } from "@/types/facturador";

export function useTemplates() {
  const [templates, setTemplates] = useState<Plantilla[]>([]);
  useEffect(() => setTemplates(listTemplates()), []);
  const save = useCallback((input: Plantilla | Omit<Plantilla, "id">) => {
    const saved = saveTemplate(input);
    setTemplates(listTemplates());
    return saved;
  }, []);
  const remove = useCallback((id: string) => {
    deleteTemplate(id);
    setTemplates(listTemplates());
  }, []);
  return { templates, save, remove };
}
```

- [ ] **Step 4:** Run → PASS. **Step 5:** `npm run typecheck && npm run lint`. **Step 6:** commit `feat(facturador): hook useTemplates`.

---

## Task 2: useEmission (máquina de estados + llamadas a las rutas)

**Files:** Create `src/hooks/useEmission/index.ts`, Test `src/hooks/useEmission/index.test.tsx`

Contrato:
- `phase: "idle" | "previewing" | "preview" | "confirming" | "done" | "error"`
- `preview: EmissionPreview | null`, `result: EmissionResult | null`, `error: string | null`
- `startPreview(plantilla, credsPayload)`: POST `/api/arca/emit` → set preview + phase "preview".
- `confirm(plantilla, credsPayload)`: POST `/api/arca/emit/confirm` → set result, phase "done", y **appendea al InvoiceContext** con dedupe (`dedupeInvoices`).
- `reset()`.

`credsPayload` = objeto ya cifrado (encryptCredentials) + turnstile token, con la MISMA forma que envían las rutas existentes (leer `useInvoices`/`invoices` route para los nombres de campos).

- [ ] **Step 1: Failing test** (mock `fetch`, wrap con `InvoiceProvider`)

```tsx
import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { useEmission } from "@/hooks/useEmission";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => <InvoiceProvider>{children}</InvoiceProvider>;
const previewObj = { puntoVenta: "3", tipoComprobante: 11, emisor: {}, receptor: {}, lineas: [], subtotal: 1000, importeOtrosTributos: 0, importeTotal: 1000, html: "<x/>" };

describe("useEmission", () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it("startPreview setea el preview", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify(previewObj), { status: 200 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.startPreview({} as never, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("preview"));
    expect(result.current.preview?.importeTotal).toBe(1000);
  });

  it("error de la ruta pasa a phase error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "boom" }), { status: 500 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.startPreview({} as never, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("error"));
    expect(result.current.error).toBeTruthy();
  });
});
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement** the hook. Read `src/app/api/arca/invoices/route.ts` request/response shapes + how `useInvoices` posts, and mirror the body. On confirm success, map `EmissionResult` → an `AFIPInvoice` with `emittedByGarca: true` and call the context's append/dedupe (add an `addEmittedInvoice` to `InvoiceContext` if none exists — see Task 3). Full code by the implementer following existing patterns; MUST include: phase transitions, try/catch → error phase, JSON parsing, and NOT persisting credentials.
- [ ] **Step 4:** Run → PASS. **Step 5:** gates. **Step 6:** commit `feat(facturador): hook useEmission (2 fases + append con dedupe)`.

---

## Task 3: InvoiceContext.addEmittedInvoice (append + dedupe)

**Files:** Modify `src/contexts/InvoiceContext.tsx` (+ its test if exists)

- [ ] **Step 1:** Add to the context an `addEmittedInvoice(inv: AFIPInvoice)` that prepends the invoice to state using `dedupeInvoices([inv], currentInvoices)` (existing wins → the emitted one), and persists via the existing localStorage save path.
- [ ] **Step 2:** Failing test: render provider, call addEmittedInvoice twice with same key → only one; different key → two. (Use the context's test harness pattern.)
- [ ] **Step 3:** Implement using `dedupeInvoices` from `@/lib/facturador/dedupe`.
- [ ] **Step 4:** gates. **Step 5:** commit `feat(facturador): InvoiceContext.addEmittedInvoice con dedupe`.

---

## Task 4: useEmittedRepeat ("repetir última a cliente")

**Files:** Create `src/hooks/useEmittedRepeat/index.ts` (+ test)

- [ ] **Step 1: Failing test:** given a list of `AFIPInvoice` and a receptor CUIT, `lastInvoiceFor(cuit)` returns the most recent (by fecha DD/MM/YYYY desc) invoice for that receptor, or null.

```tsx
import { describe, expect, it } from "vitest";
import { lastInvoiceFor } from "@/hooks/useEmittedRepeat";
// build two AFIPInvoice for same cuitReceptor distintas fechas → returns the newest
```

- [ ] **Step 2:** FAIL. **Step 3:** implement `lastInvoiceFor(invoices, cuit)` (pure) + a thin hook wrapper reading `useInvoiceContext().state.invoices`. Parse DD/MM/YYYY for ordering (reuse `parseDMY` pattern; keep it local/pure). **Step 4:** PASS + gates. **Step 5:** commit.

---

## Task 5: /facturar page + login gate

**Files:** Create `src/app/facturar/page.tsx` (+ `layout.tsx` if needed for metadata)

- [ ] Gate: if not logged (no live credentials in session — mirror how `/panel` detects auth via `useInvoiceContext`), render `LoginForm` with copy: "Para emitir facturas necesitás ingresar tu clave — no la guardamos, es solo para esta operación." If logged, render the facturador UI (TemplateSelector + EmissionForm + EmittedList).
- [ ] Use `superpowers/frontend-design` for layout/quality. Follow the app's existing page shell (see `/panel`).
- [ ] Gate: `npm run typecheck && npm run build`. Manual smoke in dev. Commit `feat(facturador): página /facturar con gate de login`.

---

## Task 6: TemplateSelector + TemplatesManager

**Files:** Create `src/components/facturador/TemplateSelector.tsx`, `TemplatesManager.tsx`

- [ ] TemplateSelector: grilla de `useTemplates().templates` (usar `Card`), cada una con "Facturar" (→ abre EmissionForm precargado) y "Editar/Borrar". Además "Repetir última a [cliente]" usando `useEmittedRepeat`.
- [ ] TemplatesManager: alta/edición de plantilla (form controlado que guarda via `useTemplates().save`). Campos: nombre, PV, concepto, actividad, cliente (condición IVA/tipo doc/nro/razón social/domicilio/email/condición venta), período opcional, líneas (repetibles).
- [ ] Use `frontend-design`. Gate: typecheck/build. Commit.

---

## Task 7: EmissionForm

**Files:** Create `src/components/facturador/EmissionForm.tsx`

- [ ] Precargado desde una plantilla; editable. Campos por línea (descripción/cantidad/unidad/precio/bonif) con agregar/quitar línea. Período (con atajo "mes anterior" usando `previousMonthPeriod`) y vto (default `defaultVtoPago`, validar ≤ hoy+10 con `validateEmissionInput`). Botón "Previsualizar" → `useEmission().startPreview`.
- [ ] Mostrar errores de `validateEmissionInput` inline antes de permitir previsualizar.
- [ ] Use `frontend-design`. Gate: typecheck/build. Commit.

---

## Task 8: EmissionPreviewModal (diseño propio + tope + confirmación)

**Files:** Create `src/components/facturador/EmissionPreviewModal.tsx`

- [ ] Render **propio** del `EmissionPreview`: secciones Emisor / Receptor / Detalle (tabla de líneas) / Totales — mostrando **todos** los campos. Incluir un `<details>` colapsable "Ver comprobante tal cual AFIP" que renderice `preview.html` (respaldo fiel; sanitizar/encapsular).
- [ ] **Alerta de tope**: `computeTopeAlert(status, preview.importeTotal)` usando `useMonotributo` status; mostrar banner ok/warning/exceeds con el margen restante.
- [ ] **Confirmación**: monto total en grande, texto "Esto emite una factura REAL con CAE. No se puede deshacer (solo con Nota de Crédito).", botón deliberado "Emitir" → `useEmission().confirm`. Reusar `ConfirmDialog` si encaja, o modal propio.
- [ ] Estado post-emisión: mostrar CAE + número + link a PDF.
- [ ] Use `frontend-design`. Gate: typecheck/build. Commit.

---

## Task 9: EmittedList

**Files:** Create `src/components/facturador/EmittedList.tsx`

- [ ] Listar las facturas con `emittedByGarca` desde `useInvoiceContext().state.invoices` (reusar `InvoiceTable` o una vista propia). Cada fila: botón **"Deshacer"** deshabilitado con tooltip "Disponible próximamente" y `TODO(plan-4)` (se cablea a NC en Plan 4).
- [ ] Use `frontend-design`. Gate: typecheck/build. Commit.

---

## Cierre
- [ ] Suite: `npx vitest run src` verde. `npm run typecheck && npm run lint && npm run build` verdes.
- [ ] Smoke manual en dev: login gate, crear plantilla, previsualizar (fase 1 real contra RCEL), ver preview propio con todo + alerta de tope. NO confirmar todavía.

## Cobertura del spec
- §5 credenciales (gate login, no persistir) → Task 5, 2. §9 tope → Task 8. §10 UX (preview propio con todo, confirmación) → Task 8. §11 componentes → Tasks 5-9. Plantillas + repetir última → Tasks 1,4,6.
- Deshacer/NC → Plan 4 (botón stub en Task 9).
