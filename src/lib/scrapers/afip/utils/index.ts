/**
 * Utility functions for AFIP Scraper
 * Pure functions that don't depend on Playwright.
 */

import { AFIPErrorCode, type AFIPScraperResult } from "@/types/afip-scraper";

// ============================================================================
// TIPO COMPROBANTE PARSING
// ============================================================================

/**
 * Map of invoice type names to their numeric codes.
 */
const TIPO_COMPROBANTE_MAP: Record<string, number> = {
  "factura a": 1,
  "nota de debito a": 2,
  "nota de credito a": 3,
  "factura b": 6,
  "nota de debito b": 7,
  "nota de credito b": 8,
  "factura c": 11,
  "nota de debito c": 12,
  "nota de credito c": 13,
  "factura e": 19,
  "factura de exportacion e": 19,
  "factura de exportación e": 19,
  "nota de debito e": 20,
  "nota de credito e": 21,
};

/**
 * Parses invoice type text to numeric code.
 * @param tipo - Invoice type text (e.g., "Factura A", "Factura de Exportación E")
 * @returns Numeric code for the invoice type, or 0 if unknown
 */
export function parseTipoComprobante(tipo: string): number {
  const tipoLower = tipo.toLowerCase().trim();

  // Check exact matches first
  if (TIPO_COMPROBANTE_MAP[tipoLower]) {
    return TIPO_COMPROBANTE_MAP[tipoLower];
  }

  // Check partial matches
  for (const [key, value] of Object.entries(TIPO_COMPROBANTE_MAP)) {
    if (tipoLower.includes(key)) {
      return value;
    }
  }

  return 0; // Unknown
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Creates a standardized error result from an error.
 * @param error - The error to handle
 * @returns AFIPScraperResult with error information
 */
export function handleError(error: unknown): AFIPScraperResult {
  const errorMessage = error instanceof Error ? error.message : "Error desconocido";

  let errorCode: AFIPErrorCode = AFIPErrorCode.UNKNOWN;

  if (errorMessage.includes("timeout") || errorMessage.includes("Navigation timeout")) {
    errorCode = AFIPErrorCode.TIMEOUT;
  } else if (errorMessage.includes("net::ERR") || errorMessage.includes("navigation")) {
    errorCode = AFIPErrorCode.SERVICE_UNAVAILABLE;
  }

  return {
    success: false,
    invoices: [],
    total: 0,
    error: errorMessage,
    errorCode,
  };
}

/**
 * Creates an error result for specific error codes.
 * @param message - Error message
 * @param errorCode - Specific error code
 * @returns AFIPScraperResult with error information
 */
export function createErrorResult(message: string, errorCode: AFIPErrorCode): AFIPScraperResult {
  return {
    success: false,
    invoices: [],
    total: 0,
    error: message,
    errorCode,
  };
}

/**
 * Creates a success result (used for intermediate steps like login).
 * @returns AFIPScraperResult indicating success
 */
export function createSuccessResult(): AFIPScraperResult {
  return {
    success: true,
    invoices: [],
    total: 0,
  };
}

// ============================================================================
// DATA PARSING
// ============================================================================

/**
 * Parses an invoice number string to extract punto de venta and numero.
 * @param numeroCompleto - Full invoice number (e.g., "00001-00000123")
 * @returns Object with puntoVenta and numero
 */
export function parseNumeroComprobante(numeroCompleto: string): { puntoVenta: number; numero: number } {
  const [puntoVentaStr, numeroStr] = numeroCompleto.split("-");
  return {
    puntoVenta: parseInt(puntoVentaStr, 10) || 0,
    numero: parseInt(numeroStr, 10) || 0,
  };
}

/**
 * Parses an importe string to a number.
 * Handles Argentine format (1.234,56) and standard format (1234.56).
 * @param importeText - Importe text (e.g., "1.234,56" or "1234.56")
 * @returns Parsed number
 */
export function parseImporte(importeText: string): number {
  // Remove currency symbols and spaces
  let cleaned = importeText.replace(/[^0-9.,]/g, "");

  // Check if it's Argentine format (dot as thousands separator, comma as decimal)
  // Pattern: has both dot and comma, with comma appearing after dot
  if (cleaned.includes(".") && cleaned.includes(",")) {
    // Argentine format: 1.234,56 -> remove dots, replace comma with dot
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    // Only comma: could be decimal separator
    cleaned = cleaned.replace(",", ".");
  }
  // If only dots, assume they are decimal separators (standard format)

  return parseFloat(cleaned) || 0;
}

/**
 * Extracts currency and exchange rate from importe title attribute.
 * @param importeTitle - Title attribute from importe cell
 * @returns Object with moneda and optional exchangeRate
 */
export function parseCurrencyInfo(importeTitle: string): { moneda: string; exchangeRate?: number } {
  let moneda = "ARS";
  let exchangeRate: number | undefined;

  // Detect USD
  if (importeTitle.includes("Dólar") || importeTitle.includes("DOL")) {
    moneda = "USD";
  }
  // Detect EUR
  else if (importeTitle.includes("Euro") || importeTitle.includes("EUR")) {
    moneda = "EUR";
  }

  // Extract exchange rate if present
  if (moneda !== "ARS") {
    const rateMatch = importeTitle.match(/Cotizacion:\s*\$([0-9.,]+)/);
    if (rateMatch) {
      exchangeRate = parseFloat(rateMatch[1].replace(",", "."));
    }
  }

  return { moneda, exchangeRate };
}

/**
 * Checks if invoice type is a credit note (should be subtracted).
 * @param tipo - Invoice type string
 * @returns true if it's a credit note
 */
export function isNotaCredito(tipo: string): boolean {
  const tipoLower = tipo.toLowerCase();
  return tipoLower.includes("nota de credito") || tipoLower.includes("nota de crédito");
}

/**
 * Checks if invoice type is a debit note.
 * @param tipo - Invoice type string
 * @returns true if it's a debit note
 */
export function isNotaDebito(tipo: string): boolean {
  const tipoLower = tipo.toLowerCase();
  return tipoLower.includes("nota de debito") || tipoLower.includes("nota de débito");
}

/**
 * Checks if error text indicates invalid credentials.
 * @param errorText - Error text from page
 * @returns true if credentials are invalid
 */
export function isInvalidCredentialsError(errorText: string): boolean {
  const lower = errorText.toLowerCase();
  return (
    lower.includes("inválid") ||
    lower.includes("invalid") ||
    lower.includes("incorrect") ||
    lower.includes("incorrecto") ||
    lower.includes("clave o usuario incorrecto") ||
    lower.includes("usuario incorrecto") ||
    lower.includes("clave incorrecta") ||
    lower.includes("credenciales")
  );
}

/**
 * Checks if error text indicates blocked account.
 * @param errorText - Error text from page
 * @returns true if account is blocked
 */
export function isBlockedAccountError(errorText: string): boolean {
  const lower = errorText.toLowerCase();
  return lower.includes("bloquead") || lower.includes("blocked") || lower.includes("inhabilitad");
}

