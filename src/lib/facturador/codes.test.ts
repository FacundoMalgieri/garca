import { describe, expect,it } from "vitest";

import {
  CONCEPTO_CODE,
  TIPO_OFICIAL,
  UNIDAD_MEDIDA,
  UNIVERSO_COMPROBANTE,
  universoToOficial,
} from "@/lib/facturador/codes";

describe("codes RCEL", () => {
  it("mapea Factura C emisión (2) → oficial (11)", () => {
    expect(UNIVERSO_COMPROBANTE.facturaC).toBe("2");
    expect(TIPO_OFICIAL.facturaC).toBe(11);
    expect(universoToOficial("2")).toBe(11);
  });

  it("mapea Nota de Crédito C emisión (4) → oficial (13)", () => {
    expect(UNIVERSO_COMPROBANTE.notaCreditoC).toBe("4");
    expect(TIPO_OFICIAL.notaCreditoC).toBe(13);
    expect(universoToOficial("4")).toBe(13);
  });

  it("expone concepto y unidad por defecto", () => {
    expect(CONCEPTO_CODE.servicios).toBe("2");
    expect(CONCEPTO_CODE.productos).toBe("1");
    expect(CONCEPTO_CODE.ambos).toBe("3");
    expect(UNIDAD_MEDIDA.unidades).toBe("7");
  });
});
