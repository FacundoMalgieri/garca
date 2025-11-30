import type { AFIPInvoice } from "@/types/afip-scraper";

import { getCurrencyBadgeClasses, getTypeBadgeClasses } from "../../utils/badges";
import { calculateTotalPesos, formatCurrency, formatInvoiceType, isForeignCurrency } from "../../utils/formatters";

interface InvoiceCardProps {
  invoice: AFIPInvoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const isForeign = isForeignCurrency(invoice.moneda);
  const exchangeRate = invoice.xmlData?.exchangeRate;
  const totalPesos = calculateTotalPesos(invoice.importeTotal, invoice.moneda, exchangeRate);

  return (
    <div className="rounded border border-border p-4 space-y-2">
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
        {isForeign && exchangeRate && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Tipo de cambio:</span>
            <span>${formatCurrency(exchangeRate)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium">
          <span>Total en Pesos:</span>
          <span>${formatCurrency(totalPesos)}</span>
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
