import { beforeEach,describe, expect, it } from "vitest";

import { deleteTemplate, listTemplates, saveTemplate, TEMPLATES_STORAGE_KEY } from "@/lib/facturador/templates";
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
