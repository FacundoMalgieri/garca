import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseResumen } from "@/lib/facturador/resumen-parser";

const html = readFileSync(join(__dirname, "__fixtures__/resumen.html"), "utf8");
const preview = parseResumen(html, { puntoVenta: "3", tipoComprobante: 11 });

describe("parseResumen", () => {
  it("meta y totales", () => {
    expect(preview.puntoVenta).toBe("3");
    expect(preview.tipoComprobante).toBe(11);
    expect(preview.subtotal).toBe(1000);
    expect(preview.importeOtrosTributos).toBe(0);
    expect(preview.importeTotal).toBe(1000);
  });

  it("datos del emisor (incluye período y vto)", () => {
    expect(preview.emisor.razonSocial).toBe("MALGIERI FACUNDO ARIEL");
    expect(preview.emisor.puntoVenta).toBe("00003");
    expect(preview.emisor.concepto).toBe("Servicios");
    expect(preview.emisor.periodoDesde).toBe("01/06/2026");
    expect(preview.emisor.periodoHasta).toBe("30/06/2026");
    expect(preview.emisor.vtoPago).toBe("13/07/2026");
  });

  it("datos del receptor (scopeados, no confunde con el emisor)", () => {
    expect(preview.receptor.razonSocial).toBe("GSA COLLECTIONS ARGENTINA SA");
    expect(preview.receptor.razonSocial).not.toContain("MALGIERI");
    expect(preview.receptor.cuit).toBe("30707915281");
    expect(preview.receptor.domicilio).toContain("Belgrano 2687");
    expect(preview.receptor.condicionIVA).toBe("IVA Responsable Inscripto");
    expect(preview.receptor.condicionVenta).toBe("Transferencia Bancaria");
  });

  it("líneas del detalle completas (8 columnas)", () => {
    expect(preview.lineas).toHaveLength(1);
    const l = preview.lineas[0];
    expect(l.descripcion).toContain("120 horas");
    expect(l.cantidad).toBe(1);
    expect(l.unidad).toBe("unidades");
    expect(l.precioUnitario).toBe(1000);
    expect(l.porcentajeBonificacion).toBe(0);
    expect(l.importeBonificacion).toBe(0);
    expect(l.subtotal).toBe(1000);
  });
});
