import { getUserFacingError } from "@/lib/errors/user-message";

/**
 * Formats invoice type for display.
 * Converts "Factura de Exportación E" to "Factura E".
 */
export function formatInvoiceType(tipo: string): string {
  return tipo.replace("Factura de Exportación E", "Factura E");
}

/**
 * Checks if the invoice type is a Factura E (export invoice).
 */
export function isFacturaE(tipo: string): boolean {
  return tipo.includes("Exportación E") || tipo === "Factura E";
}

/**
 * Returns a user-friendly error message based on error code.
 */
export function getErrorMessage(errorCode: string | null, error: string | null): string {
  // Códigos donde este mensaje es mejor que el string crudo del scraper: son
  // situaciones del usuario o de su cuenta, sin consejo operativo que unificar.
  switch (errorCode) {
    case "INVALID_CREDENTIALS":
      return "❌ Credenciales inválidas. Verifique su CUIT/CUIL y contraseña.";
    case "CAPTCHA_REQUIRED":
      return "🤖 ARCA requiere CAPTCHA. Por favor intente más tarde.";
    case "ACCOUNT_BLOCKED":
      return "🔒 Su cuenta está bloqueada. Contacte a ARCA.";
    case "NO_DATA":
      return "📋 No se encontraron comprobantes para los filtros especificados.";
  }

  // El resto delega en el mapper compartido. Acá SÍ importa unificar: un mismo
  // código tiene que dar el mismo consejo en /panel y en /ingresar (antes
  // TIMEOUT decía "intente nuevamente" en uno y "esperá a ARCA" en el otro).
  return getUserFacingError(error, errorCode) || "Error desconocido";
}

/**
 * Formats a number as currency in Argentine locale.
 */
export function formatCurrency(value: number, decimals = 2): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Calculates total in pesos for an invoice.
 * Handles USD, EUR, and any other foreign currency with exchange rate.
 */
export function calculateTotalPesos(importeTotal: number, moneda: string, exchangeRate?: number): number {
  // If it's a foreign currency (not ARS) and has exchange rate, convert
  if (moneda !== "ARS" && exchangeRate) {
    return importeTotal * exchangeRate;
  }
  return importeTotal;
}

/**
 * Checks if a currency is foreign (not ARS).
 */
export function isForeignCurrency(moneda: string): boolean {
  return moneda !== "ARS";
}

