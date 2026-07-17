import { describe, expect,it } from "vitest";

import { buildFillPlan } from "@/lib/facturador/fill-plan";
import type { Plantilla } from "@/types/facturador";

const p: Plantilla = {
  id: "t1", nombre: "GSA", puntoDeVenta: "3", concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "GSA", domicilio: "Belgrano 2687", condicionVenta: ["6"] },
  periodo: { desde: "01/06/2026", hasta: "30/06/2026", vtoPago: "13/07/2026" },
  lineas: [{ descripcion: "Por 120 horas", cantidad: 1, unidad: "7", precioUnitario: 3500000 }],
};

describe("buildFillPlan", () => {
  it("pantalla 0: setea PV y tipo de comprobante (Factura C = universo 2)", () => {
    const plan = buildFillPlan(p);
    expect(plan.pantalla0).toEqual([
      { selector: "#puntodeventa", action: "select", value: "3" },
      { selector: "#universocomprobante", action: "select", value: "2" },
    ]);
  });

  it("pantalla 1: concepto servicios agrega período; setea actividad y fecha", () => {
    const plan = buildFillPlan(p);
    expect(plan.pantalla1).toContainEqual({ selector: "#idconcepto", action: "select", value: "2" });
    expect(plan.pantalla1).toContainEqual({ selector: "#fsd", action: "fill", value: "01/06/2026" });
    expect(plan.pantalla1).toContainEqual({ selector: "#fsh", action: "fill", value: "30/06/2026" });
    expect(plan.pantalla1).toContainEqual({ selector: "#vencimientopago", action: "fill", value: "13/07/2026" });
  });

  it("pantalla 2: orden IVA→tipoDoc→nro→lookup, domicilio y condición de venta", () => {
    const plan = buildFillPlan(p);
    const selectors = plan.pantalla2.map((a) => a.selector);
    expect(selectors.indexOf("#idivareceptor")).toBeLessThan(selectors.indexOf("#idtipodocreceptor"));
    expect(selectors.indexOf("#idtipodocreceptor")).toBeLessThan(selectors.indexOf("#nrodocreceptor"));
    expect(plan.pantalla2).toContainEqual({ selector: "#nrodocreceptor", action: "lookup", value: "30707915281" });
    expect(plan.pantalla2).toContainEqual({ selector: "#formadepago6", action: "check", value: "true" });
  });

  it("pantalla 2: Consumidor Final sin documento usa fill (no lookup, que se colgaría)", () => {
    const cf: Plantilla = {
      ...p,
      cliente: { ...p.cliente, condicionIVA: "5", tipoDoc: "96", nroDoc: "" },
    };
    const plan = buildFillPlan(cf);
    expect(plan.pantalla2).toContainEqual({ selector: "#nrodocreceptor", action: "fill", value: "" });
    expect(plan.pantalla2.some((a) => a.selector === "#nrodocreceptor" && a.action === "lookup")).toBe(false);
  });

  it("pantalla 3: primera línea con descripción, cantidad, unidad, precio", () => {
    const plan = buildFillPlan(p);
    expect(plan.pantalla3).toContainEqual({ selector: "#detalle_descripcion1", action: "fill", value: "Por 120 horas" });
    expect(plan.pantalla3).toContainEqual({ selector: "#detalle_cantidad1", action: "fill", value: "1" });
    expect(plan.pantalla3).toContainEqual({ selector: "#detalle_medida1", action: "select", value: "7" });
    expect(plan.pantalla3).toContainEqual({ selector: "#detalle_precio1", action: "fill", value: "3500000" });
  });

  it("productos: no agrega período", () => {
    const prod = { ...p, concepto: "productos" as const };
    const plan = buildFillPlan(prod);
    expect(plan.pantalla1.some((a) => a.selector === "#fsd")).toBe(false);
  });

  it("agrega fecha del comprobante (#fc) solo si se pasa en opts", () => {
    expect(buildFillPlan(p).pantalla1.some((a) => a.selector === "#fc")).toBe(false);
    const plan = buildFillPlan(p, { fecha: "05/07/2026" });
    expect(plan.pantalla1).toContainEqual({ selector: "#fc", action: "fill", value: "05/07/2026" });
  });

  it("agrega actividad (#actiAsociadaId) solo si la plantilla la define", () => {
    expect(buildFillPlan(p).pantalla1.some((a) => a.selector === "#actiAsociadaId")).toBe(false);
    const conAct = { ...p, actividad: "620100 - SERVICIOS DE CONSULTORES EN INFORMATICA" };
    const plan = buildFillPlan(conAct);
    expect(plan.pantalla1).toContainEqual({
      selector: "#actiAsociadaId",
      action: "select",
      value: "620100 - SERVICIOS DE CONSULTORES EN INFORMATICA",
    });
  });

  it("pantalla 0: universo override usa el valor pasado (NC = 4)", () => {
    const plan = buildFillPlan(p, { universo: "4" });
    expect(plan.pantalla0).toContainEqual({ selector: "#universocomprobante", action: "select", value: "4" });
  });

  it("pantalla 0: sin universo usa Factura C (2) por default", () => {
    const plan = buildFillPlan(p, {});
    expect(plan.pantalla0).toContainEqual({ selector: "#universocomprobante", action: "select", value: "2" });
  });

  it("pantalla 2: con asociado anexa las acciones de comprobante asociado (tipo por id, resto por name)", () => {
    const plan = buildFillPlan(p, {
      universo: "4",
      asociado: { tipo: "11", puntoVenta: "3", numero: "89", fecha: "10/06/2026" },
    });
    expect(plan.pantalla2).toContainEqual({ selector: "#cmp_asoc_tipo", action: "select", value: "11" });
    expect(plan.pantalla2).toContainEqual({ selector: '[name="cmpAsociadoPtoVta"]', action: "fill", value: "3" });
    expect(plan.pantalla2).toContainEqual({ selector: '[name="cmpAsociadoNro"]', action: "fill", value: "89" });
    expect(plan.pantalla2).toContainEqual({ selector: '[name="cmpAsociadoFechaEmision"]', action: "fill", value: "10/06/2026" });
  });

  it("pantalla 2: asociado sin fecha NO agrega la acción de fecha", () => {
    const plan = buildFillPlan(p, {
      universo: "4",
      asociado: { tipo: "11", puntoVenta: "3", numero: "89" },
    });
    expect(plan.pantalla2.some((a) => a.selector === '[name="cmpAsociadoFechaEmision"]')).toBe(false);
  });

  it("pantalla 2: sin asociado NO agrega campos de comprobante asociado", () => {
    const plan = buildFillPlan(p, {});
    expect(plan.pantalla2.some((a) => a.selector === "#cmp_asoc_tipo")).toBe(false);
  });
});
