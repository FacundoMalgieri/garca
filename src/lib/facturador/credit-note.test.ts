import { describe, expect, it } from "vitest";

import { buildCreditNote } from "@/lib/facturador/credit-note";
import type { StoredInvoice } from "@/types/facturador";

const base: StoredInvoice = {
  fecha: "10/06/2026",
  tipo: "FACTURA C",
  tipoComprobante: 11,
  puntoVenta: 3,
  numero: 89,
  numeroCompleto: "0003-00000089",
  cuitEmisor: "20354104076",
  razonSocialEmisor: "MALGIERI FACUNDO ARIEL",
  cuitReceptor: "30707915281",
  razonSocialReceptor: "GSA COLLECTIONS ARGENTINA SA",
  importeNeto: 180000,
  importeIVA: 0,
  importeTotal: 180000,
  moneda: "ARS",
  emittedByGarca: true,
};

describe("buildCreditNote", () => {
  it("arma una línea sintética por el total del original", () => {
    const { plantilla } = buildCreditNote({ original: base, condicionIVA: "1" });
    expect(plantilla.lineas).toEqual([
      { descripcion: "Anulación Factura C 0003-00000089", cantidad: 1, unidad: "7", precioUnitario: 180000 },
    ]);
  });

  it("universo NC (4) y asociado con PV/Nro zero-padded (RCEL exige 5 y 8 dígitos)", () => {
    const { opts } = buildCreditNote({ original: base, condicionIVA: "1" });
    expect(opts.universo).toBe("4");
    expect(opts.asociado).toEqual({ tipo: "11", puntoVenta: "00003", numero: "00000089", fecha: "10/06/2026" });
  });

  it("asociado: padding con números más largos no trunca", () => {
    const original = { ...base, puntoVenta: 12345, numero: 12345678 };
    const { opts } = buildCreditNote({ original, condicionIVA: "1" });
    expect(opts.asociado).toEqual({ tipo: "11", puntoVenta: "12345", numero: "12345678", fecha: "10/06/2026" });
  });

  it("concepto productos (evita bloque de período)", () => {
    const { plantilla } = buildCreditNote({ original: base, condicionIVA: "1" });
    expect(plantilla.concepto).toBe("productos");
    expect(plantilla.periodo).toBeUndefined();
  });

  it("receptor: CUIT válido → tipoDoc 80; usa la condicionIVA pasada", () => {
    const { plantilla } = buildCreditNote({ original: base, condicionIVA: "6" });
    expect(plantilla.cliente.tipoDoc).toBe("80");
    expect(plantilla.cliente.nroDoc).toBe("30707915281");
    expect(plantilla.cliente.razonSocial).toBe("GSA COLLECTIONS ARGENTINA SA");
    expect(plantilla.cliente.condicionIVA).toBe("6");
  });

  it("receptor: sin CUIT válido → Consumidor Final sin documento", () => {
    const original = { ...base, cuitReceptor: "0", razonSocialReceptor: "Consumidor Final" };
    const { plantilla } = buildCreditNote({ original, condicionIVA: "5" });
    expect(plantilla.cliente.condicionIVA).toBe("5");
    expect(plantilla.cliente.nroDoc).toBe("");
  });

  it("condicionVenta default Contado (1)", () => {
    const { plantilla } = buildCreditNote({ original: base, condicionIVA: "1" });
    expect(plantilla.cliente.condicionVenta).toEqual(["1"]);
  });

  it("puntoDeVenta de la plantilla = PV del original como string", () => {
    const { plantilla } = buildCreditNote({ original: base, condicionIVA: "1" });
    expect(plantilla.puntoDeVenta).toBe("3");
  });

  it("[M4] NC contra Factura C: asociado.tipo=11 y línea 'Anulación Factura C'", () => {
    const { plantilla, opts } = buildCreditNote({ original: base, condicionIVA: "1" });
    expect(opts.asociado!.tipo).toBe("11");
    expect(plantilla.lineas[0].descripcion).toBe("Anulación Factura C 0003-00000089");
  });

  it("[M4] NC contra Nota de Débito C: asociado.tipo=12 y línea con el tipo real", () => {
    const original: StoredInvoice = { ...base, tipo: "NOTA DE DEBITO C", tipoComprobante: 12 };
    const { plantilla, opts } = buildCreditNote({ original, condicionIVA: "1" });
    expect(opts.asociado!.tipo).toBe("12");
    expect(plantilla.lineas[0].descripcion).toBe("Anulación Nota de Débito C 0003-00000089");
  });

  it("[M4] asociado.tipo deriva del original, no hardcodea Factura C", () => {
    const original: StoredInvoice = { ...base, tipoComprobante: 13 };
    const { plantilla, opts } = buildCreditNote({ original, condicionIVA: "1" });
    expect(opts.asociado!.tipo).toBe("13");
    expect(plantilla.lineas[0].descripcion).toBe("Anulación Nota de Crédito C 0003-00000089");
  });
});
