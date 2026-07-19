import { describe, expect, it } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { computeAnnualIncome } from "./annual-income";

function inv(over: Partial<AFIPInvoice>): AFIPInvoice {
  return {
    fecha: "15/06/2026", tipo: "FACTURA C", tipoComprobante: 11, puntoVenta: 3, numero: 1,
    numeroCompleto: "00003-00000001", cuitReceptor: "", razonSocialReceptor: "",
    importeNeto: 0, importeTotal: 0, importeIVA: 0, moneda: "ARS",
    cae: "", vencimientoCae: "", cuitEmisor: "", razonSocialEmisor: "",
    ...over,
  } as AFIPInvoice;
}

describe("computeAnnualIncome", () => {
  it("suma facturas ARS dentro de la ventana", () => {
    const ventana = ["2026-06", "2026-05"];
    const r = computeAnnualIncome([inv({ importeTotal: 100000, fecha: "10/06/2026" }), inv({ importeTotal: 50000, fecha: "05/05/2026" })], {}, ventana);
    expect(r.ingresosAnuales).toBe(150000);
    expect(r.hasCurrentYearData).toBe(true);
  });
  it("ignora facturas fuera de la ventana", () => {
    const ventana = ["2026-06"];
    const r = computeAnnualIncome([inv({ importeTotal: 100000, fecha: "10/01/2025" })], {}, ventana);
    expect(r.ingresosAnuales).toBe(0);
    expect(r.hasCurrentYearData).toBe(false);
  });
  it("resta notas de crédito (multiplier -1)", () => {
    const ventana = ["2026-06"];
    const r = computeAnnualIncome([
      inv({ importeTotal: 100000, tipo: "FACTURA C", fecha: "10/06/2026" }),
      inv({ importeTotal: 30000, tipo: "NOTA DE CREDITO C", fecha: "12/06/2026" }),
    ], {}, ventana);
    expect(r.ingresosAnuales).toBe(70000);
  });
  it("convierte moneda extranjera con rate manual", () => {
    const ventana = ["2026-06"];
    const r = computeAnnualIncome([inv({ importeTotal: 100, moneda: "USD", fecha: "10/06/2026" })], { USD: 1000 }, ventana);
    expect(r.ingresosAnuales).toBe(100000);
  });
  it("sin facturas -> 0 y hasCurrentYearData false", () => {
    expect(computeAnnualIncome([], {}, ["2026-06"])).toEqual({ ingresosAnuales: 0, hasCurrentYearData: false });
  });
});
