import { useInvoiceContext } from "@/contexts/InvoiceContext";
import type { AFIPInvoice } from "@/types/afip-scraper";

import { getCurrencyBadgeClasses, getTypeBadgeClasses } from "../../utils/badges";
import { calculateTotalPesos, formatCurrency, formatInvoiceType, isForeignCurrency } from "../../utils/formatters";

interface InvoiceCardProps {
  invoice: AFIPInvoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const { manualExchangeRates } = useInvoiceContext();
  const isForeign = isForeignCurrency(invoice.moneda);
  const xmlRate = invoice.xmlData?.exchangeRate;
  const manualRate = isForeign ? manualExchangeRates[invoice.moneda] : undefined;
  const effectiveRate = xmlRate || manualRate;
  const totalPesos = calculateTotalPesos(invoice.importeTotal, invoice.moneda, effectiveRate);
  const isManualRate = isForeign && !xmlRate && !!manualRate;
  const isMissingRate = isForeign && !xmlRate && !manualRate;

  return (
    <div className={`rounded border p-4 space-y-2 ${isMissingRate ? "border-amber-500/30" : "border-border"}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-muted-foreground mb-1">{invoice.fecha}</div>
          <div className="font-medium text-sm">{invoice.numeroCompleto}</div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded w-[72px] inline-flex justify-center ${getTypeBadgeClasses(invoice.tipo)}`}
        >
          {formatInvoiceType(invoice.tipo)}
        </span>
      </div>

      <div className="pt-2 border-t border-border space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Moneda:</span>
          <CurrencyBadge moneda={invoice.moneda} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total ({invoice.moneda}):</span>
          <span className="font-medium">
            {isForeign ? `${invoice.moneda} ` : "$"}
            {formatCurrency(invoice.importeTotal)}
          </span>
        </div>
        {isForeign && effectiveRate && (
          <div className="flex justify-between text-xs items-center">
            <span className={isManualRate ? "text-amber-500" : "text-muted-foreground"}>
              Tipo de cambio{isManualRate && " (manual)"}:
            </span>
            <span className={isManualRate ? "text-amber-500" : ""}>${formatCurrency(effectiveRate)}</span>
          </div>
        )}
        {isMissingRate && (
          <div className="flex justify-between text-xs items-center text-amber-500">
            <span className="flex items-center gap-1"><FxWarningIcon /> Tipo de cambio:</span>
            <span>Sin TC</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium">
          <span>Total en Pesos:</span>
          {isMissingRate ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <span>${formatCurrency(totalPesos)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CurrencyBadge({ moneda }: { moneda: string }) {
  return (
    <span
      className={`inline-flex text-xs px-2 py-1 rounded border font-medium w-[45px] justify-center ${getCurrencyBadgeClasses(moneda)}`}
    >
      {moneda}
    </span>
  );
}

function FxWarningIcon() {
  return (
    <span title="Sin tipo de cambio">
      <svg className="h-3.5 w-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </span>
  );
}
