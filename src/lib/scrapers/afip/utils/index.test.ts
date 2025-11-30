import { describe, expect, it } from "vitest";

import { AFIPErrorCode } from "@/types/afip-scraper";

import {
  createErrorResult,
  createSuccessResult,
  handleError,
  isBlockedAccountError,
  isInvalidCredentialsError,
  isNotaCredito,
  isNotaDebito,
  parseCurrencyInfo,
  parseImporte,
  parseNumeroComprobante,
  parseTipoComprobante,
} from "./index";

describe("AFIP Scraper Utils", () => {
  describe("parseTipoComprobante", () => {
    it("should parse Factura A", () => {
      expect(parseTipoComprobante("Factura A")).toBe(1);
      expect(parseTipoComprobante("factura a")).toBe(1);
      expect(parseTipoComprobante("FACTURA A")).toBe(1);
    });

    it("should parse Factura B", () => {
      expect(parseTipoComprobante("Factura B")).toBe(6);
    });

    it("should parse Factura C", () => {
      expect(parseTipoComprobante("Factura C")).toBe(11);
    });

    it("should parse Factura E (export)", () => {
      expect(parseTipoComprobante("Factura E")).toBe(19);
      expect(parseTipoComprobante("Factura de Exportación E")).toBe(19);
      expect(parseTipoComprobante("Factura de Exportacion E")).toBe(19);
    });

    it("should parse Nota de Crédito", () => {
      expect(parseTipoComprobante("Nota de Credito A")).toBe(3);
      expect(parseTipoComprobante("Nota de Credito B")).toBe(8);
      expect(parseTipoComprobante("Nota de Credito C")).toBe(13);
    });

    it("should parse Nota de Débito", () => {
      expect(parseTipoComprobante("Nota de Debito A")).toBe(2);
      expect(parseTipoComprobante("Nota de Debito B")).toBe(7);
      expect(parseTipoComprobante("Nota de Debito C")).toBe(12);
    });

    it("should return 0 for unknown types", () => {
      expect(parseTipoComprobante("Unknown")).toBe(0);
      expect(parseTipoComprobante("")).toBe(0);
    });
  });

  describe("parseNumeroComprobante", () => {
    it("should parse standard format", () => {
      const result = parseNumeroComprobante("00001-00000123");
      expect(result.puntoVenta).toBe(1);
      expect(result.numero).toBe(123);
    });

    it("should handle different punto de venta", () => {
      const result = parseNumeroComprobante("00003-00000079");
      expect(result.puntoVenta).toBe(3);
      expect(result.numero).toBe(79);
    });

    it("should return 0 for invalid format", () => {
      const result = parseNumeroComprobante("invalid");
      expect(result.puntoVenta).toBe(0);
      expect(result.numero).toBe(0);
    });
  });

  describe("parseImporte", () => {
    it("should parse integer values", () => {
      expect(parseImporte("2500000")).toBe(2500000);
    });

    it("should parse decimal values with comma", () => {
      expect(parseImporte("6551,06")).toBe(6551.06);
    });

    it("should parse decimal values with dot", () => {
      expect(parseImporte("6551.06")).toBe(6551.06);
    });

    it("should handle currency symbols", () => {
      expect(parseImporte("$1.234,56")).toBe(1234.56);
    });

    it("should return 0 for invalid values", () => {
      expect(parseImporte("")).toBe(0);
      expect(parseImporte("abc")).toBe(0);
    });
  });

  describe("parseCurrencyInfo", () => {
    it("should default to ARS", () => {
      const result = parseCurrencyInfo("Importe Total: Pesos Argentinos");
      expect(result.moneda).toBe("ARS");
      expect(result.exchangeRate).toBeUndefined();
    });

    it("should detect USD with exchange rate", () => {
      const result = parseCurrencyInfo("Importe Total: Dólar Estadounidense - Cotizacion: $1445");
      expect(result.moneda).toBe("USD");
      expect(result.exchangeRate).toBe(1445);
    });

    it("should handle USD without exchange rate", () => {
      const result = parseCurrencyInfo("Importe Total: Dólar Estadounidense");
      expect(result.moneda).toBe("USD");
      expect(result.exchangeRate).toBeUndefined();
    });

    it("should detect EUR", () => {
      const result = parseCurrencyInfo("Importe Total: Euro - Cotizacion: $1200");
      expect(result.moneda).toBe("EUR");
      expect(result.exchangeRate).toBe(1200);
    });

    it("should detect EUR from code", () => {
      const result = parseCurrencyInfo("EUR");
      expect(result.moneda).toBe("EUR");
    });

    it("should detect USD from code", () => {
      const result = parseCurrencyInfo("DOL");
      expect(result.moneda).toBe("USD");
    });
  });

  describe("isNotaCredito", () => {
    it("should detect nota de credito", () => {
      expect(isNotaCredito("Nota de Credito A")).toBe(true);
      expect(isNotaCredito("Nota de Crédito B")).toBe(true);
      expect(isNotaCredito("NOTA DE CREDITO C")).toBe(true);
    });

    it("should return false for other types", () => {
      expect(isNotaCredito("Factura A")).toBe(false);
      expect(isNotaCredito("Nota de Debito A")).toBe(false);
    });
  });

  describe("isNotaDebito", () => {
    it("should detect nota de debito", () => {
      expect(isNotaDebito("Nota de Debito A")).toBe(true);
      expect(isNotaDebito("Nota de Débito B")).toBe(true);
      expect(isNotaDebito("NOTA DE DEBITO C")).toBe(true);
    });

    it("should return false for other types", () => {
      expect(isNotaDebito("Factura A")).toBe(false);
      expect(isNotaDebito("Nota de Credito A")).toBe(false);
    });
  });

  describe("handleError", () => {
    it("should handle timeout errors", () => {
      const result = handleError(new Error("Navigation timeout exceeded"));
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(AFIPErrorCode.TIMEOUT);
    });

    it("should handle network errors", () => {
      const result = handleError(new Error("net::ERR_CONNECTION_REFUSED"));
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(AFIPErrorCode.SERVICE_UNAVAILABLE);
    });

    it("should handle unknown errors", () => {
      const result = handleError(new Error("Something went wrong"));
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(AFIPErrorCode.UNKNOWN);
    });

    it("should handle non-Error objects", () => {
      const result = handleError("string error");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Error desconocido");
    });
  });

  describe("createErrorResult", () => {
    it("should create error result with message and code", () => {
      const result = createErrorResult("Test error", AFIPErrorCode.INVALID_CREDENTIALS);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Test error");
      expect(result.errorCode).toBe(AFIPErrorCode.INVALID_CREDENTIALS);
      expect(result.invoices).toEqual([]);
    });
  });

  describe("createSuccessResult", () => {
    it("should create success result", () => {
      const result = createSuccessResult();
      expect(result.success).toBe(true);
      expect(result.invoices).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("isInvalidCredentialsError", () => {
    it("should detect invalid credentials", () => {
      expect(isInvalidCredentialsError("Credenciales inválidas")).toBe(true);
      expect(isInvalidCredentialsError("Password incorrect")).toBe(true);
      expect(isInvalidCredentialsError("Clave o usuario incorrecto")).toBe(true);
      expect(isInvalidCredentialsError("Usuario incorrecto")).toBe(true);
      expect(isInvalidCredentialsError("Clave incorrecta")).toBe(true);
    });

    it("should return false for other errors", () => {
      expect(isInvalidCredentialsError("Connection error")).toBe(false);
    });
  });

  describe("isBlockedAccountError", () => {
    it("should detect blocked account", () => {
      expect(isBlockedAccountError("Cuenta bloqueada")).toBe(true);
      expect(isBlockedAccountError("Account blocked")).toBe(true);
      expect(isBlockedAccountError("Cuenta inhabilitada")).toBe(true);
    });

    it("should return false for other errors", () => {
      expect(isBlockedAccountError("Connection error")).toBe(false);
    });
  });
});

