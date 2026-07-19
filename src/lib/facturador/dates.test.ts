import { describe, expect,it } from "vitest";

import { addDays,defaultVtoPago, formatDMY, previousMonthPeriod } from "@/lib/facturador/dates";

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
