import { useInvoiceContext } from "@/contexts/InvoiceContext";
import type { AFIPInvoice } from "@/types/afip-scraper";

import { getCurrencyBadgeClasses, getTypeBadgeClasses } from "../../utils/badges";
import { calculateTotalPesos, formatCurrency, formatInvoiceType, isForeignCurrency } from "../../utils/formatters";

interface InvoiceRowProps {
  invoice: AFIPInvoice;
  index: number;
}

export function InvoiceRow({ invoice, index }: InvoiceRowProps) {
  const { manualExchangeRates } = useInvoiceContext();
  const isForeign = isForeignCurrency(invoice.moneda);
  const xmlRate = invoice.xmlData?.exchangeRate;
  const manualRate = isForeign ? manualExchangeRates[invoice.moneda] : undefined;
  const effectiveRate = xmlRate || manualRate;
  const totalPesos = calculateTotalPesos(invoice.importeTotal, invoice.moneda, effectiveRate);
  const isManualRate = isForeign && !xmlRate && !!manualRate;
  const isMissingRate = isForeign && !xmlRate && !manualRate;

  return (
    <tr
      className={`border-b border-border text-sm h-[65px] transition-colors ${
        index % 2 === 0 ? "bg-muted/80" : ""
      } hover:bg-primary/15`}
    >
      <td className="py-3 px-4">{invoice.fecha}</td>
      <td className="py-3 px-4">
        <span
          className={`text-xs px-2 py-1 rounded w-[72px] inline-flex justify-center ${getTypeBadgeClasses(invoice.tipo)}`}
        >
          {formatInvoiceType(invoice.tipo)}
        </span>
      </td>
      <td className="py-3 px-4 font-mono text-xs">{invoice.numeroCompleto}</td>
      <td className="py-3 px-4">
        <CurrencyBadge moneda={invoice.moneda} />
      </td>
      <td className="py-3 px-4 text-right font-medium">
        {isForeign ? `${invoice.moneda} ` : "$"}
        {formatCurrency(invoice.importeTotal)}
        {isForeign && effectiveRate && (
          <div className={`text-xs font-normal ${isManualRate ? "text-amber-500" : "text-muted-foreground"}`}>
            TC: ${formatCurrency(effectiveRate)}{isManualRate && " (manual)"}
          </div>
        )}
        {isMissingRate && (
          <div className="text-xs text-amber-500 font-normal flex items-center justify-end gap-1">
            <FxWarningIcon /> Sin TC
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-right font-medium">
        {isMissingRate ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          `$${formatCurrency(totalPesos)}`
        )}
      </td>
    </tr>
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

