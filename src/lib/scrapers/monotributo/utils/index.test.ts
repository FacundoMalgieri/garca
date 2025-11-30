import { describe, expect, it } from "vitest";

import { extractFechaVigencia, parseMontoArgentino } from "./index";

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
    it("should extract date from text", () => {
      expect(extractFechaVigencia("Vigente desde 01/08/2025")).toBe("01/08/2025");
    });

    it("should extract date from longer text", () => {
      expect(extractFechaVigencia("Las categorías vigentes desde el 01/01/2025 son las siguientes")).toBe("01/01/2025");
    });

    it("should return current date for null", () => {
      const result = extractFechaVigencia(null);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should return current date when no date found", () => {
      const result = extractFechaVigencia("No date here");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });
});

