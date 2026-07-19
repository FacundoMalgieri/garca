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
