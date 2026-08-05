import { describe, expect, it } from "vitest";

import { pickProximaRecategorizacion } from "./parse";

describe("pickProximaRecategorizacion", () => {
  it("usa el <strong> cuando existe (formato viejo)", () => {
    expect(pickProximaRecategorizacion("Enero 2026", "Próximo período de recategorización: Enero 2026")).toBe(
      "Enero 2026"
    );
  });

  it("deriva la fecha del texto plano cuando la ventana está abierta", () => {
    // DOM real de ARCA al 05/08/2026: el div ya no trae <strong>
    expect(pickProximaRecategorizacion(null, "Podés recategorizarte hasta el 05/08/2026.")).toBe(
      "Hasta el 05/08/2026"
    );
  });

  it("soporta la fecha con mes abreviado", () => {
    expect(pickProximaRecategorizacion("", "Podés recategorizarte hasta el 05-ago-2026 inclusive.")).toBe(
      "Hasta el 05-ago-2026"
    );
  });

  it("saca el prefijo cuando no hay <strong> ni fecha reconocible", () => {
    expect(pickProximaRecategorizacion(null, "Próximo período de recategorización: Enero 2027")).toBe("Enero 2027");
  });

  it("normaliza espacios y saca el punto final", () => {
    expect(pickProximaRecategorizacion(null, "  Recategorización\n  anual  pendiente.  ")).toBe(
      "Recategorización anual pendiente"
    );
  });

  it("devuelve string vacío sin datos", () => {
    expect(pickProximaRecategorizacion(null, null)).toBe("");
    expect(pickProximaRecategorizacion("   ", "   ")).toBe("");
  });
});
