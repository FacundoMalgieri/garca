import { describe, expect, it } from "vitest";

import type { EmissionPreview } from "@/types/facturador";

import { findPreviewBlockers } from "./preview-guard";

function preview(overrides: Partial<EmissionPreview> = {}): EmissionPreview {
  return {
    puntoVenta: "3",
    tipoComprobante: 13,
    emisor: {
      razonSocial: "PEREZ JUAN",
      puntoVenta: "00003",
      domicilio: "Calle 1",
      concepto: "Productos",
    },
    receptor: {
      cuit: "30711437580",
      razonSocial: "ACME SRL",
      domicilio: "Calle 2",
      email: "",
      condicionIVA: "IVA Responsable Inscripto",
      condicionVenta: "Contado",
    },
    lineas: [
      {
        codigo: "",
        descripcion: "Anulación Factura C 0003-00000089",
        cantidad: 1,
        unidad: "unidades",
        precioUnitario: 1_000_000,
        porcentajeBonificacion: 0,
        importeBonificacion: 0,
        subtotal: 1_000_000,
      },
    ],
    subtotal: 1_000_000,
    importeOtrosTributos: 0,
    importeTotal: 1_000_000,
    ...overrides,
  } as EmissionPreview;
}

function conReceptor(overrides: Partial<EmissionPreview["receptor"]>): EmissionPreview {
  const base = preview();
  return { ...base, receptor: { ...base.receptor, ...overrides } };
}

describe("findPreviewBlockers", () => {
  it("no bloquea un preview sano", () => {
    expect(findPreviewBlockers(preview())).toEqual([]);
  });

  it('bloquea el literal "null" de RCEL en condición de venta (caso real)', () => {
    const blockers = findPreviewBlockers(conReceptor({ condicionVenta: "null" }));

    expect(blockers).toHaveLength(1);
    expect(blockers[0].campo).toBe("Condición de venta");
  });

  it("bloquea la condición de venta vacía o con espacios", () => {
    expect(findPreviewBlockers(conReceptor({ condicionVenta: "" }))).toHaveLength(1);
    expect(findPreviewBlockers(conReceptor({ condicionVenta: "   " }))).toHaveLength(1);
  });

  it('bloquea "NULL" sin importar el case', () => {
    expect(findPreviewBlockers(conReceptor({ condicionVenta: "NULL" }))).toHaveLength(1);
  });

  it("bloquea la condición frente al IVA faltante", () => {
    const blockers = findPreviewBlockers(conReceptor({ condicionIVA: "null" }));

    expect(blockers.map((b) => b.campo)).toContain("Condición frente al IVA");
  });

  it("bloquea un Resumen sin líneas", () => {
    const blockers = findPreviewBlockers(preview({ lineas: [] }));

    expect(blockers.map((b) => b.campo)).toContain("Detalle");
  });

  it("bloquea importe total en cero o negativo", () => {
    expect(findPreviewBlockers(preview({ importeTotal: 0 })).map((b) => b.campo)).toContain("Importe total");
    expect(findPreviewBlockers(preview({ importeTotal: -5 })).map((b) => b.campo)).toContain("Importe total");
  });

  it("bloquea cuando el total no cierra con el detalle", () => {
    const blockers = findPreviewBlockers(preview({ importeTotal: 999 }));

    expect(blockers.map((b) => b.campo)).toContain("Importe total");
  });

  it("acepta el total con otros tributos sumados", () => {
    const p = preview({ importeOtrosTributos: 50_000, importeTotal: 1_050_000, subtotal: 1_000_000 });

    expect(findPreviewBlockers(p)).toEqual([]);
  });

  it("tolera diferencias de redondeo de un centavo", () => {
    const p = preview({ importeTotal: 1_000_000.004 });

    expect(findPreviewBlockers(p)).toEqual([]);
  });

  it("bloquea cuando falta la razón social del emisor", () => {
    const base = preview();
    const p = { ...base, emisor: { ...base.emisor, razonSocial: "" } };

    expect(findPreviewBlockers(p).map((b) => b.campo)).toContain("Emisor");
  });

  it("acumula todos los motivos", () => {
    const blockers = findPreviewBlockers(
      preview({ lineas: [], importeTotal: 0, receptor: { ...preview().receptor, condicionVenta: "null" } })
    );

    expect(blockers.length).toBeGreaterThanOrEqual(3);
  });
});
