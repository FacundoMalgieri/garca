import { describe, expect,it } from "vitest";

import { validateEmissionInput } from "@/lib/facturador/validation";
import type { Plantilla } from "@/types/facturador";

const base: Plantilla = {
  id: "t1",
  nombre: "GSA",
  puntoDeVenta: "3",
  concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "GSA", condicionVenta: ["6"] },
  periodo: { vtoPago: "13/07/2026" },
  lineas: [{ descripcion: "Servicios", cantidad: 1, unidad: "7", precioUnitario: 3500000 }],
};

const today = new Date(2026, 6, 3);

describe("validateEmissionInput", () => {
  it("acepta una plantilla válida", () => {
    expect(validateEmissionInput(base, today)).toEqual({ ok: true, errors: [] });
  });

  it("rechaza CUIT inválido (para tipoDoc CUIT)", () => {
    const bad = { ...base, cliente: { ...base.cliente, nroDoc: "30707915282" } };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("CUIT del receptor inválido");
  });

  it("rechaza monto <= 0", () => {
    const bad = { ...base, lineas: [{ ...base.lineas[0], precioUnitario: 0 }] };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("El importe total debe ser mayor a 0");
  });

  it("rechaza vtoPago mayor a hoy+10", () => {
    const bad = { ...base, periodo: { vtoPago: "20/07/2026" } };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("El vencimiento de pago no puede superar los 10 días desde hoy");
  });

  it("no valida CUIT si el tipoDoc no es CUIT", () => {
    const cf = { ...base, cliente: { ...base.cliente, condicionIVA: "5", tipoDoc: "96", nroDoc: "12345678" } };
    expect(validateEmissionInput(cf, today).ok).toBe(true);
  });
});
