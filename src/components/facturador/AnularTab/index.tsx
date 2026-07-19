"use client";

import { formatCurrency } from "@/components/InvoiceTable/utils/formatters";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { TIPO_OFICIAL } from "@/lib/facturador/codes";
import type { StoredInvoice } from "@/types/facturador";

export function AnularTab({ onVoid }: { onVoid: (inv: StoredInvoice) => void }) {
  const { state } = useInvoiceContext();
  const facturasC = state.invoices.filter(
    (i) => i.tipoComprobante === TIPO_OFICIAL.facturaC,
  ) as StoredInvoice[];

  if (facturasC.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No hay Facturas C para deshacer. Cuando emitas o traigas Facturas C, van a aparecer acá.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            <th className="px-3 py-2">Comprobante</th>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Receptor</th>
            <th className="px-3 py-2 text-right">Total</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {facturasC.map((inv) => (
            <tr key={inv.numeroCompleto} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-medium">{inv.numeroCompleto}</td>
              <td className="px-3 py-2">{inv.fecha}</td>
              <td className="px-3 py-2">{inv.razonSocialReceptor}</td>
              <td className="px-3 py-2 text-right">${formatCurrency(inv.importeTotal)}</td>
              <td className="px-3 py-2 text-right">
                <button
                  onClick={() => onVoid(inv)}
                  className="rounded-lg border border-[#FF6B5C]/50 bg-[#FF6B5C]/10 px-3 py-1.5 text-xs font-semibold text-[#FF6B5C] hover:bg-[#FF6B5C]/20 cursor-pointer"
                >
                  Deshacer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
