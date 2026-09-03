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

  // El caso real del 03/09/2026: la plantilla guardada conserva el vtoPago tal
  // cual se guardó, así que al mes siguiente queda en el pasado. Sólo se validaba
  // el techo, así que pasaba; RCEL rechazaba la pantalla 1 con un alert nativo y
  // la emisión moría 30s después esperando un selector de la pantalla 2.
  it("rechaza vtoPago anterior a hoy", () => {
    const bad = { ...base, periodo: { vtoPago: "13/06/2026" } };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("El vencimiento de pago no puede ser anterior a hoy");
  });

  it("acepta vtoPago igual a hoy", () => {
    expect(validateEmissionInput({ ...base, periodo: { vtoPago: "03/07/2026" } }, today).ok).toBe(true);
  });

  it("acepta vtoPago justo en el tope de hoy+10", () => {
    expect(validateEmissionInput({ ...base, periodo: { vtoPago: "13/07/2026" } }, today).ok).toBe(true);
  });

  it("rechaza vtoPago con formato que RCEL no entiende", () => {
    const r = validateEmissionInput({ ...base, periodo: { vtoPago: "2026-07-13" } }, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("El vencimiento de pago no es una fecha válida");
  });

  // Para "productos" el fill-plan ni siquiera manda el bloque de período, así que
  // un vtoPago viejo colgado en la plantilla no puede romper nada.
  it("ignora el vtoPago cuando el concepto es productos", () => {
    const productos = { ...base, concepto: "productos" as const, periodo: { vtoPago: "13/06/2026" } };
    expect(validateEmissionInput(productos, today).ok).toBe(true);
  });

  it("no valida CUIT si el tipoDoc no es CUIT", () => {
    const cf = { ...base, cliente: { ...base.cliente, condicionIVA: "5", tipoDoc: "96", nroDoc: "12345678" } };
    expect(validateEmissionInput(cf, today).ok).toBe(true);
  });

  it("rechaza cuando no hay líneas", () => {
    const bad = { ...base, lineas: [] };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("El comprobante debe tener al menos una línea");
  });

  it("rechaza líneas con descripción en blanco", () => {
    const bad = { ...base, lineas: [{ descripcion: "   ", cantidad: 1, unidad: "7", precioUnitario: 3500000 }] };
    const r = validateEmissionInput(bad, today);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("Todas las líneas deben tener descripción");
  });
});
