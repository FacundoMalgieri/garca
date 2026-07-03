import { describe, expect,it } from "vitest";

import { lineSubtotal,round2 } from "@/lib/facturador/money";

describe("money", () => {
  it("round2 redondea a 2 decimales (half-up)", () => {
    expect(round2(53.973)).toBe(53.97);
    expect(round2(53.975)).toBe(53.98);
    expect(round2(3500000)).toBe(3500000);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });

  it("lineSubtotal aplica cantidad, precio y bonificación, redondeado", () => {
    expect(lineSubtotal({ cantidad: 3, precioUnitario: 19.99, bonificacion: 10 })).toBe(53.97);
    expect(lineSubtotal({ cantidad: 1, precioUnitario: 3500000 })).toBe(3500000);
    expect(lineSubtotal({ cantidad: 2, precioUnitario: 100, bonificacion: 0 })).toBe(200);
  });
});
