import { describe, expect,it } from "vitest";

import { validateCuit } from "@/lib/facturador/cuit";

describe("validateCuit", () => {
  it("acepta un CUIT válido", () => {
    expect(validateCuit("30707915281")).toBe(true);
    expect(validateCuit("20354104076")).toBe(true);
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
});
