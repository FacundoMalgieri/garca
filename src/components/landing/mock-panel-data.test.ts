import { describe, expect, it } from "vitest";

import { MOCK_PANEL } from "./mock-panel-data";

describe("MOCK_PANEL", () => {
  it("expone una categoría de Monotributo válida (A–K)", () => {
    expect(MOCK_PANEL.categoria).toMatch(/^[A-K]$/);
  });

  it("tiene un progreso de tope entre 0 y 100", () => {
    expect(MOCK_PANEL.progresoTope).toBeGreaterThanOrEqual(0);
    expect(MOCK_PANEL.progresoTope).toBeLessThanOrEqual(100);
  });

  it("tiene al menos 6 puntos de gráfico acumulado, no decrecientes", () => {
    expect(MOCK_PANEL.acumulado.length).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < MOCK_PANEL.acumulado.length; i++) {
      expect(MOCK_PANEL.acumulado[i].total).toBeGreaterThanOrEqual(
        MOCK_PANEL.acumulado[i - 1].total,
      );
    }
  });

  it("tiene filas de comprobantes con monto positivo", () => {
    expect(MOCK_PANEL.comprobantes.length).toBeGreaterThan(0);
    for (const row of MOCK_PANEL.comprobantes) {
      expect(row.monto).toBeGreaterThan(0);
    }
  });
});
