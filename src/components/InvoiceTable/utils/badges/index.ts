/**
 * Badge utility functions for currency and invoice type styling.
 */

/**
 * Predefined colors for known currencies.
 * Each currency has light and dark mode variants.
 */
const CURRENCY_COLORS: Record<string, { light: string; dark: string }> = {
  USD: {
    light: "bg-white border-green-600 text-green-700",
    dark: "dark:bg-green-950 dark:border-green-500 dark:text-green-400",
  },
  EUR: {
    light: "bg-white border-amber-600 text-amber-700",
    dark: "dark:bg-amber-950 dark:border-amber-500 dark:text-amber-400",
  },
  ARS: {
    light: "bg-white border-blue-600 text-blue-700",
    dark: "dark:bg-blue-950 dark:border-blue-500 dark:text-blue-400",
  },
  JPY: {
    light: "bg-white border-red-600 text-red-700",
    dark: "dark:bg-red-950 dark:border-red-500 dark:text-red-400",
  },
  GBP: {
    light: "bg-white border-purple-600 text-purple-700",
    dark: "dark:bg-purple-950 dark:border-purple-500 dark:text-purple-400",
  },
  BRL: {
    light: "bg-white border-emerald-600 text-emerald-700",
    dark: "dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-400",
  },
  CHF: {
    light: "bg-white border-rose-600 text-rose-700",
    dark: "dark:bg-rose-950 dark:border-rose-500 dark:text-rose-400",
  },
  CAD: {
    light: "bg-white border-orange-600 text-orange-700",
    dark: "dark:bg-orange-950 dark:border-orange-500 dark:text-orange-400",
  },
  AUD: {
    light: "bg-white border-cyan-600 text-cyan-700",
    dark: "dark:bg-cyan-950 dark:border-cyan-500 dark:text-cyan-400",
  },
  MXN: {
    light: "bg-white border-lime-600 text-lime-700",
    dark: "dark:bg-lime-950 dark:border-lime-500 dark:text-lime-400",
  },
};

/**
 * Fallback colors for unknown currencies.
 * Uses a hash-based approach to generate consistent colors.
 */
const FALLBACK_COLORS = [
  { light: "bg-white border-violet-600 text-violet-700", dark: "dark:bg-violet-950 dark:border-violet-500 dark:text-violet-400" },
  { light: "bg-white border-pink-600 text-pink-700", dark: "dark:bg-pink-950 dark:border-pink-500 dark:text-pink-400" },
  { light: "bg-white border-teal-600 text-teal-700", dark: "dark:bg-teal-950 dark:border-teal-500 dark:text-teal-400" },
  { light: "bg-white border-indigo-600 text-indigo-700", dark: "dark:bg-indigo-950 dark:border-indigo-500 dark:text-indigo-400" },
  { light: "bg-white border-fuchsia-600 text-fuchsia-700", dark: "dark:bg-fuchsia-950 dark:border-fuchsia-500 dark:text-fuchsia-400" },
];

/**
 * Simple hash function to generate consistent index for unknown currencies.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets the CSS classes for a currency badge.
 */
export function getCurrencyBadgeClasses(currency: string): string {
  const colors = CURRENCY_COLORS[currency];
  
  if (colors) {
    return `${colors.light} ${colors.dark}`;
  }
  
  // Use hash to get consistent fallback color
  const index = hashString(currency) % FALLBACK_COLORS.length;
  const fallback = FALLBACK_COLORS[index];
  return `${fallback.light} ${fallback.dark}`;
}

/**
 * Invoice type categories for styling.
 */
export type InvoiceTypeCategory = "factura" | "factura-e" | "nota-credito" | "nota-debito" | "other";

/**
 * Determines the category of an invoice type.
 */
export function getInvoiceTypeCategory(tipo: string): InvoiceTypeCategory {
  const lower = tipo.toLowerCase();
  
  if (lower.includes("nota de credito") || lower.includes("nota de crédito")) {
    return "nota-credito";
  }
  
  if (lower.includes("nota de debito") || lower.includes("nota de débito")) {
    return "nota-debito";
  }
  
  if (lower.includes("exportación e") || lower === "factura e") {
    return "factura-e";
  }
  
  if (lower.includes("factura")) {
    return "factura";
  }
  
  return "other";
}

/**
 * Gets the CSS classes for an invoice type badge.
 */
export function getTypeBadgeClasses(tipo: string): string {
  const category = getInvoiceTypeCategory(tipo);
  
  switch (category) {
    case "factura-e":
      // Green for export invoices
      return "bg-success/10 text-success";
    case "nota-credito":
      // Red for credit notes (money going out)
      return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400";
    case "nota-debito":
      // Green/teal for debit notes (money coming in)
      return "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400";
    case "factura":
    default:
      // Blue for regular invoices
      return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
  }
}

/**
 * Checks if an invoice type is a credit note.
 */
export function isNotaCredito(tipo: string): boolean {
  return getInvoiceTypeCategory(tipo) === "nota-credito";
}

/**
 * Checks if an invoice type is a debit note.
 */
export function isNotaDebito(tipo: string): boolean {
  return getInvoiceTypeCategory(tipo) === "nota-debito";
}

/**
 * Checks if an invoice type is an export invoice (Factura E).
 */
export function isFacturaE(tipo: string): boolean {
  return getInvoiceTypeCategory(tipo) === "factura-e";
}

