import { describe, expect,it } from "vitest";

import { validateCuit } from "@/lib/facturador/cuit";

describe("validateCuit", () => {
  it("acepta un CUIT válido", () => {
    expect(validateCuit("30707915281")).toBe(true);
    expect(validateCuit("20301234563")).toBe(true);
  });

  it("acepta CUIT con guiones/espacios", () => {
    expect(validateCuit("30-70791528-1")).toBe(true);
  });

  it("rechaza dígito verificador incorrecto", () => {
    expect(validateCuit("30707915282")).toBe(false);
  });

  it("rechaza longitud inválida o no numérico", () => {
    expect(validateCuit("123")).toBe(false);
    expect(validateCuit("abcdefghijk")).toBe(false);
    expect(validateCuit("")).toBe(false);
  });

  describe("CUIT pegado de otro lado", () => {
    // La gente pega el CUIT de un mail, un PDF o WhatsApp. Ahí vienen puntos y,
    // peor, caracteres invisibles: el número se ve perfecto en pantalla y el
    // validador lo rechazaba sin que se pudiera ver por qué.
    it("acepta el formato con puntos", () => {
      expect(validateCuit("30.707.915.281")).toBe(true);
      expect(validateCuit("30.70791528.1")).toBe(true);
    });

    it("acepta caracteres invisibles pegados junto al número", () => {
      expect(validateCuit("30707915281​")).toBe(true); // zero-width space
      expect(validateCuit("﻿30707915281")).toBe(true); // BOM
      expect(validateCuit("30707915281­")).toBe(true); // soft hyphen
      expect(validateCuit("30707915281‎")).toBe(true); // left-to-right mark
      expect(validateCuit("30⁠707915281")).toBe(true); // word joiner
    });

    it("acepta espacios raros y guiones tipográficos", () => {
      expect(validateCuit("30 707915281")).toBe(true); // NBSP
      expect(validateCuit("30–707915281")).toBe(true); // en dash
    });

    it("sigue rechazando basura de verdad", () => {
      expect(validateCuit("30707915281x")).toBe(false);
      expect(validateCuit("307079152810")).toBe(false); // 12 dígitos
      expect(validateCuit("30707915281,5")).toBe(false);
    });
  });
});
