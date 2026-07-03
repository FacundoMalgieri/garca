import { describe, it, expect } from "vitest";
import type { Plantilla, EmittedInvoice } from "@/types/facturador";

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
});
