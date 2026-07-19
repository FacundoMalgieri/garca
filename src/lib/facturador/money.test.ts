import { describe, expect,it } from "vitest";

import { lineSubtotal,parseARNumber,round2 } from "@/lib/facturador/money";

describe("money", () => {
  it("round2 redondea a 2 decimales (half-up)", () => {
    expect(round2(53.973)).toBe(53.97);
    expect(round2(53.975)).toBe(53.98);
    expect(round2(3500000)).toBe(3500000);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });

  it("round2 es half-away-from-zero en casos límite (.005/.255/.675)", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(1.255)).toBe(1.26);
    expect(round2(2.675)).toBe(2.68);
  });

  it("round2 no sobre-redondea cerca del techo de la categoría K", () => {
    // ~1.083e8 + .005: el string-round no depende de un nudge de magnitud fija.
    expect(round2(108300000.005)).toBe(108300000.01);
  });

  it("round2 es simétrico en negativos", () => {
    expect(round2(-53.975)).toBe(-53.98);
    expect(round2(-1.005)).toBe(-1.01);
    expect(round2(-200)).toBe(-200);
    expect(round2(-0)).toBe(0);
  });

  it("lineSubtotal aplica cantidad, precio y bonificación, redondeado", () => {
    expect(lineSubtotal({ cantidad: 3, precioUnitario: 19.99, bonificacion: 10 })).toBe(53.97);
    expect(lineSubtotal({ cantidad: 1, precioUnitario: 3500000 })).toBe(3500000);
    expect(lineSubtotal({ cantidad: 2, precioUnitario: 100, bonificacion: 0 })).toBe(200);
  });

  it("parseARNumber tolera prefijos y separadores AR", () => {
    expect(parseARNumber("3.500.000,00")).toBe(3500000);
    expect(parseARNumber("$ 1.234,50")).toBe(1234.5);
    expect(parseARNumber("0,00")).toBe(0);
    expect(parseARNumber("")).toBe(0);
    expect(parseARNumber("-53,97")).toBe(-53.97);
  });

  it("parseARNumber: coma + punto → punto miles, coma decimal", () => {
    expect(parseARNumber("3.500.000,00")).toBe(3500000);
    expect(parseARNumber("1.234,50")).toBe(1234.5);
    expect(parseARNumber("$ 1.234,50")).toBe(1234.5);
  });

  it("parseARNumber: solo coma → coma decimal", () => {
    expect(parseARNumber("1234,50")).toBe(1234.5);
    expect(parseARNumber("0,00")).toBe(0);
    expect(parseARNumber("-53,97")).toBe(-53.97);
  });

  it("parseARNumber: un solo punto sin coma → decimal (columna % Bon. del resumen)", () => {
    expect(parseARNumber("10.00")).toBe(10);
    expect(parseARNumber("0.00")).toBe(0);
    // Decisión documentada: "1.500" (un punto, sin coma) se interpreta como decimal.
    expect(parseARNumber("1.500")).toBe(1.5);
    // Con coma decimal explícita el entero de miles real llega bien (caso de negocio RCEL).
    expect(parseARNumber("1.500,00")).toBe(1500);
  });

  it("parseARNumber: múltiples puntos sin coma → miles (NO NaN)", () => {
    expect(parseARNumber("1.234.567")).toBe(1234567);
    expect(parseARNumber("3.500.000")).toBe(3500000);
    expect(parseARNumber("1.000.000")).toBe(1000000);
  });

  it("parseARNumber: enteros planos y basura", () => {
    expect(parseARNumber("1000000")).toBe(1000000);
    expect(parseARNumber("abc")).toBe(0);
  });
});
