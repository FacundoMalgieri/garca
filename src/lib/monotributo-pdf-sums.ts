import { invoiceAmountInPesos } from "@/lib/facturador/invoice-amount";
import {
  annualizeWindowTotal,
  countClosedMonths,
  getLastRecategorizacionDate,
  getNextRecategorizacionDates,
} from "@/lib/projection";
import type { AFIPInvoice } from "@/types/afip-scraper";
import type { MonthKey } from "@/types/projection";

function parseInvoiceDate(fecha: string): Date {
  const [day, month, year] = fecha.split("/");
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
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
  return invoiceAmountInPesos(inv, manualExchangeRates).amount;
}

export interface MonotributoPdfSums {
  totalPeriodoConsultado: number;
  /** Acumulado de la ventana en curso (puede ser parcial) */
  totalVentanaRecategorizacion: number;
  hasFacturasEnVentana: boolean;
  recategorizacionLabel: string;
  ventanaDesde: MonthKey;
  ventanaHasta: MonthKey;
  /** Meses de la ventana en curso ya cerrados */
  mesesCerrados: number;
  totalMeses: number;
  ventanaCompleta: boolean;
  /** Acumulado de la ventana en curso extrapolado a 12 meses (null sin meses cerrados) */
  totalVentanaAnualizado: number | null;
  /** Última ventana YA CERRADA: la que define la categoría vigente */
  totalVentanaCerrada: number;
  hasFacturasEnVentanaCerrada: boolean;
  ventanaCerradaLabel: string;
  ventanaCerradaDesde: MonthKey;
  ventanaCerradaHasta: MonthKey;
}

/**
 * Splits Monotributo context for the invoice PDF: full queried period (matches
 * Totales), the recategorization window in progress, and the last CLOSED window
 * — the only one that defines the category in force (matches Monotributo panel).
 */
export function computeMonotributoPdfSums(
  invoices: AFIPInvoice[],
  manualExchangeRates: Record<string, number> = {},
  today: Date = new Date()
): MonotributoPdfSums {
  const recateg = getNextRecategorizacionDates(today)[0];
  const cerrada = getLastRecategorizacionDate(today);
  const windowMonths = new Set<MonthKey>(recateg.ventana);
  const closedWindowMonths = new Set<MonthKey>(cerrada.ventana);

  let totalPeriodoConsultado = 0;
  let totalVentanaRecategorizacion = 0;
  let hasFacturasEnVentana = false;
  let totalVentanaCerrada = 0;
  let hasFacturasEnVentanaCerrada = false;

  for (const inv of invoices) {
    const amount = invoiceAmountPesos(inv, manualExchangeRates);
    totalPeriodoConsultado += amount;

    const mKey = monthKeyForInvoice(inv.fecha);
    if (windowMonths.has(mKey)) {
      hasFacturasEnVentana = true;
      totalVentanaRecategorizacion += amount;
    }
    if (closedWindowMonths.has(mKey)) {
      hasFacturasEnVentanaCerrada = true;
      totalVentanaCerrada += amount;
    }
  }

  const desde = recateg.ventana[0] ?? ("" as MonthKey);
  const hasta = recateg.ventana[recateg.ventana.length - 1] ?? ("" as MonthKey);
  const totalMeses = recateg.ventana.length;
  const mesesCerrados = countClosedMonths(recateg.ventana, today);

  return {
    totalPeriodoConsultado,
    totalVentanaRecategorizacion,
    hasFacturasEnVentana,
    recategorizacionLabel: recateg.label,
    ventanaDesde: desde,
    ventanaHasta: hasta,
    mesesCerrados,
    totalMeses,
    ventanaCompleta: mesesCerrados >= totalMeses,
    totalVentanaAnualizado: annualizeWindowTotal(totalVentanaRecategorizacion, mesesCerrados, totalMeses),
    totalVentanaCerrada,
    hasFacturasEnVentanaCerrada,
    ventanaCerradaLabel: cerrada.label,
    ventanaCerradaDesde: cerrada.ventana[0] ?? ("" as MonthKey),
    ventanaCerradaHasta: cerrada.ventana[cerrada.ventana.length - 1] ?? ("" as MonthKey),
  };
}

const MONTH_NAMES_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatWindowMonth(monthKey: MonthKey): string {
  const [y, m] = monthKey.split("-").map(Number);
  const label = m >= 1 && m <= 12 ? MONTH_NAMES_SHORT[m - 1] : monthKey;
  return `${label} ${y}`;
}

export function formatRecategorizacionLine(sums: MonotributoPdfSums): string {
  const ventana = `Recategorización ${sums.recategorizacionLabel} — ventana ${formatWindowMonth(sums.ventanaDesde)} a ${formatWindowMonth(
    sums.ventanaHasta
  )}`;
  if (sums.ventanaCompleta) return ventana;
  return `${ventana} (${sums.mesesCerrados} de ${sums.totalMeses} meses facturados)`;
}

/** Ventana cerrada que define la categoría vigente cuando ARCA no la informa. */
export function formatVentanaVigenteLine(sums: MonotributoPdfSums): string {
  return `Categoría vigente según ${formatWindowMonth(sums.ventanaCerradaDesde)} a ${formatWindowMonth(
    sums.ventanaCerradaHasta
  )} (recategorización ${sums.ventanaCerradaLabel})`;
}
