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

/** Convierte un número en formato AR ("3.500.000,00", "$ 1.234,50") a number. Devuelve 0 si no parsea. */
export function parseARNumber(s: string): number {
  const clean = s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

/** Subtotal de una línea: precio × cantidad − bonificación%, redondeado a 2 decimales. */
export function lineSubtotal(l: { cantidad: number; precioUnitario: number; bonificacion?: number }): number {
  const bruto = l.precioUnitario * l.cantidad;
  const bonif = bruto * ((l.bonificacion ?? 0) / 100);
  return round2(bruto - bonif);
}
