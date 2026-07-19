import { describe, expect, it } from "vitest";

import { buildClientIndex, resolveClient } from "@/lib/facturador/client-index";
import type { AFIPInvoice } from "@/types/afip-scraper";

const inv = (over: Partial<AFIPInvoice>): AFIPInvoice => ({
  fecha: "10/06/2026", tipo: "FACTURA C", tipoComprobante: 11, puntoVenta: 3, numero: 1,
  numeroCompleto: "0003-00000001", cuitEmisor: "20301234563", razonSocialEmisor: "YO",
  cuitReceptor: "30707915281", razonSocialReceptor: "GSA SA",
  importeNeto: 100, importeIVA: 0, importeTotal: 100, moneda: "ARS", ...over,
});

describe("client-index", () => {
  it("razón social del historial por cuitReceptor", () => {
    const idx = buildClientIndex([inv({})], {});
    expect(resolveClient(idx, "30707915281")).toEqual({ razonSocial: "GSA SA" });
  });

  it("la memoria aporta condición IVA/venta y pisa razón social", () => {
    const idx = buildClientIndex([inv({})], {
      "30707915281": { razonSocial: "GSA COLLECTIONS SA", condicionIVA: "1", condicionVenta: ["6"] },
    });
    expect(resolveClient(idx, "30707915281")).toEqual({
      razonSocial: "GSA COLLECTIONS SA", condicionIVA: "1", condicionVenta: ["6"],
    });
  });

  it("ignora receptores sin doc válido", () => {
    const idx = buildClientIndex([inv({ cuitReceptor: "0", razonSocialReceptor: "Consumidor Final" })], {});
    expect(Object.keys(idx)).toEqual([]);
  });

  it("resolveClient devuelve null para doc desconocido", () => {
    expect(resolveClient({}, "99999999999")).toBeNull();
  });
});
