import type { AFIPInvoice } from "@/types/afip-scraper";

/**
 * Signo del comprobante: las notas de crédito restan.
 */
export function getInvoiceMultiplier(tipo: string): number {
  const lower = tipo.toLowerCase();
  if (lower.includes("nota de credito") || lower.includes("nota de crédito")) return -1;
  return 1;
}

export interface InvoiceAmount {
  /** Importe en pesos ya firmado (negativo para notas de crédito) */
  amount: number;
  /**
   * false cuando el comprobante está en moneda extranjera y no hay cotización
   * (ni XML ni manual): no se puede convertir y `amount` queda en 0, así que
   * quien suma debe avisar que el total está subestimado.
   */
  converted: boolean;
}

/**
 * Importe de un comprobante en pesos, aplicando cotización y signo.
 * Única fuente de verdad para totalizar comprobantes.
 */
export function invoiceAmountInPesos(
  invoice: Pick<AFIPInvoice, "tipo" | "moneda" | "importeTotal" | "xmlData">,
  manualRates: Record<string, number>
): InvoiceAmount {
  const multiplier = getInvoiceMultiplier(invoice.tipo);

  if (invoice.moneda === "ARS") {
    return { amount: invoice.importeTotal * multiplier, converted: true };
  }

  const rate = invoice.xmlData?.exchangeRate || manualRates[invoice.moneda] || 0;
  if (rate > 0) {
    return { amount: invoice.importeTotal * rate * multiplier, converted: true };
  }

  return { amount: 0, converted: false };
}
