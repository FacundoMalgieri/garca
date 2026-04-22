import { getNextRecategorizacionDates } from "@/lib/projection";
import type { AFIPInvoice } from "@/types/afip-scraper";
import type { MonthKey } from "@/types/projection";

function parseInvoiceDate(fecha: string): Date {
  const [day, month, year] = fecha.split("/");
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

function getInvoiceMultiplier(tipo: string): number {
  const lower = tipo.toLowerCase();
  if (lower.includes("nota de credito") || lower.includes("nota de crédito")) return -1;
  return 1;
}

/** Padded YYYY-MM, same as panel / projection window keys */
function monthKeyForInvoice(fecha: string): MonthKey {
  const d = parseInvoiceDate(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Amount in ARS for one invoice (SummaryPanel + panel /ingresar logic).
 */
function invoiceAmountPesos(inv: AFIPInvoice, manualExchangeRates: Record<string, number>): number {
  const multiplier = getInvoiceMultiplier(inv.tipo);
  if (inv.moneda === "ARS") {
    return inv.importeTotal * multiplier;
  }
  const rate = inv.xmlData?.exchangeRate || manualExchangeRates[inv.moneda] || 0;
  if (rate > 0) {
    return inv.importeTotal * rate * multiplier;
  }
  return 0;
}

export interface MonotributoPdfSums {
  totalPeriodoConsultado: number;
  totalVentanaRecategorizacion: number;
  hasFacturasEnVentana: boolean;
  recategorizacionLabel: string;
  ventanaDesde: MonthKey;
  ventanaHasta: MonthKey;
}

/**
 * Splits Monotributo context for the invoice PDF: full queried period (matches
 * Totales) vs official 12-month recategorization window (matches Monotributo
 * panel).
 */
export function computeMonotributoPdfSums(
  invoices: AFIPInvoice[],
  manualExchangeRates: Record<string, number> = {},
  today: Date = new Date()
): MonotributoPdfSums {
  const recateg = getNextRecategorizacionDates(today)[0];
  const windowMonths = new Set<MonthKey>(recateg.ventana);

  let totalPeriodoConsultado = 0;
  let totalVentanaRecategorizacion = 0;
  let hasFacturasEnVentana = false;

  for (const inv of invoices) {
    totalPeriodoConsultado += invoiceAmountPesos(inv, manualExchangeRates);

    const mKey = monthKeyForInvoice(inv.fecha);
    if (windowMonths.has(mKey)) {
      hasFacturasEnVentana = true;
      totalVentanaRecategorizacion += invoiceAmountPesos(inv, manualExchangeRates);
    }
  }

  const desde = recateg.ventana[0] ?? ("" as MonthKey);
  const hasta = recateg.ventana[recateg.ventana.length - 1] ?? ("" as MonthKey);
  return {
    totalPeriodoConsultado,
    totalVentanaRecategorizacion,
    hasFacturasEnVentana,
    recategorizacionLabel: recateg.label,
    ventanaDesde: desde,
    ventanaHasta: hasta,
  };
}

const MONTH_NAMES_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatWindowMonth(monthKey: MonthKey): string {
  const [y, m] = monthKey.split("-").map(Number);
  const label = m >= 1 && m <= 12 ? MONTH_NAMES_SHORT[m - 1] : monthKey;
  return `${label} ${y}`;
}

export function formatRecategorizacionLine(sums: MonotributoPdfSums): string {
  return `Recategorización ${sums.recategorizacionLabel} — ventana ${formatWindowMonth(sums.ventanaDesde)} a ${formatWindowMonth(
    sums.ventanaHasta
  )}`;
}
