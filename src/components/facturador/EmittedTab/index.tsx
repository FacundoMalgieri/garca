"use client";

import { InvoiceTable } from "@/components/InvoiceTable";
import { useInvoiceContext } from "@/contexts/InvoiceContext";

export function EmittedTab() {
  const { state } = useInvoiceContext();
  const emitted = state.invoices.filter((i) => (i as { emittedByGarca?: boolean }).emittedByGarca);

  if (emitted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no emitiste facturas desde GARCA. Cuando emitas, van a aparecer acá.
      </div>
    );
  }

  return <InvoiceTable invoices={emitted} />;
}
