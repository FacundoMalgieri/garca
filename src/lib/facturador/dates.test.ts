import { describe, expect,it } from "vitest";

import { addDays,defaultVtoPago, dmyToISO, formatDMY, isoToDMY, previousMonthPeriod } from "@/lib/facturador/dates";

describe("date helpers", () => {
  it("formatDMY formatea a DD/MM/YYYY", () => {
    expect(formatDMY(new Date(2026, 6, 3))).toBe("03/07/2026");
  });

  it("previousMonthPeriod devuelve el mes anterior completo", () => {
    const p = previousMonthPeriod(new Date(2026, 6, 3));
    expect(p.desde).toBe("01/06/2026");
    expect(p.hasta).toBe("30/06/2026");
  });

  it("previousMonthPeriod maneja el cruce de año", () => {
    const p = previousMonthPeriod(new Date(2026, 0, 5));
    expect(p.desde).toBe("01/12/2025");
    expect(p.hasta).toBe("31/12/2025");
  });

  it("defaultVtoPago es hoy + 10 días", () => {
    expect(defaultVtoPago(new Date(2026, 6, 3))).toBe("13/07/2026");
  });

  it("addDays suma días cruzando mes", () => {
    expect(formatDMY(addDays(new Date(2026, 6, 25), 10))).toBe("04/08/2026");
  });
});

describe("conversión para <input type=\"date\">", () => {
  // La Plantilla guarda DD/MM/YYYY porque es lo que espera RCEL. El input nativo
  // habla ISO, así que se convierte solo en el borde de la UI.
  it("dmyToISO convierte al formato del input nativo", () => {
    expect(dmyToISO("01/07/2026")).toBe("2026-07-01");
    expect(dmyToISO("31/12/2025")).toBe("2025-12-31");
  });

  it("isoToDMY vuelve al formato de RCEL", () => {
    expect(isoToDMY("2026-07-01")).toBe("01/07/2026");
    expect(isoToDMY("2025-12-31")).toBe("31/12/2025");
  });

  it("hace round-trip sin perder nada", () => {
    for (const dmy of ["01/07/2026", "29/02/2024", "31/01/2026"]) {
      expect(isoToDMY(dmyToISO(dmy))).toBe(dmy);
    }
  });

  it("devuelve string vacío para entradas que no parsean", () => {
    // El input nativo manda "" cuando el usuario lo limpia.
    expect(dmyToISO("")).toBe("");
    expect(dmyToISO("1/7/2026")).toBe("");
    expect(dmyToISO("no es fecha")).toBe("");
    expect(isoToDMY("")).toBe("");
    expect(isoToDMY("2026-7-1")).toBe("");
  });
});
