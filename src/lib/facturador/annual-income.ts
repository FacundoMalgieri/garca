import type { AFIPInvoice } from "@/types/afip-scraper";

function parseInvoiceDate(fecha: string): Date {
  const [day, month, year] = fecha.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function getInvoiceMultiplier(tipo: string): number {
  const lower = tipo.toLowerCase();
  if (lower.includes("nota de credito") || lower.includes("nota de crédito")) return -1;
  return 1;
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
    const multiplier = getInvoiceMultiplier(invoice.tipo);
    if (invoice.moneda === "ARS") {
      total += invoice.importeTotal * multiplier;
    } else if (invoice.xmlData?.exchangeRate) {
      total += invoice.importeTotal * invoice.xmlData.exchangeRate * multiplier;
    } else {
      const manualRate = manualRates[invoice.moneda];
      if (manualRate && manualRate > 0) total += invoice.importeTotal * manualRate * multiplier;
      // Sin cotización usable: no se suma al total pero se registra para poder
      // avisar al usuario que el cálculo puede estar subestimado.
      else droppedForeignCount++;
    }
  }
  return { ingresosAnuales: total, hasCurrentYearData: hasRecent, droppedForeignCount };
}
