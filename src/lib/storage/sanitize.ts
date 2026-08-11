/**
 * Saneado de lo que sale de localStorage.
 *
 * Todo lo persistido se rehidrata en sesiones futuras con la forma que tenía la
 * versión que lo guardó, no la del tipo de hoy. `JSON.parse` sólo garantiza que
 * sea JSON válido, así que un campo que el código de hoy da por seguro puede no
 * estar — y el error aparece lejos del origen, al usarse.
 *
 * El caso que motivó esto (06/08/2026): un punto de venta sin `tipos` pasaba el
 * parse y después tiraba "Cannot read properties of undefined (reading 'some')",
 * dejando /facturar entero en pantalla de error. Ver sanitizePuntosDeVenta.
 *
 * Criterio general: **coercionar antes que descartar**. Estos datos son del
 * usuario (sus comprobantes, sus plantillas); tirar una fila silenciosamente
 * cambia totales sin avisar. Sólo se descarta lo que no puede ser lo que dice
 * ser (un comprobante que no es objeto) o lo que dejaría a la UI concluyendo
 * algo falso.
 */

import type { AFIPInvoice, MonotributoAFIPInfo } from "@/types/afip-scraper";
import type { MonthKey, ProjectionData } from "@/types/projection";

// ============================================================================
// PRIMITIVAS
// ============================================================================

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Number finito o el fallback. Cubre strings numéricos, NaN, Infinity y null. */
export function asFiniteNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Sólo los elementos que ya son strings. No coerciona números a string. */
export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

// ============================================================================
// COMPROBANTES
// ============================================================================

/**
 * Los campos que el resto de la app usa en aritmética o en operaciones de
 * string. Si alguno viene con otro tipo, el panel calcula NaN o explota.
 */
const NUMERIC_INVOICE_FIELDS = [
  "tipoComprobante",
  "puntoVenta",
  "numero",
  "importeNeto",
  "importeIVA",
  "importeTotal",
] as const;

const STRING_INVOICE_FIELDS = [
  "fecha",
  "tipo",
  "numeroCompleto",
  "cuitEmisor",
  "razonSocialEmisor",
  "cuitReceptor",
  "razonSocialReceptor",
  "moneda",
] as const;

/**
 * Sanea un comprobante conservando los campos que no conocemos.
 *
 * Se preserva el resto del objeto a propósito: un campo agregado en una versión
 * posterior tiene que sobrevivir a la ida y vuelta por acá.
 */
function sanitizeInvoice(raw: unknown): AFIPInvoice | null {
  if (!isRecord(raw)) return null;

  const clean: Record<string, unknown> = { ...raw };
  for (const field of NUMERIC_INVOICE_FIELDS) clean[field] = asFiniteNumber(raw[field]);
  for (const field of STRING_INVOICE_FIELDS) clean[field] = asString(raw[field]);

  return clean as unknown as AFIPInvoice;
}

/**
 * @returns Los comprobantes saneados, o null si lo guardado no es una lista
 *   (dato inservible: el caller lo trata como "no hay sesión" en vez de mostrar
 *   un panel vacío que parecería "no facturaste nada").
 */
export function sanitizeInvoices(raw: unknown): AFIPInvoice[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map(sanitizeInvoice).filter((inv): inv is AFIPInvoice => inv !== null);
}

// ============================================================================
// EMPRESA
// ============================================================================

export interface StoredCompanyInfo {
  cuit: string;
  razonSocial: string;
  index: number;
}

/**
 * @returns La empresa saneada, o null si no hay nada usable. Sin `cuit` ni
 *   `razonSocial` no hay empresa que mostrar, así que el caller cae a
 *   extraerla de los comprobantes.
 */
export function sanitizeCompanyInfo(raw: unknown): StoredCompanyInfo | null {
  if (!isRecord(raw)) return null;

  const cuit = asString(raw.cuit);
  const razonSocial = asString(raw.razonSocial);
  if (cuit === "" && razonSocial === "") return null;

  return { cuit, razonSocial, index: asFiniteNumber(raw.index, 0) };
}

// ============================================================================
// MONOTRIBUTO
// ============================================================================

/**
 * @returns La info saneada, o null si falta la categoría — que es el único dato
 *   del que cuelga todo el panel de Monotributo.
 */
export function sanitizeMonotributoInfo(raw: unknown): MonotributoAFIPInfo | null {
  if (!isRecord(raw)) return null;

  const categoria = asString(raw.categoria);
  if (categoria === "") return null;

  const tipoActividad = raw.tipoActividad;
  return {
    categoria,
    tipoActividad:
      tipoActividad === "servicios" || tipoActividad === "venta" ? tipoActividad : null,
    actividadDescripcion: asString(raw.actividadDescripcion),
    proximaRecategorizacion: asString(raw.proximaRecategorizacion),
    nombreCompleto: asString(raw.nombreCompleto),
    cuit: asString(raw.cuit),
  };
}

// ============================================================================
// RANGO CONSULTADO
// ============================================================================

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Rango de fechas de la última consulta a ARCA (YYYY-MM-DD).
 *
 * Excepción al criterio de coercionar del módulo: acá se descarta. El rango sólo
 * se usa para decidir si una ventana de recategorización quedó cubierta, y un
 * rango a medias o con formato raro haría pasar por cubierta una ventana que no
 * lo está — o sea, la UI afirmando una categoría que no puede saber. Null
 * ("desconocido") es un estado que la UI ya sabe mostrar; un rango falso, no.
 */
export function sanitizeDateRange(raw: unknown): { from: string; to: string } | null {
  if (!isRecord(raw)) return null;

  const from = asString(raw.from);
  const to = asString(raw.to);

  if (!ISO_DATE.test(from) || !ISO_DATE.test(to)) return null;
  // Invertido no puede ser lo que dice ser: no describe ningún período.
  if (from > to) return null;

  return { from, to };
}

// ============================================================================
// COTIZACIONES MANUALES
// ============================================================================

/**
 * Cotizaciones cargadas a mano, por moneda.
 *
 * Una cotización <= 0 o no numérica se descarta: se usa como divisor/multiplicador
 * para convertir a pesos, y dejarla pasar mostraría totales sin sentido.
 */
export function sanitizeManualFxRates(raw: unknown): Record<string, number> {
  if (!isRecord(raw)) return {};

  const clean: Record<string, number> = {};
  for (const [currency, rate] of Object.entries(raw)) {
    const value = asFiniteNumber(rate, 0);
    if (value > 0) clean[currency] = value;
  }
  return clean;
}

// ============================================================================
// PROYECCIÓN
// ============================================================================

/** Clave de mes válida para la proyección: YYYY-MM. */
function isMonthKey(value: string): value is MonthKey {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/**
 * @returns La proyección saneada, o null si no hay mes objetivo válido (sin eso
 *   no se puede calcular nada y la UI vuelve a sus defaults).
 */
export function sanitizeProjectionData(raw: unknown): ProjectionData | null {
  if (!isRecord(raw)) return null;

  const target = asString(raw.targetRecategorizacion);
  if (!isMonthKey(target)) return null;

  const monthlyProjections: Record<string, number> = {};
  if (isRecord(raw.monthlyProjections)) {
    for (const [month, amount] of Object.entries(raw.monthlyProjections)) {
      // Una clave que no es YYYY-MM rompería la ventana de 12 meses.
      if (isMonthKey(month)) monthlyProjections[month] = asFiniteNumber(amount);
    }
  }

  return {
    targetRecategorizacion: target,
    targetCategoria: typeof raw.targetCategoria === "string" ? raw.targetCategoria : null,
    margenSeguridad: asFiniteNumber(raw.margenSeguridad),
    monthlyProjections: monthlyProjections as Record<MonthKey, number>,
    updatedAt: asString(raw.updatedAt),
  };
}
