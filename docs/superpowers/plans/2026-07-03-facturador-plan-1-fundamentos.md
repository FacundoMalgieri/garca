# Facturador — Plan 1: Fundamentos (modelo de datos + lógica pura)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir toda la lógica pura y el modelo de datos del facturador (sin UI ni Playwright), 100% testeable con Vitest.

**Architecture:** Módulos puros en `src/lib/facturador/` + tipos en `src/types/facturador.ts`. Sin efectos de red. La persistencia usa `localStorage` (patrón de `useInvoices`). Todo lo de este plan se testea con unit tests; los steps de Playwright y la UI vienen en planes posteriores.

**Tech Stack:** TypeScript estricto, Vitest (jsdom), alias `@/*` → `src/*`.

**Spec de referencia:** `docs/superpowers/specs/2026-07-03-facturador-design.md` (§4 modelo de datos, §7 códigos RCEL, §8 NC, §9 tope, §10 validaciones).

---

## File Structure

- `src/types/facturador.ts` — tipos (`Plantilla`, `LineaFactura`, `ClienteFactura`, `PeriodoFactura`, `EmittedInvoice`, `Concepto`).
- `src/lib/facturador/codes.ts` — mapeos de códigos RCEL (emisión vs oficial, unidades, IVA receptor, formas de pago, concepto).
- `src/lib/facturador/cuit.ts` — `validateCuit` (dígito verificador mod-11).
- `src/lib/facturador/dates.ts` — defaults de período (mes anterior) y `vtoPago` (hoy+10); helpers DD/MM/YYYY.
- `src/lib/facturador/validation.ts` — `validateEmissionInput` (monto, vtoPago ≤ hoy+10, CUIT).
- `src/lib/facturador/templates.ts` — CRUD de plantillas en localStorage.
- `src/lib/facturador/dedupe.ts` — `dedupeInvoices` por `tipoComprobante+puntoVenta+numero`.
- `src/lib/facturador/tope.ts` — `computeTopeAlert` (impacto de una factura sobre el margen de categoría).

Cada módulo tiene su `*.test.ts` al lado.

---

## Task 1: Tipos del facturador

**Files:**
- Create: `src/types/facturador.ts`
- Test: `src/types/facturador.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/types/facturador.test.ts
import { describe, it, expect } from "vitest";
import type { Plantilla, EmittedInvoice } from "@/types/facturador";

describe("facturador types", () => {
  it("permite construir una Plantilla válida", () => {
    const p: Plantilla = {
      id: "t1",
      nombre: "GSA mensual",
      puntoDeVenta: "3",
      concepto: "servicios",
      cliente: {
        condicionIVA: "1",
        tipoDoc: "80",
        nroDoc: "30707915281",
        razonSocial: "GSA COLLECTIONS ARGENTINA SA",
        condicionVenta: ["6"],
      },
      lineas: [
        { descripcion: "Por 120 horas de servicios", cantidad: 1, unidad: "7", precioUnitario: 3500000 },
      ],
    };
    expect(p.lineas[0].precioUnitario).toBe(3500000);
  });

  it("EmittedInvoice extiende AFIPInvoice con flag emittedByGarca", () => {
    const e: Pick<EmittedInvoice, "emittedByGarca" | "numeroCompleto"> = {
      emittedByGarca: true,
      numeroCompleto: "00003-00000088",
    };
    expect(e.emittedByGarca).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/types/facturador.test.ts`
Expected: FAIL — `Cannot find module '@/types/facturador'`.

- [ ] **Step 3: Write the types**

```typescript
// src/types/facturador.ts
import type { AFIPInvoice } from "@/types/afip-scraper";

/** Concepto del comprobante (RCEL idConcepto: 1=productos, 2=servicios, 3=ambos). */
export type Concepto = "productos" | "servicios" | "ambos";

/** Una línea de detalle del comprobante. */
export interface LineaFactura {
  /** Código de artículo (opcional). */
  codigo?: string;
  /** Descripción del producto/servicio. */
  descripcion: string;
  /** Cantidad (default 1). */
  cantidad: number;
  /** Código de unidad de medida (RCEL detalleMedida, ej. "7" = unidades). */
  unidad: string;
  /** Precio unitario. */
  precioUnitario: number;
  /** Porcentaje de bonificación (default 0). */
  bonificacion?: number;
}

/** Datos del receptor de la factura. */
export interface ClienteFactura {
  /** Código de condición IVA (RCEL idIVAReceptor, ej. "1" = Responsable Inscripto). */
  condicionIVA: string;
  /** Código de tipo de documento (RCEL idTipoDocReceptor, ej. "80" = CUIT). */
  tipoDoc: string;
  /** Número de documento. */
  nroDoc: string;
  /** Razón social (cacheada del padrón; se revalida al emitir). */
  razonSocial: string;
  /** Domicilio comercial (selección del combo o texto). */
  domicilio?: string;
  /** Email del receptor. */
  email?: string;
  /** Códigos de condición de venta (RCEL formaDePago, ej. ["6"] = Transferencia). */
  condicionVenta: string[];
}

/** Período facturado (solo aplica a servicios). Todo opcional. */
export interface PeriodoFactura {
  /** DD/MM/YYYY */
  desde?: string;
  /** DD/MM/YYYY */
  hasta?: string;
  /** DD/MM/YYYY */
  vtoPago?: string;
}

/** Plantilla de factura reutilizable, persistida en localStorage. */
export interface Plantilla {
  id: string;
  nombre: string;
  /** Número de punto de venta (ej. "3"). */
  puntoDeVenta: string;
  concepto: Concepto;
  cliente: ClienteFactura;
  periodo?: PeriodoFactura;
  lineas: LineaFactura[];
}

/** Factura emitida por GARCA: es una AFIPInvoice con flag de origen. */
export interface EmittedInvoice extends AFIPInvoice {
  emittedByGarca: true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/types/facturador.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/types/facturador.ts src/types/facturador.test.ts
git commit -m "feat(facturador): tipos del facturador (Plantilla, EmittedInvoice)"
```

---

## Task 2: Mapeos de códigos RCEL

**Files:**
- Create: `src/lib/facturador/codes.ts`
- Test: `src/lib/facturador/codes.test.ts`

Contexto (spec §7): RCEL usa **dos sets de códigos**. En emisión (`universoComprobante`): Factura C = "2", NC C = "4". En consulta/oficial (`idTipoComprobante`): Factura C = 11, NC C = 13. Necesitamos mapear entre ambos.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/codes.test.ts
import { describe, it, expect } from "vitest";
import {
  UNIVERSO_COMPROBANTE,
  TIPO_OFICIAL,
  universoToOficial,
  CONCEPTO_CODE,
  UNIDAD_MEDIDA,
} from "@/lib/facturador/codes";

describe("codes RCEL", () => {
  it("mapea Factura C emisión (2) → oficial (11)", () => {
    expect(UNIVERSO_COMPROBANTE.facturaC).toBe("2");
    expect(TIPO_OFICIAL.facturaC).toBe(11);
    expect(universoToOficial("2")).toBe(11);
  });

  it("mapea Nota de Crédito C emisión (4) → oficial (13)", () => {
    expect(UNIVERSO_COMPROBANTE.notaCreditoC).toBe("4");
    expect(TIPO_OFICIAL.notaCreditoC).toBe(13);
    expect(universoToOficial("4")).toBe(13);
  });

  it("expone concepto y unidad por defecto", () => {
    expect(CONCEPTO_CODE.servicios).toBe("2");
    expect(CONCEPTO_CODE.productos).toBe("1");
    expect(CONCEPTO_CODE.ambos).toBe("3");
    expect(UNIDAD_MEDIDA.unidades).toBe("7");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/codes.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/codes.ts
import type { Concepto } from "@/types/facturador";

/** Códigos de emisión (RCEL universoComprobante, pantalla 0 de Generar Comprobantes). */
export const UNIVERSO_COMPROBANTE = {
  facturaC: "2",
  notaDebitoC: "3",
  notaCreditoC: "4",
  reciboC: "5",
} as const;

/** Códigos oficiales (RCEL idTipoComprobante / WSFE cbte tipo, usados en Consulta). */
export const TIPO_OFICIAL = {
  facturaC: 11,
  notaDebitoC: 12,
  notaCreditoC: 13,
} as const;

/** Traduce un código de emisión (universo) al código oficial. */
export function universoToOficial(universo: string): number | null {
  switch (universo) {
    case UNIVERSO_COMPROBANTE.facturaC:
      return TIPO_OFICIAL.facturaC;
    case UNIVERSO_COMPROBANTE.notaDebitoC:
      return TIPO_OFICIAL.notaDebitoC;
    case UNIVERSO_COMPROBANTE.notaCreditoC:
      return TIPO_OFICIAL.notaCreditoC;
    default:
      return null;
  }
}

/** Código de concepto de RCEL (idConcepto). */
export const CONCEPTO_CODE: Record<Concepto, string> = {
  productos: "1",
  servicios: "2",
  ambos: "3",
};

/** Códigos de unidad de medida más usados (RCEL detalleMedida). */
export const UNIDAD_MEDIDA = {
  unidades: "7",
  otrasUnidades: "98",
  kilogramos: "1",
  litros: "5",
  metros: "2",
  docenas: "9",
  packs: "96",
} as const;

/** Códigos de condición IVA del receptor (RCEL idIVAReceptor). */
export const COND_IVA_RECEPTOR = {
  responsableInscripto: "1",
  exento: "4",
  consumidorFinal: "5",
  monotributo: "6",
  clienteExterior: "9",
} as const;

/** Códigos de forma de pago / condición de venta (RCEL formaDePago). */
export const FORMA_PAGO = {
  contado: "1",
  tarjetaDebito: "2",
  tarjetaCredito: "3",
  cuentaCorriente: "4",
  cheque: "5",
  transferencia: "6",
  otra: "7",
  otrosElectronicos: "8",
} as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/codes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/codes.ts src/lib/facturador/codes.test.ts
git commit -m "feat(facturador): mapeos de códigos RCEL (emisión vs oficial)"
```

---

## Task 3: Validación de CUIT (dígito verificador)

**Files:**
- Create: `src/lib/facturador/cuit.ts`
- Test: `src/lib/facturador/cuit.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/cuit.test.ts
import { describe, it, expect } from "vitest";
import { validateCuit } from "@/lib/facturador/cuit";

describe("validateCuit", () => {
  it("acepta un CUIT válido", () => {
    expect(validateCuit("30707915281")).toBe(true); // GSA (dígito verificador correcto)
    expect(validateCuit("20354104076")).toBe(true); // persona física válida
  });

  it("acepta CUIT con guiones/espacios", () => {
    expect(validateCuit("30-70791528-1")).toBe(true);
  });

  it("rechaza dígito verificador incorrecto", () => {
    expect(validateCuit("30707915282")).toBe(false);
  });

  it("rechaza longitud inválida o no numérico", () => {
    expect(validateCuit("123")).toBe(false);
    expect(validateCuit("abcdefghijk")).toBe(false);
    expect(validateCuit("")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/cuit.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/cuit.ts

/**
 * Valida un CUIT/CUIL argentino verificando el dígito verificador (algoritmo mod-11).
 * Acepta guiones y espacios. Devuelve true solo si tiene 11 dígitos y el DV coincide.
 */
export function validateCuit(input: string): boolean {
  const digits = input.replace(/[\s-]/g, "");
  if (!/^\d{11}$/.test(digits)) return false;

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(digits[i]), 0);
  const mod = sum % 11;
  let dv = 11 - mod;
  if (dv === 11) dv = 0;
  if (dv === 10) dv = 9;

  return dv === Number(digits[10]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/cuit.test.ts`
Expected: PASS.

> Nota: si algún CUIT de fixture no valida, reemplazarlo por otro real conocido — el algoritmo es estándar mod-11.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/cuit.ts src/lib/facturador/cuit.test.ts
git commit -m "feat(facturador): validación de CUIT con dígito verificador"
```

---

## Task 4: Helpers de fechas (período mes anterior + vto pago)

**Files:**
- Create: `src/lib/facturador/dates.ts`
- Test: `src/lib/facturador/dates.test.ts`

Contexto (spec §7): el usuario suele facturar a principio de mes con período = mes anterior. `vtoPago` default = hoy + 10 (tope AFIP). Formato RCEL: `DD/MM/YYYY`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/dates.test.ts
import { describe, it, expect } from "vitest";
import { previousMonthPeriod, defaultVtoPago, formatDMY, addDays } from "@/lib/facturador/dates";

describe("date helpers", () => {
  it("formatDMY formatea a DD/MM/YYYY", () => {
    expect(formatDMY(new Date(2026, 6, 3))).toBe("03/07/2026"); // julio = mes index 6
  });

  it("previousMonthPeriod devuelve el mes anterior completo", () => {
    const p = previousMonthPeriod(new Date(2026, 6, 3)); // 03/07/2026
    expect(p.desde).toBe("01/06/2026");
    expect(p.hasta).toBe("30/06/2026");
  });

  it("previousMonthPeriod maneja el cruce de año", () => {
    const p = previousMonthPeriod(new Date(2026, 0, 5)); // 05/01/2026
    expect(p.desde).toBe("01/12/2025");
    expect(p.hasta).toBe("31/12/2025");
  });

  it("defaultVtoPago es hoy + 10 días", () => {
    expect(defaultVtoPago(new Date(2026, 6, 3))).toBe("13/07/2026");
  });

  it("addDays suma días cruzando mes", () => {
    expect(formatDMY(addDays(new Date(2026, 6, 25), 10))).toBe("04/08/2026");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/dates.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/dates.ts

/** Formatea una fecha a DD/MM/YYYY (formato de RCEL). */
export function formatDMY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Suma días a una fecha (no muta el original). */
export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** Devuelve el período (desde/hasta) del mes anterior completo, en DD/MM/YYYY. */
export function previousMonthPeriod(today: Date): { desde: string; hasta: string } {
  const desde = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const hasta = new Date(today.getFullYear(), today.getMonth(), 0); // día 0 del mes actual = último del anterior
  return { desde: formatDMY(desde), hasta: formatDMY(hasta) };
}

/** Vencimiento de pago por defecto: hoy + 10 días (tope máximo de AFIP). */
export function defaultVtoPago(today: Date): string {
  return formatDMY(addDays(today, 10));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/dates.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/dates.ts src/lib/facturador/dates.test.ts
git commit -m "feat(facturador): helpers de fechas (período mes anterior, vto +10)"
```

---

## Task 5: Validación del input de emisión

**Files:**
- Create: `src/lib/facturador/validation.ts`
- Test: `src/lib/facturador/validation.test.ts`

Contexto (spec §10): antes de emitir validar CUIT del receptor, monto > 0, y `vtoPago` ≤ hoy+10.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/validation.test.ts
import { describe, it, expect } from "vitest";
import { validateEmissionInput } from "@/lib/facturador/validation";
import type { Plantilla } from "@/types/facturador";

const base: Plantilla = {
  id: "t1",
  nombre: "GSA",
  puntoDeVenta: "3",
  concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "GSA", condicionVenta: ["6"] },
  periodo: { vtoPago: "13/07/2026" },
  lineas: [{ descripcion: "Servicios", cantidad: 1, unidad: "7", precioUnitario: 3500000 }],
};

const today = new Date(2026, 6, 3); // 03/07/2026

describe("validateEmissionInput", () => {
  it("acepta una plantilla válida", () => {
    expect(validateEmissionInput(base, today)).toEqual({ ok: true, errors: [] });
  });

  it("rechaza CUIT inválido (para tipoDoc CUIT)", () => {
    const bad = { ...base, cliente: { ...base.cliente, nroDoc: "30707915282" } };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("CUIT del receptor inválido");
  });

  it("rechaza monto <= 0", () => {
    const bad = { ...base, lineas: [{ ...base.lineas[0], precioUnitario: 0 }] };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("El importe total debe ser mayor a 0");
  });

  it("rechaza vtoPago mayor a hoy+10", () => {
    const bad = { ...base, periodo: { vtoPago: "20/07/2026" } };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("El vencimiento de pago no puede superar los 10 días desde hoy");
  });

  it("no valida CUIT si el tipoDoc no es CUIT", () => {
    const cf = { ...base, cliente: { ...base.cliente, condicionIVA: "5", tipoDoc: "96", nroDoc: "12345678" } };
    expect(validateEmissionInput(cf, today).ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/validation.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/validation.ts
import type { Plantilla } from "@/types/facturador";
import { validateCuit } from "@/lib/facturador/cuit";
import { addDays } from "@/lib/facturador/dates";
import { COND_IVA_RECEPTOR } from "@/lib/facturador/codes";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Convierte DD/MM/YYYY a Date (local). Devuelve null si no parsea. */
function parseDMY(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

/** Suma total de las líneas (precio × cantidad − bonificación). */
export function totalImporte(p: Plantilla): number {
  return p.lineas.reduce((acc, l) => {
    const bruto = l.precioUnitario * l.cantidad;
    const bonif = bruto * ((l.bonificacion ?? 0) / 100);
    return acc + (bruto - bonif);
  }, 0);
}

/** Valida el input antes de emitir. `today` inyectable para tests. */
export function validateEmissionInput(p: Plantilla, today: Date): ValidationResult {
  const errors: string[] = [];

  // CUIT: solo si el tipo de documento es CUIT ("80")
  if (p.cliente.tipoDoc === "80" && !validateCuit(p.cliente.nroDoc)) {
    errors.push("CUIT del receptor inválido");
  }

  if (totalImporte(p) <= 0) {
    errors.push("El importe total debe ser mayor a 0");
  }

  const vto = p.periodo?.vtoPago;
  if (vto) {
    const vtoDate = parseDMY(vto);
    const max = addDays(today, 10);
    // Normalizar a medianoche para comparar por día
    const vtoDay = vtoDate ? new Date(vtoDate.getFullYear(), vtoDate.getMonth(), vtoDate.getDate()) : null;
    const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    if (!vtoDay || vtoDay.getTime() > maxDay.getTime()) {
      errors.push("El vencimiento de pago no puede superar los 10 días desde hoy");
    }
  }

  // condicionIVA se referencia para asegurar consistencia futura del payload
  void COND_IVA_RECEPTOR;

  return { ok: errors.length === 0, errors };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/validation.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/validation.ts src/lib/facturador/validation.test.ts
git commit -m "feat(facturador): validación de input de emisión (CUIT, monto, vto)"
```

---

## Task 6: Storage de plantillas (localStorage CRUD)

**Files:**
- Create: `src/lib/facturador/templates.ts`
- Test: `src/lib/facturador/templates.test.ts`

Contexto (spec §4): plantillas en localStorage. Reusar `generateId()` de `@/lib/utils`. Vitest corre en jsdom (localStorage disponible).

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/templates.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { listTemplates, saveTemplate, deleteTemplate, TEMPLATES_STORAGE_KEY } from "@/lib/facturador/templates";
import type { Plantilla } from "@/types/facturador";

const nueva: Omit<Plantilla, "id"> = {
  nombre: "GSA",
  puntoDeVenta: "3",
  concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "GSA", condicionVenta: ["6"] },
  lineas: [{ descripcion: "Servicios", cantidad: 1, unidad: "7", precioUnitario: 3500000 }],
};

describe("templates storage", () => {
  beforeEach(() => localStorage.clear());

  it("lista vacío cuando no hay nada", () => {
    expect(listTemplates()).toEqual([]);
  });

  it("guarda una plantilla nueva y le asigna id", () => {
    const saved = saveTemplate(nueva);
    expect(saved.id).toBeTruthy();
    expect(listTemplates()).toHaveLength(1);
    expect(listTemplates()[0].nombre).toBe("GSA");
  });

  it("actualiza una plantilla existente por id", () => {
    const saved = saveTemplate(nueva);
    saveTemplate({ ...saved, nombre: "GSA editada" });
    const all = listTemplates();
    expect(all).toHaveLength(1);
    expect(all[0].nombre).toBe("GSA editada");
  });

  it("elimina por id", () => {
    const saved = saveTemplate(nueva);
    deleteTemplate(saved.id);
    expect(listTemplates()).toEqual([]);
  });

  it("tolera JSON corrupto devolviendo []", () => {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, "{no es json");
    expect(listTemplates()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/templates.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/templates.ts
import type { Plantilla } from "@/types/facturador";
import { generateId } from "@/lib/utils";

export const TEMPLATES_STORAGE_KEY = "garca_facturador_templates";

/** Lee todas las plantillas. Tolera storage ausente o corrupto. */
export function listTemplates(): Plantilla[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Plantilla[]) : [];
  } catch {
    return [];
  }
}

/** Persiste la lista completa (silencioso si falla, ej. quota). */
function writeAll(list: Plantilla[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota / unavailable */
  }
}

/**
 * Crea (si no tiene id) o actualiza (si el id existe) una plantilla.
 * Devuelve la plantilla persistida (con id).
 */
export function saveTemplate(input: Plantilla | Omit<Plantilla, "id">): Plantilla {
  const list = listTemplates();
  const withId: Plantilla = "id" in input && input.id ? (input as Plantilla) : { ...(input as Omit<Plantilla, "id">), id: generateId() };
  const idx = list.findIndex((t) => t.id === withId.id);
  if (idx >= 0) list[idx] = withId;
  else list.push(withId);
  writeAll(list);
  return withId;
}

/** Elimina una plantilla por id. */
export function deleteTemplate(id: string): void {
  writeAll(listTemplates().filter((t) => t.id !== id));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/templates.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/templates.ts src/lib/facturador/templates.test.ts
git commit -m "feat(facturador): CRUD de plantillas en localStorage"
```

---

## Task 7: Dedupe de facturas emitidas

**Files:**
- Create: `src/lib/facturador/dedupe.ts`
- Test: `src/lib/facturador/dedupe.test.ts`

Contexto (spec §4, §6): al re-scrapear, evitar duplicados entre lo emitido por GARCA y lo que reaparezca. Clave: `tipoComprobante + puntoVenta + numero`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/dedupe.test.ts
import { describe, it, expect } from "vitest";
import { invoiceKey, dedupeInvoices } from "@/lib/facturador/dedupe";
import type { AFIPInvoice } from "@/types/afip-scraper";

function inv(partial: Partial<AFIPInvoice>): AFIPInvoice {
  return {
    fecha: "03/07/2026", tipo: "FACTURA C", tipoComprobante: 11,
    puntoVenta: 3, numero: 88, numeroCompleto: "00003-00000088",
    cuitEmisor: "20354104076", razonSocialEmisor: "YO",
    cuitReceptor: "30707915281", razonSocialReceptor: "GSA",
    importeNeto: 3500000, importeIVA: 0, importeTotal: 3500000, moneda: "PES",
    ...partial,
  };
}

describe("dedupe", () => {
  it("invoiceKey combina tipo+pv+numero", () => {
    expect(invoiceKey(inv({}))).toBe("11-3-88");
  });

  it("mergea prefiriendo la versión existente (emitida por GARCA)", () => {
    const emitida = { ...inv({}), emittedByGarca: true } as AFIPInvoice;
    const scrapeada = inv({ estado: "APROBADO" }); // misma factura desde scraping
    const result = dedupeInvoices([emitida], [scrapeada]);
    expect(result).toHaveLength(1);
    expect((result[0] as { emittedByGarca?: boolean }).emittedByGarca).toBe(true);
  });

  it("suma facturas distintas", () => {
    const a = inv({ numero: 88, numeroCompleto: "00003-00000088" });
    const b = inv({ numero: 89, numeroCompleto: "00003-00000089" });
    expect(dedupeInvoices([a], [b])).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/dedupe.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/dedupe.ts
import type { AFIPInvoice } from "@/types/afip-scraper";

/** Clave única de un comprobante: tipoComprobante-puntoVenta-numero. */
export function invoiceKey(inv: AFIPInvoice): string {
  return `${inv.tipoComprobante}-${inv.puntoVenta}-${inv.numero}`;
}

/**
 * Une `existing` (prioritario, ej. emitidas por GARCA) con `incoming` (ej. scrapeadas),
 * descartando duplicados por invoiceKey. Ante colisión, gana `existing`.
 */
export function dedupeInvoices(existing: AFIPInvoice[], incoming: AFIPInvoice[]): AFIPInvoice[] {
  const byKey = new Map<string, AFIPInvoice>();
  for (const inv of existing) byKey.set(invoiceKey(inv), inv);
  for (const inv of incoming) {
    const k = invoiceKey(inv);
    if (!byKey.has(k)) byKey.set(k, inv);
  }
  return [...byKey.values()];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/dedupe.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/dedupe.ts src/lib/facturador/dedupe.test.ts
git commit -m "feat(facturador): dedupe de facturas por tipo+pv+numero"
```

---

## Task 8: Alerta de tope de monotributo

**Files:**
- Create: `src/lib/facturador/tope.ts`
- Test: `src/lib/facturador/tope.test.ts`

Contexto (spec §9): dado el `margenDisponible` de la categoría actual (que ya calcula `useMonotributo` → `MonotributoStatus`) y el importe de la nueva factura, avisar si queda cerca del tope o si lo supera. Función pura (la UI le pasa el status y el importe).

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/facturador/tope.test.ts
import { describe, it, expect } from "vitest";
import { computeTopeAlert } from "@/lib/facturador/tope";

describe("computeTopeAlert", () => {
  it("null si no hay status", () => {
    expect(computeTopeAlert(null, 1000)).toBeNull();
  });

  it("ok cuando queda margen holgado", () => {
    const r = computeTopeAlert({ margenDisponible: 5_000_000 }, 1_000_000);
    expect(r).toEqual({ level: "ok", margenRestante: 4_000_000 });
  });

  it("warning cuando la factura deja poco margen (<10%... configurable por umbral absoluto)", () => {
    const r = computeTopeAlert({ margenDisponible: 1_200_000 }, 1_000_000);
    expect(r?.level).toBe("warning");
    expect(r?.margenRestante).toBe(200_000);
  });

  it("exceeds cuando la factura supera el margen", () => {
    const r = computeTopeAlert({ margenDisponible: 500_000 }, 1_000_000);
    expect(r?.level).toBe("exceeds");
    expect(r?.margenRestante).toBe(-500_000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/facturador/tope.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/facturador/tope.ts

/** Subconjunto de MonotributoStatus que necesita esta función (evita acoplar al hook). */
export interface TopeStatusInput {
  /** Margen disponible hasta el tope de la categoría actual (ARS). */
  margenDisponible: number;
}

export type TopeLevel = "ok" | "warning" | "exceeds";

export interface TopeAlert {
  level: TopeLevel;
  /** Margen que quedaría luego de emitir esta factura (puede ser negativo). */
  margenRestante: number;
}

/** Umbral: si tras emitir el margen restante cae por debajo del 20% del margen previo, es warning. */
const WARNING_RATIO = 0.2;

/**
 * Calcula el impacto de una factura de `importe` sobre el margen de la categoría.
 * `status` puede ser null (sin datos de monotributo) → devuelve null.
 */
export function computeTopeAlert(status: TopeStatusInput | null, importe: number): TopeAlert | null {
  if (!status) return null;
  const margenRestante = status.margenDisponible - importe;
  if (margenRestante < 0) return { level: "exceeds", margenRestante };
  if (margenRestante < status.margenDisponible * WARNING_RATIO) return { level: "warning", margenRestante };
  return { level: "ok", margenRestante };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/facturador/tope.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facturador/tope.ts src/lib/facturador/tope.test.ts
git commit -m "feat(facturador): alerta de impacto en el tope de monotributo"
```

---

## Cierre del plan

- [ ] **Step final: Suite completa + typecheck + lint**

Run:
```bash
npx vitest run src/lib/facturador src/types/facturador.test.ts
npm run typecheck
npm run lint
```
Expected: todo verde.

- [ ] **Commit de cierre (si quedó algo suelto)**

```bash
git add -A
git commit -m "chore(facturador): cierre plan 1 (fundamentos + tests verdes)"
```

---

## Cobertura del spec (self-review)

- §4 modelo de datos → Task 1 (tipos), Task 6 (storage), Task 7 (dedupe). ✅
- §7 códigos RCEL (2 sets, unidades, IVA, formas de pago) → Task 2. ✅
- §7 lookup/período (fechas) → Task 4. ✅
- §9 alerta de tope → Task 8. ✅
- §10 validaciones (CUIT, monto, vto ≤ +10) → Task 3, Task 5. ✅
- **Fuera de alcance de este plan** (van en planes 2-4): steps de Playwright, API routes, UI, notas de crédito, integración con InvoiceContext. Los tipos y helpers de este plan son las dependencias de esos.
