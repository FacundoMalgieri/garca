import { describe, expect,it } from "vitest";

import { computeTopeAlert } from "@/lib/facturador/tope";

describe("computeTopeAlert", () => {
  it("null si no hay status", () => {
    expect(computeTopeAlert(null, 1000)).toBeNull();
  });

  it("ok cuando queda margen holgado", () => {
    const r = computeTopeAlert({ margenDisponible: 5_000_000 }, 1_000_000);
    expect(r).toEqual({ level: "ok", margenRestante: 4_000_000 });
  });

  it("warning cuando la factura deja poco margen (<10%... configurable por umbral absoluto)", () => {
    const r = computeTopeAlert({ margenDisponible: 1_200_000 }, 1_000_000);
    expect(r?.level).toBe("warning");
    expect(r?.margenRestante).toBe(200_000);
  });

  it("exceeds cuando la factura supera el margen", () => {
    const r = computeTopeAlert({ margenDisponible: 500_000 }, 1_000_000);
    expect(r?.level).toBe("exceeds");
    expect(r?.margenRestante).toBe(-500_000);
  });
});
