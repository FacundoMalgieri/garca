import { describe, expect, it } from "vitest";

import type { CategoriaMonotributo, MonotributoData } from "@/types/monotributo";

import {
  extractFechaVigencia,
  findMissingHeaderLabels,
  parseCategoriaRow,
  parseCategorias,
  parseMontoArgentino,
  validateMonotributoData,
} from "./index";

/** Builds a valid category with overridable fields. */
function makeCat(
  categoria: string,
  ingresosBrutos: number,
  overrides: Partial<CategoriaMonotributo> = {}
): CategoriaMonotributo {
  return {
    categoria,
    ingresosBrutos,
    superficieAfectada: "Hasta 30 m2",
    energiaElectrica: "Hasta 3330 Kw",
    alquileres: 100000,
    precioUnitarioMax: 200000,
    impuestoIntegrado: { servicios: 5000, venta: 5000 },
    aportesSIPA: 15000,
    aportesObraSocial: 20000,
    total: { servicios: 40000, venta: 40000 },
    ...overrides,
  };
}

/** Builds a valid dataset of N contiguous categories A.. with increasing income. */
function makeData(n: number): MonotributoData {
  const cats = Array.from({ length: n }, (_, i) =>
    makeCat(String.fromCharCode(65 + i), (i + 1) * 10_000_000)
  );
  return { categorias: cats, fechaVigencia: "01/02/2026" };
}

describe("Monotributo Scraper Utils", () => {
  describe("parseMontoArgentino", () => {
    it("should parse standard Argentine format", () => {
      expect(parseMontoArgentino("$ 8.992.597,87")).toBe(8992597.87);
    });

    it("should parse without currency symbol", () => {
      expect(parseMontoArgentino("8.992.597,87")).toBe(8992597.87);
    });

    it("should parse simple values", () => {
      expect(parseMontoArgentino("1.000,00")).toBe(1000);
    });

    it("should parse values without decimals", () => {
      expect(parseMontoArgentino("$ 5.000")).toBe(5000);
    });

    it("should return 0 for invalid values", () => {
      expect(parseMontoArgentino("")).toBe(0);
      expect(parseMontoArgentino("abc")).toBe(0);
    });

    it("should handle extra whitespace", () => {
      expect(parseMontoArgentino("  $ 1.234,56  ")).toBe(1234.56);
    });
  });

  describe("extractFechaVigencia", () => {
    it("should extract date with 'Vigente desde' wording", () => {
      expect(extractFechaVigencia("Vigente desde 01/08/2025")).toBe("01/08/2025");
    });

    it("should extract date from longer text", () => {
      expect(extractFechaVigencia("Las categorías vigentes desde el 01/01/2025 son las siguientes")).toBe("01/01/2025");
    });

    it("should extract single-digit day from ARCA's current wording", () => {
      expect(extractFechaVigencia("Valores de aplicación desde el 1/02/2026")).toBe("1/02/2026");
    });

    it("should handle 'Vigente a partir del' wording", () => {
      expect(extractFechaVigencia("Vigente a partir del 01/01/2025")).toBe("01/01/2025");
    });

    it("should fall back to the first bare date in text", () => {
      expect(extractFechaVigencia("Tabla actualizada 15/03/2026 — fuente ARCA")).toBe("15/03/2026");
    });

    it("should return empty string for null", () => {
      expect(extractFechaVigencia(null)).toBe("");
    });

    it("should return empty string when no date found", () => {
      expect(extractFechaVigencia("No date here")).toBe("");
    });
  });

  describe("findMissingHeaderLabels", () => {
    it("returns empty array when all expected labels present", () => {
      const header =
        "Categoría Ingresos Brutos Sup. Afectada Energía Eléctrica Alquileres Precio Unitario Aportes al SIPA Obra Social Total";
      expect(findMissingHeaderLabels(header)).toEqual([]);
    });

    it("is accent- and case-insensitive", () => {
      const header = "INGRESOS BRUTOS / ENERGIA / ALQUILERES / APORTES AL SIPA / OBRA SOCIAL";
      expect(findMissingHeaderLabels(header)).toEqual([]);
    });

    it("reports missing labels (e.g. column dropped)", () => {
      const header = "Categoría Ingresos Brutos Energía Alquileres SIPA";
      expect(findMissingHeaderLabels(header)).toContain("obra social");
    });

    it("treats null header as everything missing", () => {
      expect(findMissingHeaderLabels(null).length).toBeGreaterThan(0);
    });
  });

  describe("parseCategoriaRow", () => {
    const validRow = [
      "A", "$ 10.277.988,13", "Hasta 30 m2", "Hasta 3330 Kw", "$ 2.390.229,80",
      "$ 613.492,31", "$ 4.780,46", "$ 4.780,46", "$ 15.616,17", "$ 21.990,11",
      "$ 42.386,74", "$ 42.386,74",
    ];

    it("parses a well-formed category row", () => {
      const cat = parseCategoriaRow(validRow);
      expect(cat).not.toBeNull();
      expect(cat?.categoria).toBe("A");
      expect(cat?.ingresosBrutos).toBe(10277988.13);
      expect(cat?.total.servicios).toBe(42386.74);
    });

    it("returns null for a header row (first cell not A-K)", () => {
      const headerRow = ["Categoría", "Ingresos", "Sup", "Energía", "Alq", "PU", "IS", "IV", "SIPA", "OS", "TS", "TV"];
      expect(parseCategoriaRow(headerRow)).toBeNull();
    });

    it("returns null for a row with too few cells", () => {
      expect(parseCategoriaRow(["A", "$ 10.000,00"])).toBeNull();
    });

    it("uppercases and trims the category letter", () => {
      const row = [...validRow];
      row[0] = " b ";
      row[1] = "$ 15.058.447,71";
      expect(parseCategoriaRow(row)?.categoria).toBe("B");
    });
  });

  describe("parseCategorias", () => {
    it("drops non-category rows (headers, footnotes)", () => {
      const rows = [
        ["Categoría", "Ingresos", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
        ["A", "10.000.000,00", "s", "e", "1,00", "1,00", "1,00", "1,00", "1,00", "1,00", "1,00", "1,00"],
        ["B", "20.000.000,00", "s", "e", "1,00", "1,00", "1,00", "1,00", "1,00", "1,00", "1,00", "1,00"],
        ["* nota al pie"],
      ];
      const cats = parseCategorias(rows);
      expect(cats.map((c) => c.categoria)).toEqual(["A", "B"]);
    });
  });

  describe("validateMonotributoData", () => {
    it("accepts a well-formed dataset", () => {
      const result = validateMonotributoData(makeData(11));
      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("rejects too few categories", () => {
      const result = validateMonotributoData(makeData(3));
      expect(result.ok).toBe(false);
      expect(result.errors.join(" ")).toMatch(/Cantidad de categorías/);
    });

    it("rejects non-contiguous category letters", () => {
      const data = makeData(3);
      data.categorias[1].categoria = "D"; // A, D, C
      const result = validateMonotributoData(data);
      expect(result.ok).toBe(false);
      expect(result.errors.join(" ")).toMatch(/contiguas/);
    });

    it("rejects non-increasing income limits", () => {
      const data = makeData(11);
      data.categorias[5].ingresosBrutos = data.categorias[4].ingresosBrutos; // tie
      const result = validateMonotributoData(data);
      expect(result.ok).toBe(false);
      expect(result.errors.join(" ")).toMatch(/no son crecientes/);
    });

    it("rejects zero/negative monetary fields and names the field", () => {
      const data = makeData(11);
      data.categorias[2].aportesSIPA = 0;
      const result = validateMonotributoData(data);
      expect(result.ok).toBe(false);
      expect(result.errors.join(" ")).toMatch(/aportesSIPA.*cero/);
    });

    it("warns (does not fail) when fechaVigencia is empty", () => {
      const data = makeData(11);
      data.fechaVigencia = "";
      const result = validateMonotributoData(data);
      expect(result.ok).toBe(true);
      expect(result.warnings.join(" ")).toMatch(/fecha de vigencia/);
    });

    it("fails when income limits drift implausibly vs previous (column shift)", () => {
      const previous = makeData(11);
      const data = makeData(11);
      // Simulate a column shift: A's income now reads an alquileres-sized number.
      data.categorias[0].ingresosBrutos = previous.categorias[0].ingresosBrutos * 50;
      const result = validateMonotributoData(data, previous);
      expect(result.ok).toBe(false);
      expect(result.errors.join(" ")).toMatch(/posible error de parseo/);
    });

    it("catches a column swap that leaves ingresosBrutos intact (SIPA ↔ obra social)", () => {
      const previous = makeData(11);
      previous.categorias.forEach((c, i) => {
        c.aportesSIPA = 15000 + i * 1000;
        c.aportesObraSocial = 200000 + i * 1000; // ~13x SIPA, like real ARCA spread
      });
      const data = makeData(11);
      data.categorias.forEach((c, i) => {
        // Swapped columns: ingresosBrutos unchanged, but SIPA/OS are flipped.
        c.aportesSIPA = previous.categorias[i].aportesObraSocial;
        c.aportesObraSocial = previous.categorias[i].aportesSIPA;
      });
      const result = validateMonotributoData(data, previous);
      expect(result.ok).toBe(false);
      expect(result.errors.join(" ")).toMatch(/aportes(SIPA|ObraSocial).*posible error de parseo/);
    });

    it("allows a plausible inflation-sized increase vs previous", () => {
      const previous = makeData(11);
      const data = makeData(11);
      data.categorias.forEach((c, i) => {
        c.ingresosBrutos = previous.categorias[i].ingresosBrutos * 1.35; // +35%
      });
      const result = validateMonotributoData(data, previous);
      expect(result.ok).toBe(true);
    });
  });
});
