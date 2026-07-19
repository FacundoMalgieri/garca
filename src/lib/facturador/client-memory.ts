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
