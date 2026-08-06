import { describe, expect, it } from "vitest";

import { getUserFacingError } from "@/lib/errors/user-message";

import { calculateTotalPesos, formatCurrency, formatInvoiceType, getErrorMessage, isFacturaE,isForeignCurrency } from "./index";

describe("formatters", () => {
  describe("formatInvoiceType", () => {
    it("should convert Factura de Exportación E to Factura E", () => {
      expect(formatInvoiceType("Factura de Exportación E")).toBe("Factura E");
    });

    it("should not modify other invoice types", () => {
      expect(formatInvoiceType("Factura A")).toBe("Factura A");
      expect(formatInvoiceType("Factura B")).toBe("Factura B");
      expect(formatInvoiceType("Factura C")).toBe("Factura C");
    });
  });

  describe("isFacturaE", () => {
    it("should return true for Factura de Exportación E", () => {
      expect(isFacturaE("Factura de Exportación E")).toBe(true);
    });

    it("should return true for Factura E", () => {
      expect(isFacturaE("Factura E")).toBe(true);
    });

    it("should return false for other types", () => {
      expect(isFacturaE("Factura A")).toBe(false);
      expect(isFacturaE("Factura B")).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should return correct message for INVALID_CREDENTIALS", () => {
      expect(getErrorMessage("INVALID_CREDENTIALS", null)).toContain("Credenciales inválidas");
    });

    it("should return correct message for CAPTCHA_REQUIRED", () => {
      expect(getErrorMessage("CAPTCHA_REQUIRED", null)).toContain("CAPTCHA");
    });

    it("should return correct message for ACCOUNT_BLOCKED", () => {
      expect(getErrorMessage("ACCOUNT_BLOCKED", null)).toContain("bloqueada");
    });

    // SERVICE_UNAVAILABLE y TIMEOUT delegan en el mapper compartido
    // (@/lib/errors/user-message): son códigos con consejo operativo, y antes
    // decían cosas distintas en /panel y en /ingresar para el mismo problema.
    it("should return correct message for SERVICE_UNAVAILABLE", () => {
      expect(getErrorMessage("SERVICE_UNAVAILABLE", null)).toContain("ARCA no está respondiendo");
    });

    it("should return correct message for TIMEOUT", () => {
      expect(getErrorMessage("TIMEOUT", null)).toContain("ARCA no está respondiendo");
    });

    it("da el mismo consejo que /ingresar para un mismo código", () => {
      for (const code of ["TIMEOUT", "SERVICE_UNAVAILABLE", "NAVIGATION_ERROR"]) {
        expect(getErrorMessage(code, "x")).toBe(getUserFacingError("x", code));
      }
    });

    it("should return correct message for NO_DATA", () => {
      expect(getErrorMessage("NO_DATA", null)).toContain("No se encontraron");
    });

    it("should return fallback error when no code matches", () => {
      expect(getErrorMessage(null, "Custom error")).toBe("Custom error");
    });

    it("should return fallback error for unknown code with custom error", () => {
      expect(getErrorMessage("UNKNOWN_CODE", "Custom error")).toBe("Custom error");
    });

    it("should return unknown error when both are null", () => {
      expect(getErrorMessage(null, null)).toBe("Error desconocido");
    });
  });

  describe("formatCurrency", () => {
    it("should format numbers with Argentine locale", () => {
      const result = formatCurrency(1234.56);
      expect(result).toMatch(/1.*234.*56/);
    });

    it("should respect custom decimals", () => {
      const result = formatCurrency(1234, 0);
      expect(result).not.toContain(",");
    });
  });

  describe("calculateTotalPesos", () => {
    it("should return same amount for ARS", () => {
      expect(calculateTotalPesos(1000, "ARS")).toBe(1000);
    });

    it("should convert USD to pesos with exchange rate", () => {
      expect(calculateTotalPesos(100, "USD", 1000)).toBe(100000);
    });

    it("should convert EUR to pesos with exchange rate", () => {
      expect(calculateTotalPesos(100, "EUR", 1200)).toBe(120000);
    });

    it("should return original amount for USD without exchange rate", () => {
      expect(calculateTotalPesos(100, "USD")).toBe(100);
    });

    it("should return original amount for EUR without exchange rate", () => {
      expect(calculateTotalPesos(100, "EUR")).toBe(100);
    });
  });

  describe("isForeignCurrency", () => {
    it("should return true for USD", () => {
      expect(isForeignCurrency("USD")).toBe(true);
    });

    it("should return true for EUR", () => {
      expect(isForeignCurrency("EUR")).toBe(true);
    });

    it("should return false for ARS", () => {
      expect(isForeignCurrency("ARS")).toBe(false);
    });
  });
});

