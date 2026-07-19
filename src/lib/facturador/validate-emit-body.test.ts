import { describe, expect, it } from "vitest";

import { validateEmitBody } from "@/lib/facturador/validate-emit-body";
import type { Plantilla } from "@/types/facturador";

const TODAY = new Date(2026, 6, 18); // 18/07/2026

function validPlantilla(overrides: Partial<Plantilla> = {}): Plantilla {
  return {
    id: "p1",
    nombre: "Test",
    puntoDeVenta: "3",
    concepto: "servicios",
    cliente: {
      condicionIVA: "5",
      tipoDoc: "96", // DNI → salta el chequeo de CUIT
      nroDoc: "12345678",
      razonSocial: "Cliente",
      condicionVenta: ["1"],
    },
    lineas: [
      {
        descripcion: "Servicio de consultoría",
        cantidad: 1,
        unidad: "7",
        precioUnitario: 1000,
      },
    ],
    ...overrides,
  };
}

describe("validateEmitBody", () => {
  it("rechaza un kind que no está en la whitelist", () => {
    const res = validateEmitBody({ kind: "facturaA", plantilla: validPlantilla() }, TODAY);
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
  });

  it("acepta facturaC con plantilla válida (default kind)", () => {
    expect(validateEmitBody({ plantilla: validPlantilla() }, TODAY).ok).toBe(true);
    expect(validateEmitBody({ kind: "facturaC", plantilla: validPlantilla() }, TODAY).ok).toBe(true);
  });

  it("rechaza facturaC sin plantilla", () => {
    const res = validateEmitBody({ kind: "facturaC" }, TODAY);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Plantilla es requerida");
  });

  it("rechaza facturaC con plantilla inválida (sin líneas → total 0)", () => {
    const res = validateEmitBody({ kind: "facturaC", plantilla: validPlantilla({ lineas: [] }) }, TODAY);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("línea");
  });

  it("rechaza notaCreditoC sin original", () => {
    const res = validateEmitBody({ kind: "notaCreditoC", condicionIVA: "5" }, TODAY);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Nota de crédito");
  });

  it("rechaza notaCreditoC sin condicionIVA", () => {
    const res = validateEmitBody({ kind: "notaCreditoC", original: { numeroCompleto: "00003-00000001" } }, TODAY);
    expect(res.ok).toBe(false);
  });

  it("acepta notaCreditoC con original + condicionIVA", () => {
    const res = validateEmitBody(
      { kind: "notaCreditoC", original: { numeroCompleto: "00003-00000001" }, condicionIVA: "5" },
      TODAY,
    );
    expect(res.ok).toBe(true);
  });
});
