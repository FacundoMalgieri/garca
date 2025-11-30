/**
 * Utility functions for Monotributo Scraper.
 */

/**
 * Parses an Argentine monetary value string to a number.
 * Handles format: "$ 8.992.597,87" -> 8992597.87
 * @param texto - Text containing monetary value
 * @returns Parsed number
 */
export function parseMontoArgentino(texto: string): number {
  return parseFloat(
    texto
      .replace(/\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .trim()
  ) || 0;
}

/**
 * Extracts date from text using DD/MM/YYYY pattern.
 * @param text - Text containing date
 * @returns Extracted date or current date if not found
 */
export function extractFechaVigencia(text: string | null): string {
  if (!text) {
    return new Date().toLocaleDateString("es-AR");
  }
  const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : new Date().toLocaleDateString("es-AR");
}

