import { beforeEach,describe, expect, it } from "vitest";

import { deleteTemplate, listTemplates, sanitizeTemplates,saveTemplate, TEMPLATES_STORAGE_KEY } from "@/lib/facturador/templates";
import type { Plantilla } from "@/types/facturador";

const nueva: Omit<Plantilla, "id"> = {
  nombre: "GSA",
  puntoDeVenta: "3",
  concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "GSA", condicionVenta: ["6"] },
  lineas: [{ descripcion: "Servicios", cantidad: 1, unidad: "7", precioUnitario: 3500000 }],
};

describe("templates storage", () => {
  beforeEach(() => localStorage.clear());

  it("lista vacío cuando no hay nada", () => {
    expect(listTemplates()).toEqual([]);
  });

  it("guarda una plantilla nueva y le asigna id", () => {
    const saved = saveTemplate(nueva);
    expect(saved.id).toBeTruthy();
    expect(listTemplates()).toHaveLength(1);
    expect(listTemplates()[0].nombre).toBe("GSA");
  });

  it("actualiza una plantilla existente por id", () => {
    const saved = saveTemplate(nueva);
    saveTemplate({ ...saved, nombre: "GSA editada" });
    const all = listTemplates();
    expect(all).toHaveLength(1);
    expect(all[0].nombre).toBe("GSA editada");
  });

  it("elimina por id", () => {
    const saved = saveTemplate(nueva);
    deleteTemplate(saved.id);
    expect(listTemplates()).toEqual([]);
  });

  it("tolera JSON corrupto devolviendo []", () => {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, "{no es json");
    expect(listTemplates()).toEqual([]);
  });
});

describe("sanitizeTemplates", () => {
  const PLANTILLA = {
    id: "abc",
    nombre: "Mi plantilla",
    puntoDeVenta: "3",
    concepto: "servicios",
    cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", condicionVenta: ["6"] },
    lineas: [{ descripcion: "Servicios", cantidad: 1, unidad: "7", precioUnitario: 1000 }],
  };

  it("deja pasar una plantilla bien formada", () => {
    expect(sanitizeTemplates([PLANTILLA])).toEqual([PLANTILLA]);
  });

  it("devuelve [] cuando lo guardado no es una lista", () => {
    expect(sanitizeTemplates(null)).toEqual([]);
    expect(sanitizeTemplates({})).toEqual([]);
  });

  it("descarta plantillas sin id (no se pueden seleccionar ni actualizar)", () => {
    expect(sanitizeTemplates([{ ...PLANTILLA, id: undefined }])).toEqual([]);
    expect(sanitizeTemplates([PLANTILLA, { nombre: "sin id" }])).toEqual([PLANTILLA]);
  });

  it("repone lineas cuando falta o no es array", () => {
    // El bug de esta clase: totalImporte hace `p.lineas.reduce`, así que un
    // undefined acá rompe /facturar al seleccionar la plantilla.
    expect(sanitizeTemplates([{ ...PLANTILLA, lineas: undefined }])[0].lineas).toEqual([]);
    expect(sanitizeTemplates([{ ...PLANTILLA, lineas: "x" }])[0].lineas).toEqual([]);
  });

  it("repone cliente cuando falta, con defaults usables", () => {
    const cliente = sanitizeTemplates([{ ...PLANTILLA, cliente: undefined }])[0].cliente;
    expect(cliente).toEqual({ condicionIVA: "1", tipoDoc: "80", nroDoc: "", condicionVenta: [] });
  });

  it("normaliza importes y cantidades basura", () => {
    const [t] = sanitizeTemplates([
      { ...PLANTILLA, lineas: [{ descripcion: "x", cantidad: "abc", unidad: 7, precioUnitario: null }] },
    ]);
    expect(t.lineas[0]).toEqual({ descripcion: "x", cantidad: 1, unidad: "7", precioUnitario: 0 });
  });

  it("normaliza un concepto desconocido a servicios", () => {
    expect(sanitizeTemplates([{ ...PLANTILLA, concepto: "otro" }])[0].concepto).toBe("servicios");
  });

  it("descarta lineas que no son objetos", () => {
    expect(sanitizeTemplates([{ ...PLANTILLA, lineas: [null, "x"] }])[0].lineas).toEqual([]);
  });
});
