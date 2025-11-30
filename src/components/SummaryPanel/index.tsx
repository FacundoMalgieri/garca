"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useInvoiceContext } from "@/contexts/InvoiceContext";

/** Totals for a single currency */
interface CurrencyTotal {
  amount: number;
  amountInPesos: number;
  avgExchangeRate: number;
  count: number;
}

/** Totals for a period (month or year) */
interface PeriodTotals {
  byCurrency: Record<string, CurrencyTotal>;
  totalPesos: number;
}

export function SummaryPanel() {
  const { state } = useInvoiceContext();

  const { byMonth, byYear } = calculateTotals(state.invoices);

  const sortedMonths = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]));
  const sortedYears = Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0]));

  // For desktop table, we need to know all currencies used
  const allCurrencies = getAllCurrencies(byMonth, byYear);
  const foreignCurrencies = allCurrencies.filter((c) => c !== "ARS");

  return (
    <Card className="md:rounded-lg md:border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartIcon />
          Totales
        </CardTitle>
      </CardHeader>

      <CardContent>
        {sortedMonths.length === 0 && sortedYears.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">No hay datos para mostrar</div>
        ) : (
          <>
            {/* Desktop: Table View */}
            <div className="hidden md:block overflow-x-auto">
              <DesktopTable
                sortedMonths={sortedMonths}
                sortedYears={sortedYears}
                foreignCurrencies={foreignCurrencies}
              />
            </div>

            {/* Mobile: Card View */}
            <div className="md:hidden space-y-3">
              {sortedMonths.map(([monthKey, totals]) => (
                <MobileMonthCard key={monthKey} monthKey={monthKey} totals={totals} />
              ))}

              {sortedYears.map(([year, totals]) => (
                <MobileYearCard key={year} year={year} totals={totals} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Helper functions
// ============================================================================

function calculateTotals(
  invoices: { fecha: string; tipo: string; moneda: string; importeTotal: number; xmlData?: { exchangeRate?: number } }[]
): { byMonth: Record<string, PeriodTotals>; byYear: Record<string, PeriodTotals> } {
  const byMonth: Record<string, PeriodTotals> = {};
  const byYear: Record<string, PeriodTotals> = {};

  invoices.forEach((invoice) => {
    const [, month, year] = invoice.fecha.split("/");
    const monthKey = `${year}-${month}`;
    const yearKey = year;
    const currency = invoice.moneda;

    // Check if it's a credit note (should be subtracted)
    const isNotaCredito =
      invoice.tipo.toLowerCase().includes("nota de credito") || invoice.tipo.toLowerCase().includes("nota de crédito");
    const multiplier = isNotaCredito ? -1 : 1;

    const isForeign = currency !== "ARS";
    const exchangeRate = invoice.xmlData?.exchangeRate || 0;
    const amountInPesos = isForeign && exchangeRate ? invoice.importeTotal * exchangeRate * multiplier : invoice.importeTotal * multiplier;

    // Initialize month if needed
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { byCurrency: {}, totalPesos: 0 };
    }
    if (!byMonth[monthKey].byCurrency[currency]) {
      byMonth[monthKey].byCurrency[currency] = { amount: 0, amountInPesos: 0, avgExchangeRate: 0, count: 0 };
    }

    // Add to month
    byMonth[monthKey].byCurrency[currency].amount += invoice.importeTotal * multiplier;
    byMonth[monthKey].byCurrency[currency].amountInPesos += amountInPesos;
    byMonth[monthKey].totalPesos += amountInPesos;
    if (isForeign && exchangeRate > 0) {
      byMonth[monthKey].byCurrency[currency].avgExchangeRate += exchangeRate;
      byMonth[monthKey].byCurrency[currency].count += 1;
    }

    // Initialize year if needed
    if (!byYear[yearKey]) {
      byYear[yearKey] = { byCurrency: {}, totalPesos: 0 };
    }
    if (!byYear[yearKey].byCurrency[currency]) {
      byYear[yearKey].byCurrency[currency] = { amount: 0, amountInPesos: 0, avgExchangeRate: 0, count: 0 };
    }

    // Add to year
    byYear[yearKey].byCurrency[currency].amount += invoice.importeTotal * multiplier;
    byYear[yearKey].byCurrency[currency].amountInPesos += amountInPesos;
    byYear[yearKey].totalPesos += amountInPesos;
    if (isForeign && exchangeRate > 0) {
      byYear[yearKey].byCurrency[currency].avgExchangeRate += exchangeRate;
      byYear[yearKey].byCurrency[currency].count += 1;
    }
  });

  // Calculate average exchange rates
  const calculateAvgRates = (periods: Record<string, PeriodTotals>) => {
    Object.values(periods).forEach((period) => {
      Object.values(period.byCurrency).forEach((currencyData) => {
        if (currencyData.count > 0) {
          currencyData.avgExchangeRate = currencyData.avgExchangeRate / currencyData.count;
        }
      });
    });
  };

  calculateAvgRates(byMonth);
  calculateAvgRates(byYear);

  return { byMonth, byYear };
}

function getAllCurrencies(
  byMonth: Record<string, PeriodTotals>,
  byYear: Record<string, PeriodTotals>
): string[] {
  const currencies = new Set<string>();

  Object.values(byMonth).forEach((period) => {
    Object.keys(period.byCurrency).forEach((c) => currencies.add(c));
  });
  Object.values(byYear).forEach((period) => {
    Object.keys(period.byCurrency).forEach((c) => currencies.add(c));
  });

  // Sort: ARS first, then alphabetically
  return Array.from(currencies).sort((a, b) => {
    if (a === "ARS") return -1;
    if (b === "ARS") return 1;
    return a.localeCompare(b);
  });
}

function formatMonth(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================================================
// Desktop Table Component
// ============================================================================

interface DesktopTableProps {
  sortedMonths: [string, PeriodTotals][];
  sortedYears: [string, PeriodTotals][];
  foreignCurrencies: string[];
}

function DesktopTable({ sortedMonths, sortedYears, foreignCurrencies }: DesktopTableProps) {
  // Build columns dynamically based on currencies present
  const hasForeign = foreignCurrencies.length > 0;

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-t border-border text-left text-xs h-[61px]">
          <th className="py-3 px-4 font-semibold">Período</th>
          {foreignCurrencies.map((currency) => (
            <th key={currency} className="py-3 px-4 font-semibold text-right">
              {currency}
            </th>
          ))}
          <th className="py-3 px-4 font-semibold text-right">ARS</th>
          {hasForeign && <th className="py-3 px-4 font-semibold text-right">Extranjera en $</th>}
          {hasForeign && <th className="py-3 px-4 font-semibold text-right">TC Prom.</th>}
          <th className="py-3 px-4 font-semibold text-right">Total Pesos</th>
        </tr>
      </thead>
      <tbody>
        {sortedMonths.map(([monthKey, totals], index) => (
          <DesktopTableRow
            key={monthKey}
            period={formatMonth(monthKey)}
            totals={totals}
            foreignCurrencies={foreignCurrencies}
            isYear={false}
            index={index}
          />
        ))}
        {sortedYears.map(([year, totals], index) => (
          <DesktopTableRow
            key={year}
            period={`Total ${year}`}
            totals={totals}
            foreignCurrencies={foreignCurrencies}
            isYear={true}
            index={sortedMonths.length + index}
          />
        ))}
      </tbody>
    </table>
  );
}

interface DesktopTableRowProps {
  period: string;
  totals: PeriodTotals;
  foreignCurrencies: string[];
  isYear: boolean;
  index: number;
}

function DesktopTableRow({ period, totals, foreignCurrencies, isYear, index }: DesktopTableRowProps) {
  const hasForeign = foreignCurrencies.length > 0;

  // Calculate total foreign in pesos and weighted avg exchange rate
  let totalForeignInPesos = 0;
  let weightedExchangeRateSum = 0;
  let totalForeignCount = 0;

  foreignCurrencies.forEach((currency) => {
    const data = totals.byCurrency[currency];
    if (data) {
      totalForeignInPesos += data.amountInPesos;
      if (data.count > 0) {
        weightedExchangeRateSum += data.avgExchangeRate * data.count;
        totalForeignCount += data.count;
      }
    }
  });

  const avgExchangeRate = totalForeignCount > 0 ? weightedExchangeRateSum / totalForeignCount : 0;

  return (
    <tr
      className={`border-b border-border text-sm h-[61px] transition-colors ${
        isYear ? "bg-primary text-primary-foreground" : index % 2 === 0 ? "bg-muted/80" : ""
      } ${!isYear ? "hover:bg-primary/15" : ""}`}
    >
      <td className={`py-3 px-4 ${isYear ? "font-bold" : ""}`}>{period}</td>
      {foreignCurrencies.map((currency) => {
        const data = totals.byCurrency[currency];
        return (
          <td key={currency} className="text-right py-3 px-4 font-mono text-sm">
            {data && data.amount !== 0 ? formatCurrency(data.amount) : "-"}
          </td>
        );
      })}
      <td className="text-right py-3 px-4 font-mono text-sm">
        {totals.byCurrency.ARS?.amount ? formatCurrency(totals.byCurrency.ARS.amount) : "-"}
      </td>
      {hasForeign && (
        <td className="text-right py-3 px-4 font-mono text-sm">
          {totalForeignInPesos !== 0 ? formatCurrency(totalForeignInPesos) : "-"}
        </td>
      )}
      {hasForeign && (
        <td className="text-right py-3 px-4 font-mono text-sm">
          {avgExchangeRate > 0 ? formatCurrency(avgExchangeRate) : "-"}
        </td>
      )}
      <td className={`text-right py-3 px-4 font-mono font-medium ${isYear ? "text-base font-bold" : ""}`}>
        {formatCurrency(totals.totalPesos)}
      </td>
    </tr>
  );
}

// ============================================================================
// Mobile Card Components
// ============================================================================

function MobileMonthCard({ monthKey, totals }: { monthKey: string; totals: PeriodTotals }) {
  const foreignCurrencies = Object.keys(totals.byCurrency).filter((c) => c !== "ARS");

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4 flex flex-col">
      <div className="text-base font-semibold mb-3">{formatMonth(monthKey)}</div>
      <div className="space-y-2 text-sm">
        {/* Foreign currencies */}
        {foreignCurrencies.map((currency) => {
          const data = totals.byCurrency[currency];
          if (!data || data.amount === 0) return null;
          return (
            <div key={currency}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{currency}:</span>
                <span className="font-mono">{formatCurrency(data.amount)}</span>
              </div>
              {data.avgExchangeRate > 0 && (
                <div className="text-xs text-muted-foreground text-right">
                  TC: {formatCurrency(data.avgExchangeRate)}
                </div>
              )}
            </div>
          );
        })}

        {/* ARS */}
        {totals.byCurrency.ARS && totals.byCurrency.ARS.amount !== 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pesos:</span>
            <span className="font-mono">{formatCurrency(totals.byCurrency.ARS.amount)}</span>
          </div>
        )}
      </div>
      <div className="mt-auto">
        <div className="border-t border-border my-2"></div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Total en Pesos:</span>
          <span className="font-mono font-bold text-primary dark:text-white">{formatCurrency(totals.totalPesos)}</span>
        </div>
      </div>
    </div>
  );
}

function MobileYearCard({ year, totals }: { year: string; totals: PeriodTotals }) {
  const foreignCurrencies = Object.keys(totals.byCurrency).filter((c) => c !== "ARS");

  // Calculate weighted average exchange rate across all foreign currencies
  let weightedSum = 0;
  let totalCount = 0;
  foreignCurrencies.forEach((currency) => {
    const data = totals.byCurrency[currency];
    if (data && data.count > 0) {
      weightedSum += data.avgExchangeRate * data.count;
      totalCount += data.count;
    }
  });
  const overallAvgExchangeRate = totalCount > 0 ? weightedSum / totalCount : 0;

  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
      <div className="text-xl font-bold text-primary dark:text-white mb-3">Total {year}</div>
      <div className="space-y-3">
        {/* Foreign currencies - each with its conversion */}
        {foreignCurrencies.map((currency) => {
          const data = totals.byCurrency[currency];
          if (!data || data.amount === 0) return null;
          return (
            <div key={currency}>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">{currency}:</span>
                <span className="font-mono font-bold text-base">{formatCurrency(data.amount)}</span>
              </div>
              <div className="flex justify-end gap-1 items-center text-xs mt-1">
                <span className="text-muted-foreground">= en Pesos:</span>
                <span className="font-mono">{formatCurrency(data.amountInPesos)}</span>
              </div>
              {data.avgExchangeRate > 0 && (
                <div className="text-xs text-muted-foreground text-right italic">
                  TC prom: {formatCurrency(data.avgExchangeRate)}
                </div>
              )}
            </div>
          );
        })}

        {/* ARS */}
        {totals.byCurrency.ARS && totals.byCurrency.ARS.amount !== 0 && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Pesos:</span>
            <span className="font-mono font-bold text-base">{formatCurrency(totals.byCurrency.ARS.amount)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-primary/20 my-3"></div>

      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm">Total en Pesos:</span>
        <span className="font-mono font-bold text-xl text-primary dark:text-white">{formatCurrency(totals.totalPesos)}</span>
      </div>

      {foreignCurrencies.length > 0 && overallAvgExchangeRate > 0 && (
        <div className="mt-3 pt-2 border-t border-primary/20">
          <div className="text-xs text-muted-foreground italic">
            TC promedio del año: {formatCurrency(overallAvgExchangeRate)}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ChartIcon() {
  return (
    <svg className="h-5 w-5 text-primary dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}
