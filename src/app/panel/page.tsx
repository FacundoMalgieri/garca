"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ChartsPanel } from "@/components/ChartsPanel";
import { CompanyHeader } from "@/components/CompanyHeader";
import { InvoiceTable } from "@/components/InvoiceTable";
import { MonotributoPanel } from "@/components/MonotributoPanel";
import { ProjectionPanel } from "@/components/ProjectionPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useMonotributo } from "@/hooks/useMonotributo";

function parseInvoiceDate(fecha: string): Date {
  const [day, month, year] = fecha.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function getInvoiceMultiplier(tipo: string): number {
  const lower = tipo.toLowerCase();
  if (lower.includes("nota de credito") || lower.includes("nota de crédito")) return -1;
  return 1;
}

interface FxCurrencyInfo {
  count: number;
  totalFaceValue: number;
}

export default function PanelPage() {
  const router = useRouter();
  const { state, manualExchangeRates, setManualExchangeRate, clearInvoices } = useInvoiceContext();

  const { ingresosAnuales, hasCurrentYearData, fxCurrenciesNeedingRate } = useMemo(() => {
    if (state.invoices.length === 0)
      return { ingresosAnuales: 0, hasCurrentYearData: false, fxCurrenciesNeedingRate: {} as Record<string, FxCurrencyInfo> };

    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    let total = 0;
    let hasRecent = false;

    // Count FX invoices needing rates across ALL invoices (not just 12-month window)
    const needingRate: Record<string, FxCurrencyInfo> = {};
    for (const inv of state.invoices) {
      if (inv.moneda !== "ARS" && !inv.xmlData?.exchangeRate) {
        if (!needingRate[inv.moneda]) needingRate[inv.moneda] = { count: 0, totalFaceValue: 0 };
        needingRate[inv.moneda].count++;
        needingRate[inv.moneda].totalFaceValue += inv.importeTotal;
      }
    }

    // Income calculation within the 12-month window
    for (const inv of state.invoices) {
      const d = parseInvoiceDate(inv.fecha);
      if (d >= twelveMonthsAgo && d <= today) {
        hasRecent = true;
        const multiplier = getInvoiceMultiplier(inv.tipo);
        if (inv.moneda === "ARS") {
          total += inv.importeTotal * multiplier;
        } else if (inv.xmlData?.exchangeRate) {
          total += inv.importeTotal * inv.xmlData.exchangeRate * multiplier;
        } else {
          const manualRate = manualExchangeRates[inv.moneda];
          if (manualRate && manualRate > 0) {
            total += inv.importeTotal * manualRate * multiplier;
          }
        }
      }
    }
    return { ingresosAnuales: total, hasCurrentYearData: hasRecent, fxCurrenciesNeedingRate: needingRate };
  }, [state.invoices, manualExchangeRates]);

  const { data: monotributoData, tipoActividad } = useMonotributo(hasCurrentYearData ? ingresosAnuales : 0);

  // Si no hay facturas, redirigir a /ingresar
  useEffect(() => {
    if (!state.isLoading && state.invoices.length === 0) {
      router.push("/ingresar");
    }
  }, [state.isLoading, state.invoices.length, router]);

  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (state.invoices.length === 0) {
    return null; // El useEffect redirigirá
  }

  const isDemo = state.company?.razonSocial?.includes("(Demo)") ?? false;

  return (
    <div className="w-full pt-4 pb-0 md:py-8 space-y-4 md:space-y-8 max-w-[1920px] mx-auto px-0 md:px-6">
      {/* Demo banner */}
      {isDemo && (
        <div className="mx-4 md:mx-0 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary dark:text-primary-foreground flex flex-wrap items-center justify-between gap-2">
          <span>
            Estás viendo una <strong>demo</strong> con datos ficticios. Para cargar tus datos reales,{" "}
            <button
              type="button"
              onClick={() => { clearInvoices(); router.push("/ingresar"); }}
              className="underline underline-offset-2 font-medium hover:opacity-80 cursor-pointer"
            >
              limpiá los datos e ingresá con tu clave fiscal
            </button>.
          </span>
        </div>
      )}

      {/* Company Header */}
      <section className="md:px-0">
        <CompanyHeader />
      </section>

      {/* FX manual exchange rate banner */}
      {Object.keys(fxCurrenciesNeedingRate).length > 0 && (
        <FxRateBanner
          currencies={fxCurrenciesNeedingRate}
          manualRates={manualExchangeRates}
          onUpdateRate={setManualExchangeRate}
        />
      )}

      {/* Monotributo + Análisis Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <section id="monotributo">
          <MonotributoPanel 
            ingresosAnuales={ingresosAnuales} 
            isCurrentYearData={hasCurrentYearData}
          />
        </section>
        <section id="graficos">
          <ChartsPanel 
            monotributoData={monotributoData} 
            ingresosAnuales={ingresosAnuales}
            isCurrentYearData={hasCurrentYearData}
          />
        </section>
      </div>

      {/* Totales */}
      <section id="totales">
        <SummaryPanel />
      </section>

      {/* Support */}
      <section className="px-4 md:px-0">
        <SupportBanner />
      </section>

      {/* Proyectar */}
      <section id="proyectar">
        <ProjectionPanel tipoActividad={tipoActividad} />
      </section>

      {/* Facturas (al final para evitar scroll infinito en mobile) */}
      <section id="facturas">
        <InvoiceTable />
      </section>
    </div>
  );
}

// ============ FX Rate Banner ============

function FxRateBanner({
  currencies,
  manualRates,
  onUpdateRate,
}: {
  currencies: Record<string, FxCurrencyInfo>;
  manualRates: Record<string, number>;
  onUpdateRate: (currency: string, rate: number) => void;
}) {
  const entries = Object.entries(currencies);
  const totalCount = entries.reduce((sum, [, v]) => sum + v.count, 0);
  const allResolved = entries.every(([cur]) => manualRates[cur] > 0);
  const [editing, setEditing] = useState(!allResolved);
  const [draft, setDraft] = useState<Record<string, number>>(() =>
    Object.fromEntries(entries.map(([c]) => [c, manualRates[c] || 0]))
  );

  const handleSave = () => {
    for (const [currency] of entries) {
      onUpdateRate(currency, draft[currency] || 0);
    }
    setEditing(false);
  };

  // Show edit form when rates become unresolved
  useEffect(() => {
    if (!allResolved) setEditing(true);
  }, [allResolved]);

  if (allResolved && !editing) {
    return (
      <div className="mx-4 md:mx-0 rounded-lg border px-4 py-3 bg-emerald-500/10 border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-emerald-700 dark:text-emerald-400">
          <span className="font-medium">✓ TC manual aplicado</span>
          {entries.map(([c]) => (
            <span key={c} className="text-xs font-mono">{c} = ${manualRates[c].toLocaleString("es-AR")}</span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer shrink-0"
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 md:mx-0 rounded-lg border bg-amber-500/10 border-amber-500/30 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-2 text-amber-700 dark:text-amber-400">
        <span className="mt-0.5"><FxAlertIcon /></span>
        <div>
          <p className="text-sm font-medium">{totalCount} factura{totalCount > 1 ? "s" : ""} en moneda extranjera sin tipo de cambio.</p>
          <p className="text-xs mt-1 opacity-80">Algunas facturas de exportación no incluyen el tipo de cambio en los datos de ARCA. Ingresá la cotización del día de emisión de cada factura para incluirlas en el cálculo.</p>
        </div>
      </div>

      {/* Inputs grid */}
      <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {entries.map(([currency, { count, totalFaceValue }]) => (
          <FxRateInput
            key={currency}
            currency={currency}
            count={count}
            totalFaceValue={totalFaceValue}
            value={draft[currency] || 0}
            onChange={(v) => setDraft(prev => ({ ...prev, [currency]: v }))}
            onEnter={handleSave}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-amber-500/20 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-1.5 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

function FxAlertIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function fmtRate(v: number): string {
  if (!v) return "";
  return v.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function parseRate(s: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
}

function FxRateInput({
  currency,
  count,
  totalFaceValue,
  value,
  onChange,
  onEnter,
}: {
  currency: string;
  count: number;
  totalFaceValue: number;
  value: number;
  onChange: (v: number) => void;
  onEnter: () => void;
}) {
  const [display, setDisplay] = useState(fmtRate(value));
  const hasRate = value > 0;

  useEffect(() => {
    setDisplay(fmtRate(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<React.ElementRef<"input">>) => {
    const raw = e.target.value.replace(/^\$\s*/, "");
    const cleaned = raw.replace(/[^\d.,]/g, "");
    setDisplay(cleaned);
    onChange(parseRate(cleaned));
  };

  const handleBlur = () => {
    const num = parseRate(display);
    setDisplay(fmtRate(num));
  };

  return (
    <div className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{currency}</span>
        <span className="text-xs text-muted-foreground">
          {count} fact. — {currency} {totalFaceValue.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">1 {currency} =</span>
        <input
          type="text"
          inputMode="decimal"
          value={display ? `$ ${display}` : ""}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
          placeholder="$ 1.200"
          className={`w-full px-2.5 py-1.5 text-base md:text-sm font-mono rounded-lg border bg-background focus:outline-none focus:ring-2 transition-colors ${
            hasRate
              ? "border-emerald-500/40 focus:ring-emerald-500/50"
              : "border-amber-500/30 focus:ring-amber-500/50"
          }`}
        />
      </div>
    </div>
  );
}
