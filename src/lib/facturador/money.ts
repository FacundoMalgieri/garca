/**
 * Redondea a 2 decimales, half-away-from-zero (simétrico en negativos).
 * Nota: sujeto a la representación binaria de floats; para importes AR de hasta
 * 2 decimales es suficiente. RCEL recomputa server-side, así que esto es para
 * preview/cálculos internos, no la fuente fiscal de verdad.
 */
export function round2(n: number): number {
  const r = Math.round(Math.abs(n) * 100 + Number.EPSILON) / 100;
  return n < 0 ? -r : r;
}

/**
 * Convierte un número en formato AR ("3.500.000,00", "$ 1.234,50") a number.
 * Devuelve 0 si no parsea.
 *
 * Reglas de separadores (RCEL mezcla formatos según la pantalla):
 * - Coma + punto(s) → punto = miles, coma = decimal (formato AR clásico): "3.500.000,00"→3500000, "1.234,50"→1234.5.
 * - Solo coma → coma = decimal: "1234,50"→1234.5.
 * - Un solo punto (sin coma) → punto = decimal: "10.00"→10, "0.00"→0 (columna "% Bon." del resumen de RCEL).
 * - Múltiples puntos (sin coma) → puntos = miles: "1.234.567"→1234567 (NO NaN; formato entero-con-miles de Consultas).
 *
 * Nota sobre "1.500": un solo punto sin coma se interpreta como decimal (1.5). RCEL usa
 * coma como decimal, así que un entero de miles real llega como "1.500,00" (cae en la
 * primera regla), cubriendo el caso de negocio; el caso de puro entero de miles con miles
 * separados por punto siempre trae 2+ puntos ("1.234.567") y cae en la última regla.
 */
export function parseARNumber(s: string): number {
  const clean = s.replace(/[^\d,.-]/g, "");
  const hasComma = clean.includes(",");
  const dotCount = (clean.match(/\./g) ?? []).length;

  let normalized: string;
  if (hasComma) {
    // Formato AR clásico: los puntos son miles, la coma es el decimal.
    normalized = clean.replace(/\./g, "").replace(",", ".");
  } else if (dotCount > 1) {
    // Sin coma y con múltiples puntos → puntos son separadores de miles.
    normalized = clean.replace(/\./g, "");
  } else {
    // Sin coma y con 0 o 1 punto → el punto (si existe) es decimal.
    normalized = clean;
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** Subtotal de una línea: precio × cantidad − bonificación%, redondeado a 2 decimales. */
export function lineSubtotal(l: { cantidad: number; precioUnitario: number; bonificacion?: number }): number {
  const bruto = l.precioUnitario * l.cantidad;
  const bonif = bruto * ((l.bonificacion ?? 0) / 100);
  return round2(bruto - bonif);
}
