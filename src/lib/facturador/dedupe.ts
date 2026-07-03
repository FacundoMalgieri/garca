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
