/**
 * Memoria de clientes (Contrato del spec 2026-07-18): recuerda por documento del
 * receptor los datos que AFIP no autocompleta o que conviene reusar (condición IVA,
 * condición de venta) + la razón social real que AFIP resolvió al emitir.
 * Solo client-side. Fuente de condición IVA para autocompletar y para el default de la NC.
 */

import { asStringArray, isRecord } from "@/lib/storage/sanitize";

export interface ClientHint {
  razonSocial?: string;
  condicionIVA?: string;
  condicionVenta?: string[];
}

/** Keyed by nroDoc (CUIT/DNI) del receptor. */
export type ClientMemory = Record<string, ClientHint>;

export const CLIENTES_STORAGE_KEY = "garca_clientes";

/**
 * Sanea la memoria de clientes guardada.
 *
 * Los campos son todos opcionales, así que se conservan sólo los que tienen el
 * tipo correcto en vez de descartar el hint entero: un `condicionIVA` roto no
 * tiene por qué hacerte perder la razón social.
 */
export function sanitizeClientMemory(raw: unknown): ClientMemory {
  if (!isRecord(raw)) return {};

  const memory: ClientMemory = {};
  for (const [doc, value] of Object.entries(raw)) {
    if (!isRecord(value)) continue;
    const hint: ClientHint = {};
    if (typeof value.razonSocial === "string") hint.razonSocial = value.razonSocial;
    if (typeof value.condicionIVA === "string") hint.condicionIVA = value.condicionIVA;
    if (Array.isArray(value.condicionVenta)) {
      const condicionVenta = asStringArray(value.condicionVenta);
      if (condicionVenta.length > 0) hint.condicionVenta = condicionVenta;
    }
    if (Object.keys(hint).length > 0) memory[doc] = hint;
  }
  return memory;
}

export function loadClientMemory(): ClientMemory {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CLIENTES_STORAGE_KEY);
    if (!raw) return {};
    // Se sanea cada hint: `condicionVenta` se escribe derecho en el form y de ahí
    // sale al plan de llenado de RCEL, donde tiene que ser un array de strings.
    return sanitizeClientMemory(JSON.parse(raw));
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
