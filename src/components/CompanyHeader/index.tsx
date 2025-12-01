"use client";

import { useMemo, useState } from "react";

import { ExportDropdown } from "@/components/ExportDropdown";
import { LoadingSplash } from "@/components/LoadingSplash";
import { useInvoiceContext } from "@/contexts/InvoiceContext";

import { exportToCSV, exportToJSON, exportToPDF } from "../InvoiceTable/utils/exporters";

/**
 * Displays company information header with summary stats and export actions.
 */
export function CompanyHeader() {
  const { state, monotributoInfo } = useInvoiceContext();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const stats = useMemo(() => {
    if (state.invoices.length === 0) return null;

    // Calculate date range
    const dates = state.invoices.map((inv) => {
      const [day, month, year] = inv.fecha.split("/");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    });
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Calculate total in pesos
    let totalPesos = 0;
    state.invoices.forEach((inv) => {
      const exchangeRate = inv.xmlData?.exchangeRate || 0;
      const isForeign = inv.moneda !== "ARS";
      totalPesos += isForeign && exchangeRate ? inv.importeTotal * exchangeRate : inv.importeTotal;
    });

    // Count by currency
    const currencies = state.invoices.reduce(
      (acc, inv) => {
        acc[inv.moneda] = (acc[inv.moneda] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      dateRange: {
        from: minDate,
        to: maxDate,
      },
      totalPesos,
      currencies,
      count: state.invoices.length,
    };
  }, [state.invoices]);

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await exportToPDF(state.invoices, state.company, monotributoInfo);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtelo de nuevo.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportCSV = () => exportToCSV(state.invoices, state.company);
  const handleExportJSON = () => exportToJSON(state.invoices, state.company);

  if (!state.company) return null;

  return (
    <>
      {/* Splash screen during PDF generation */}
      {isGeneratingPDF && (
        <div id="pdf-loading-splash" className="fixed inset-0 z-50 bg-background">
          <LoadingSplash isLoading={true} message="Generando PDF" />
        </div>
      )}

      <div className="bg-white dark:bg-background md:rounded-lg px-4 py-4 md:p-6 shadow-md dark:shadow-none border-b md:border dark:border-border border-transparent md:border-primary/20">
        {/* Main info row */}
        <div className="flex items-start gap-3">
          <BuildingIcon className="h-5 w-5 text-primary dark:text-white flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg text-foreground truncate">{state.company.razonSocial}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-x-3">
              <p className="text-sm text-muted-foreground">CUIT: {formatCuit(state.company.cuit)}</p>
              {monotributoInfo && (
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="text-muted-foreground/50 hidden sm:inline">|</span>
                  <span>Categoría actual:</span>
                  <span className="font-semibold text-primary dark:text-white">
                    {monotributoInfo.categoria}
                  </span>
                  {monotributoInfo.tipoActividad && (
                    <span className="text-xs text-muted-foreground/80">
                      ({monotributoInfo.tipoActividad === "servicios" ? "Servicios" : "Venta de Bienes"})
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Export dropdown - positioned at the right */}
          {state.invoices.length > 0 && (
            <ExportDropdown
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              disabled={isGeneratingPDF}
            />
          )}
        </div>

        {/* Stats row */}
        {stats && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Period */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Período</p>
                <p className="text-sm font-medium mt-0.5 capitalize">
                  {formatShortDate(stats.dateRange.from)} - {formatShortDate(stats.dateRange.to)}
                </p>
              </div>

              {/* Comprobantes */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Comprobantes</p>
                <p className="text-sm font-medium mt-0.5">{stats.count}</p>
              </div>

              {/* Currencies */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Monedas</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {Object.entries(stats.currencies).map(([currency, count]) => (
                    <span
                      key={currency}
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        currency === "USD"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : currency === "EUR"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                      }`}
                    >
                      {currency} ({count})
                    </span>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total en Pesos</p>
                <p className="text-sm font-medium mt-0.5">${formatCurrency(stats.totalPesos)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function formatCuit(cuit: string): string {
  const clean = cuit.replace(/\D/g, "");
  if (clean.length === 11) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
  }
  return cuit;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("es-AR", { month: "short", year: "2-digit" }).replace(".", "");
}

function formatCurrency(value: number): string {
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}
