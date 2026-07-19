import { describe, expect, it } from "vitest";

import { CONCEPTO_OPTIONS, COND_IVA_OPTIONS, FORMA_PAGO_OPTIONS, TIPO_DOC_OPTIONS,UNIDAD_OPTIONS } from "./select-options";

describe("select-options", () => {
  it("concepto tiene las 3 opciones con value = clave de Concepto", () => {
    expect(CONCEPTO_OPTIONS).toEqual([
      { value: "productos", label: "Productos" },
      { value: "servicios", label: "Servicios" },
      { value: "ambos", label: "Productos y servicios" },
    ]);
  });
  it("unidad incluye 'unidades' con el código RCEL 7", () => {
    expect(UNIDAD_OPTIONS.find((o) => o.value === "7")?.label).toBe("Unidades");
  });
  it("unidad incluye las comunes de RCEL (toneladas, metros cuadrados, 1000 kWh) con código exacto", () => {
    expect(UNIDAD_OPTIONS.find((o) => o.value === "29")?.label).toBe("Toneladas");
    expect(UNIDAD_OPTIONS.find((o) => o.value === "3")?.label).toBe("Metros cuadrados");
    expect(UNIDAD_OPTIONS.find((o) => o.value === "6")?.label).toBe("1000 kWh");
  });
  it("excluye los códigos crípticos/de nicho de RCEL (UIACTIG/curie/kg activo)", () => {
    const values = UNIDAD_OPTIONS.map((o) => o.value);
    // 65=MUIACTIG, 48=curie, 66=kg activo — no deben aparecer en la UI curada
    expect(values).not.toContain("65");
    expect(values).not.toContain("48");
    expect(values).not.toContain("66");
  });
  it("mantiene 'Otras unidades' (98) como comodín", () => {
    expect(UNIDAD_OPTIONS.find((o) => o.value === "98")?.label).toBe("Otras unidades");
  });
  it("no hay códigos de unidad duplicados", () => {
    const values = UNIDAD_OPTIONS.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });
  it("cond IVA incluye Responsable Inscripto (1) y Consumidor Final (5)", () => {
    expect(COND_IVA_OPTIONS.find((o) => o.value === "1")?.label).toBe("Responsable Inscripto");
    expect(COND_IVA_OPTIONS.find((o) => o.value === "5")?.label).toBe("Consumidor Final");
  });
  it("forma de pago incluye Transferencia (6)", () => {
    expect(FORMA_PAGO_OPTIONS.find((o) => o.value === "6")?.label).toBe("Transferencia bancaria");
  });
  it("tipo doc incluye CUIT (80)", () => {
    expect(TIPO_DOC_OPTIONS.find((o) => o.value === "80")?.label).toBe("CUIT");
  });
});
