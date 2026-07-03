import { describe, expect,it } from "vitest";

import { dedupeInvoices,invoiceKey } from "@/lib/facturador/dedupe";
import type { AFIPInvoice } from "@/types/afip-scraper";

function inv(partial: Partial<AFIPInvoice>): AFIPInvoice {
  return {
    fecha: "03/07/2026", tipo: "FACTURA C", tipoComprobante: 11,
    puntoVenta: 3, numero: 88, numeroCompleto: "00003-00000088",
    cuitEmisor: "20354104076", razonSocialEmisor: "YO",
    cuitReceptor: "30707915281", razonSocialReceptor: "GSA",
    importeNeto: 3500000, importeIVA: 0, importeTotal: 3500000, moneda: "PES",
    ...partial,
  };
}

describe("dedupe", () => {
  it("invoiceKey combina tipo+pv+numero", () => {
    expect(invoiceKey(inv({}))).toBe("11-3-88");
  });

  it("mergea prefiriendo la versión existente (emitida por GARCA)", () => {
    const emitida = { ...inv({}), emittedByGarca: true } as AFIPInvoice;
    const scrapeada = inv({ estado: "APROBADO" });
    const result = dedupeInvoices([emitida], [scrapeada]);
    expect(result).toHaveLength(1);
    expect((result[0] as { emittedByGarca?: boolean }).emittedByGarca).toBe(true);
  });

  it("suma facturas distintas", () => {
    const a = inv({ numero: 88, numeroCompleto: "00003-00000088" });
    const b = inv({ numero: 89, numeroCompleto: "00003-00000089" });
    expect(dedupeInvoices([a], [b])).toHaveLength(2);
  });
});
