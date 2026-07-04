import { useInvoiceContext } from "@/contexts/InvoiceContext";
import type { AFIPInvoice } from "@/types/afip-scraper";

/** DD/MM/YYYY → epoch ms (0 si no parsea). */
function toTime(dmy: string): number {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime() : 0;
}

/** Factura más reciente emitida a un CUIT receptor dado (o null). Pura, testeable. */
export function lastInvoiceFor(invoices: AFIPInvoice[], cuitReceptor: string): AFIPInvoice | null {
  const forCuit = invoices.filter((i) => i.cuitReceptor === cuitReceptor);
  if (forCuit.length === 0) return null;
  return forCuit.reduce((newest, i) => (toTime(i.fecha) >= toTime(newest.fecha) ? i : newest));
}

/** Hook: última factura para un CUIT, leyendo del InvoiceContext. */
export function useEmittedRepeat() {
  const { state } = useInvoiceContext();
  return {
    lastInvoiceFor: (cuitReceptor: string) => lastInvoiceFor(state.invoices, cuitReceptor),
  };
}
