import type { AFIPInvoice } from "@/types/afip-scraper";

import { getCurrencyBadgeClasses, getTypeBadgeClasses } from "../../utils/badges";
import { calculateTotalPesos, formatCurrency, formatInvoiceType, isForeignCurrency } from "../../utils/formatters";

interface InvoiceRowProps {
  invoice: AFIPInvoice;
  index: number;
}

export function InvoiceRow({ invoice, index }: InvoiceRowProps) {
  const isForeign = isForeignCurrency(invoice.moneda);
  const exchangeRate = invoice.xmlData?.exchangeRate;
  const totalPesos = calculateTotalPesos(invoice.importeTotal, invoice.moneda, exchangeRate);

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
        {isForeign && exchangeRate && (
          <div className="text-xs text-muted-foreground font-normal">TC: ${formatCurrency(exchangeRate)}</div>
        )}
      </td>
      <td className="py-3 px-4 text-right font-medium">${formatCurrency(totalPesos)}</td>
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
