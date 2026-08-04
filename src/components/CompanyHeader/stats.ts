import { invoiceAmountInPesos } from "@/lib/facturador/invoice-amount";
import type { AFIPInvoice } from "@/types/afip-scraper";

export interface HeaderStats {
  dateRange: { from: Date; to: Date };
  /** Total en pesos: notas de crédito restadas, moneda extranjera convertida */
  totalPesos: number;
  /** Cantidad de comprobantes por moneda */
  currencies: Record<string, number>;
  /** Cantidad total de comprobantes */
  count: number;
  /** Comprobantes en moneda extranjera excluidos del total por falta de cotización */
  unconvertedCount: number;
}

/**
 * Resumen del encabezado del panel. Usa el mismo criterio de suma que el
 * cálculo de ingresos anuales (invoiceAmountInPesos): las notas de crédito
 * restan y los comprobantes en moneda extranjera sin cotización quedan fuera
 * del total en vez de contarse como pesos.
 */
export function computeHeaderStats(
  invoices: AFIPInvoice[],
  manualRates: Record<string, number>
): HeaderStats | null {
  if (invoices.length === 0) return null;

  let totalPesos = 0;
  let unconvertedCount = 0;
  const currencies: Record<string, number> = {};
  let from = Infinity;
  let to = -Infinity;

  for (const invoice of invoices) {
    const [day, month, year] = invoice.fecha.split("/");
    const time = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
    if (time < from) from = time;
    if (time > to) to = time;

    const { amount, converted } = invoiceAmountInPesos(invoice, manualRates);
    if (converted) totalPesos += amount;
    else unconvertedCount++;

    currencies[invoice.moneda] = (currencies[invoice.moneda] || 0) + 1;
  }

  return {
    dateRange: { from: new Date(from), to: new Date(to) },
    totalPesos,
    currencies,
    count: invoices.length,
    unconvertedCount,
  };
}
