import { describe, expect, it } from "vitest";

import { lastInvoiceFor } from "@/hooks/useEmittedRepeat";
import type { AFIPInvoice } from "@/types/afip-scraper";

function inv(p: Partial<AFIPInvoice>): AFIPInvoice {
  return {
    fecha: "01/06/2026", tipo: "FACTURA C", tipoComprobante: 11, puntoVenta: 3, numero: 1,
    numeroCompleto: "00003-00000001", cuitEmisor: "20354104076", razonSocialEmisor: "YO",
    cuitReceptor: "30707915281", razonSocialReceptor: "GSA", importeNeto: 1, importeIVA: 0,
    importeTotal: 1, moneda: "PES", ...p,
  };
}

describe("lastInvoiceFor", () => {
  it("devuelve la factura más reciente para el CUIT receptor", () => {
    const list = [
      inv({ numero: 1, fecha: "01/05/2026" }),
      inv({ numero: 2, fecha: "03/07/2026" }),
      inv({ numero: 3, fecha: "10/06/2026" }),
    ];
    expect(lastInvoiceFor(list, "30707915281")?.numero).toBe(2);
  });

  it("null si no hay facturas para ese CUIT", () => {
    expect(lastInvoiceFor([inv({})], "99999999999")).toBeNull();
  });

  it("ignora otros receptores", () => {
    const list = [inv({ numero: 1, cuitReceptor: "30707915281", fecha: "01/07/2026" }), inv({ numero: 2, cuitReceptor: "20111111112", fecha: "02/07/2026" })];
    expect(lastInvoiceFor(list, "30707915281")?.numero).toBe(1);
  });
});
