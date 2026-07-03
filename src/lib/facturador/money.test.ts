import { describe, expect,it } from "vitest";

import { lineSubtotal,parseARNumber,round2 } from "@/lib/facturador/money";

describe("money", () => {
  it("round2 redondea a 2 decimales (half-up)", () => {
    expect(round2(53.973)).toBe(53.97);
    expect(round2(53.975)).toBe(53.98);
    expect(round2(3500000)).toBe(3500000);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });

  it("round2 es simétrico en negativos", () => {
    expect(round2(-53.975)).toBe(-53.98);
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
});
