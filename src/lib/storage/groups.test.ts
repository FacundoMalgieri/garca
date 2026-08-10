import { beforeEach, describe, expect, it } from "vitest";

import { clearStorageGroups, hasAnyStoredData, STORAGE_GROUPS } from "./groups";

describe("storage groups", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const seedAll = () => {
    localStorage.setItem("garca_invoices", "[]");
    localStorage.setItem("garca_invoices_ts", "1");
    localStorage.setItem("garca_company", "{}");
    localStorage.setItem("garca_pdv", "[]");
    localStorage.setItem("garca_monotributo", "{}");
    localStorage.setItem("garca_manual_fx_rates", "{}");
    localStorage.setItem("garca_facturador_templates", "[]");
    localStorage.setItem("garca_clientes", "{}");
    localStorage.setItem("garca_projection", "{}");
    localStorage.setItem("monotributo-tipo-actividad", "servicios");
    localStorage.setItem("garca_afip_cuit", "20345678901");
    localStorage.setItem("theme", "light");
    localStorage.setItem("garca_tour_panel", "seen");
  };

  it("borrar comprobantes deja intactas plantillas y clientes", () => {
    seedAll();
    clearStorageGroups(["comprobantes"]);

    expect(localStorage.getItem("garca_invoices")).toBeNull();
    expect(localStorage.getItem("garca_invoices_ts")).toBeNull();
    expect(localStorage.getItem("garca_manual_fx_rates")).toBeNull();
    expect(localStorage.getItem("garca_facturador_templates")).toBe("[]");
    expect(localStorage.getItem("garca_clientes")).toBe("{}");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("borrar facturador no toca comprobantes ni preferencias", () => {
    seedAll();
    clearStorageGroups(["facturador"]);

    expect(localStorage.getItem("garca_facturador_templates")).toBeNull();
    expect(localStorage.getItem("garca_clientes")).toBeNull();
    expect(localStorage.getItem("garca_invoices")).toBe("[]");
    expect(localStorage.getItem("garca_projection")).toBe("{}");
  });

  it("borrar preferencias resuelve el prefijo de los tours", () => {
    seedAll();
    localStorage.setItem("garca_tour_facturador", "seen");
    clearStorageGroups(["preferencias"]);

    expect(localStorage.getItem("garca_tour_panel")).toBeNull();
    expect(localStorage.getItem("garca_tour_facturador")).toBeNull();
    expect(localStorage.getItem("theme")).toBeNull();
    expect(localStorage.getItem("garca_invoices")).toBe("[]");
  });

  it("borra varios grupos a la vez", () => {
    seedAll();
    clearStorageGroups(["comprobantes", "facturador", "preferencias"]);
    expect(localStorage.length).toBe(0);
  });

  it("hasAnyStoredData refleja si queda algo de GARCA", () => {
    expect(hasAnyStoredData()).toBe(false);
    localStorage.setItem("garca_facturador_templates", "[]");
    expect(hasAnyStoredData()).toBe(true);
    clearStorageGroups(["facturador"]);
    expect(hasAnyStoredData()).toBe(false);
  });

  it("los tres grupos cubren las 12 keys fijas sin repetir ninguna", () => {
    // 12 fijas + el prefijo garca_tour_ (una key por tour) = las 13 entradas del
    // inventario del spec.
    const keys = STORAGE_GROUPS.flatMap((g) => g.keys);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toHaveLength(12);
    expect(STORAGE_GROUPS.flatMap((g) => g.keyPrefixes ?? [])).toEqual(["garca_tour_"]);
  });
});
