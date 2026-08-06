import { describe, expect, it } from "vitest";

import type { FillAction } from "@/lib/facturador/fill-plan";

import { needsReapply } from "./fill";

const check = (selector = "#formadepago1"): FillAction => ({
  selector,
  action: "check",
  value: "true",
});
const select = (selector = "#idivareceptor"): FillAction => ({
  selector,
  action: "select",
  value: "1",
});
const fill = (selector = "#nrodocreceptor"): FillAction => ({
  selector,
  action: "fill",
  value: "30707915281",
});

describe("needsReapply", () => {
  describe("checkbox de forma de pago", () => {
    // El caso real (06/08/2026): la NC llegó dos veces al Resumen con la
    // condición de venta en "null" mientras el checkbox se veía tildado. RCEL
    // guarda ese valor desde el handler del click, no del estado del DOM, así
    // que comparar contra el DOM no podía detectarlo.
    it("se re-dispara aunque el DOM diga que está bien", () => {
      expect(needsReapply(check(), true)).toBe(true);
    });

    it("se re-dispara cuando el DOM cambió", () => {
      expect(needsReapply(check(), false)).toBe(true);
    });

    it("se re-dispara cuando no se pudo leer el DOM", () => {
      expect(needsReapply(check(), null)).toBe(true);
    });
  });

  describe("resto de las acciones", () => {
    // Para un select o un input, conservar el valor sí prueba que RCEL no lo
    // reseteó: re-aplicarlos siempre sería trabajo al pedo antes de Continuar.
    it("no re-aplica un select que conservó su valor", () => {
      expect(needsReapply(select(), true)).toBe(false);
    });

    it("no re-aplica un fill que conservó su valor", () => {
      expect(needsReapply(fill(), true)).toBe(false);
    });

    it("re-aplica cuando el DOM perdió el valor", () => {
      expect(needsReapply(select(), false)).toBe(true);
      expect(needsReapply(fill(), false)).toBe(true);
    });

    it("no re-aplica cuando no se pudo leer el DOM", () => {
      // null = la lectura falló, no que el valor se haya perdido. Re-aplicar a
      // ciegas podría pisar algo que RCEL tenía bien.
      expect(needsReapply(select(), null)).toBe(false);
      expect(needsReapply(fill(), null)).toBe(false);
    });
  });
});
