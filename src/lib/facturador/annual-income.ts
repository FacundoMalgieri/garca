import type { AFIPInvoice } from "@/types/afip-scraper";

import { invoiceAmountInPesos } from "./invoice-amount";

function parseInvoiceDate(fecha: string): Date {
  const [day, month, year] = fecha.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export interface AnnualIncomeResult {
  ingresosAnuales: number;
  hasCurrentYearData: boolean;
  // Comprobantes en moneda extranjera dentro de la ventana que no pudieron
  // convertirse (sin cotización XML ni manual) y quedaron excluidos del total.
  droppedForeignCount: number;
}

export function computeAnnualIncome(
  invoices: AFIPInvoice[],
  manualRates: Record<string, number>,
  ventanaMonths: string[]
): AnnualIncomeResult {
  if (invoices.length === 0) return { ingresosAnuales: 0, hasCurrentYearData: false, droppedForeignCount: 0 };
  const windowMonths = new Set(ventanaMonths);
  let total = 0;
  let hasRecent = false;
  let droppedForeignCount = 0;
  for (const invoice of invoices) {
    const d = parseInvoiceDate(invoice.fecha);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!windowMonths.has(monthKey)) continue;
    hasRecent = true;
    const { amount, converted } = invoiceAmountInPesos(invoice, manualRates);
    // Sin cotización usable: no se suma al total pero se registra para poder
    // avisar al usuario que el cálculo puede estar subestimado.
    if (converted) total += amount;
    else droppedForeignCount++;
  }
  return { ingresosAnuales: total, hasCurrentYearData: hasRecent, droppedForeignCount };
}
