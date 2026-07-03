import { describe, expect,it } from "vitest";

import type { EmissionPreview, EmissionResult, EmittedInvoice,Plantilla,StoredInvoice } from "@/types/facturador";

describe("facturador types", () => {
  it("permite construir una Plantilla válida", () => {
    const p: Plantilla = {
      id: "t1",
      nombre: "GSA mensual",
      puntoDeVenta: "3",
      concepto: "servicios",
      cliente: {
        condicionIVA: "1",
        tipoDoc: "80",
        nroDoc: "30707915281",
        razonSocial: "GSA COLLECTIONS ARGENTINA SA",
        condicionVenta: ["6"],
      },
      lineas: [
        { descripcion: "Por 120 horas de servicios", cantidad: 1, unidad: "7", precioUnitario: 3500000 },
      ],
    };
    expect(p.lineas[0].precioUnitario).toBe(3500000);
  });

  it("EmittedInvoice extiende AFIPInvoice con flag emittedByGarca", () => {
    const e: Pick<EmittedInvoice, "emittedByGarca" | "numeroCompleto"> = {
      emittedByGarca: true,
      numeroCompleto: "00003-00000088",
    };
    expect(e.emittedByGarca).toBe(true);
  });

  it("StoredInvoice acepta emittedByGarca boolean (round-trip localStorage)", () => {
    const raw: Pick<StoredInvoice, "emittedByGarca"> = { emittedByGarca: false };
    expect(raw.emittedByGarca).toBe(false);
  });

  it("EmissionPreview y EmissionResult tienen la forma esperada", () => {
    const preview: EmissionPreview = {
      puntoVenta: "3",
      tipoComprobante: 11,
      emisor: { razonSocial: "YO", puntoVenta: "00003", domicilio: "x", concepto: "Servicios" },
      receptor: { cuit: "30707915281", razonSocial: "GSA", domicilio: "y", email: "", condicionIVA: "IVA Responsable Inscripto", condicionVenta: "Transferencia Bancaria" },
      lineas: [{ codigo: "", descripcion: "Serv", cantidad: 1, unidad: "unidades", precioUnitario: 3500000, porcentajeBonificacion: 0, importeBonificacion: 0, subtotal: 3500000 }],
      subtotal: 3500000,
      importeOtrosTributos: 0,
      importeTotal: 3500000,
      html: "<html/>",
    };
    const result: EmissionResult = { ...preview, numeroCompleto: "00003-00000089", cae: "123", vencimientoCae: "13/07/2026" };
    expect(result.cae).toBe("123");
  });
});
