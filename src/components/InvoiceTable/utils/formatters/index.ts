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
  switch (errorCode) {
    case "INVALID_CREDENTIALS":
      return "❌ Credenciales inválidas. Verifique su CUIT/CUIL y contraseña.";
    case "CAPTCHA_REQUIRED":
      return "🤖 ARCA requiere CAPTCHA. Por favor intente más tarde.";
    case "ACCOUNT_BLOCKED":
      return "🔒 Su cuenta está bloqueada. Contacte a ARCA.";
    case "SERVICE_UNAVAILABLE":
      return "⚠️ El servicio de ARCA no está disponible. Intente más tarde.";
    case "TIMEOUT":
      return "⏱️ La consulta tardó demasiado. Intente nuevamente.";
    case "NO_DATA":
      return "📋 No se encontraron comprobantes para los filtros especificados.";
    default:
      return error || "Error desconocido";
  }
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

