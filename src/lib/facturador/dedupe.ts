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

/** Marker (no está en AFIPInvoice) que distingue las facturas emitidas desde GARCA. */
type MaybeEmitted = AFIPInvoice & { emittedByGarca?: boolean };

/**
 * ¿El row emitido por GARCA (`e`) y el row scrapeado de AFIP (`f`) son el MISMO
 * comprobante?
 *
 * - Identidad primaria: `cae` (si ambos no vacíos). Es única e inequívoca.
 * - Fallback (para el placeholder CAE-pendiente que aún no tiene `cae` ni
 *   `numero` reales): `tipoComprobante + puntoVenta + importeTotal + fecha`.
 *   El PV se compara numérico (padding "00003" vs 3).
 */
function isSameComprobante(e: AFIPInvoice, f: AFIPInvoice): boolean {
  const eCae = e.cae?.trim();
  const fCae = f.cae?.trim();
  if (eCae && fCae) return eCae === fCae;

  return (
    e.tipoComprobante === f.tipoComprobante &&
    Number(e.puntoVenta) === Number(f.puntoVenta) &&
    e.importeTotal === f.importeTotal &&
    e.fecha === f.fecha
  );
}

/**
 * Une las facturas emitidas por GARCA (`emitted`, placeholders con datos
 * parciales) con las recién scrapeadas de AFIP (`fetched`, autoritativas) SIN
 * duplicar. Invariantes:
 *
 * 1. **Sin duplicados:** una emitida por GARCA y su versión autoritativa
 *    re-scrapeada colapsan a UNA. `dedupeInvoices` NO sirve acá porque su clave
 *    es `tipo-pv-numero` y el placeholder pendiente tiene `numero:0`, así que
 *    nunca colapsaría → duplicaría.
 * 2. **Autoritativo gana:** el row de AFIP (CAE real, `cuitEmisor`/`importeIVA`
 *    reales) reemplaza al placeholder de GARCA. Se conserva SOLO el marcador
 *    `emittedByGarca` para que la pestaña "Emitidas" lo siga mostrando.
 * 3. **Identidad de matcheo:** `cae` primario / `tipo+pv+importe+fecha` fallback
 *    (ver `isSameComprobante`).
 * 4. **Preservar ausentes:** una emitida que AFIP todavía NO indexó (no aparece
 *    en `fetched`) se mantiene tal cual, al frente de la lista.
 *
 * No resucita comprobantes borrados: solo re-emite lo que ya estaba en `emitted`.
 */
export function mergeFetchedInvoices(emitted: AFIPInvoice[], fetched: AFIPInvoice[]): AFIPInvoice[] {
  // Rows autoritativos; si reconcilian un placeholder de GARCA, heredan el marcador.
  const reconciled: AFIPInvoice[] = fetched.map((f) => {
    const matched = emitted.some((e) => isSameComprobante(e, f));
    if (matched) {
      return { ...f, emittedByGarca: true } as MaybeEmitted;
    }
    return f;
  });

  // Emitidas que AFIP todavía no indexó → se conservan al frente.
  const notYetIndexed = emitted.filter((e) => !fetched.some((f) => isSameComprobante(e, f)));

  return [...notYetIndexed, ...reconciled];
}
