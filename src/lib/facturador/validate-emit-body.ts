import { validateEmissionInput } from "@/lib/facturador/validation";
import type { Plantilla } from "@/types/facturador";

/**
 * Validación + whitelist server-side del body de emisión (M2/M3 del plan).
 * Se usa en AMBOS routes (`emit` y `emit/confirm`) para rechazar con 400 ANTES
 * de lanzar el browser Playwright.
 *
 * Reglas:
 *   (a) `kind` sólo puede ser "facturaC" o "notaCreditoC" (whitelist). Cualquier
 *       otro valor se rechaza — hoy cae silenciosamente al branch facturaC.
 *   (b) `facturaC` → `plantilla` requerida y validada con `validateEmissionInput`.
 *   (c) `notaCreditoC` → exige `original` + `condicionIVA` (la plantilla se deriva
 *       server-side con `buildCreditNote`, así que acá sólo se chequean los inputs).
 */

export type EmitKind = "facturaC" | "notaCreditoC";

const VALID_KINDS: readonly string[] = ["facturaC", "notaCreditoC"];

export interface EmitBody {
  kind?: unknown;
  plantilla?: unknown;
  original?: unknown;
  condicionIVA?: unknown;
}

export interface ValidateEmitBodyResult {
  ok: boolean;
  /** Mensaje apto para el usuario (no expone internals). */
  error?: string;
}

/**
 * @param body   El body ya parseado del request.
 * @param today  Inyectable para tests (default `new Date()`).
 */
export function validateEmitBody(body: EmitBody, today: Date = new Date()): ValidateEmitBodyResult {
  const kind = body.kind ?? "facturaC";

  if (typeof kind !== "string" || !VALID_KINDS.includes(kind)) {
    return { ok: false, error: "Tipo de comprobante no soportado" };
  }

  if (kind === "notaCreditoC") {
    if (!body.original || !body.condicionIVA) {
      return {
        ok: false,
        error: "Nota de crédito requiere comprobante original y condición IVA",
      };
    }
    return { ok: true };
  }

  // kind === "facturaC"
  if (!body.plantilla) {
    return { ok: false, error: "Plantilla es requerida" };
  }

  const validation = validateEmissionInput(body.plantilla as Plantilla, today);
  if (!validation.ok) {
    return { ok: false, error: validation.errors.join("; ") };
  }

  return { ok: true };
}
