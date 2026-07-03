/** Redondea a 2 decimales con half-up estable (evita errores binarios de coma flotante). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Subtotal de una línea: precio × cantidad − bonificación%, redondeado a 2 decimales. */
export function lineSubtotal(l: { cantidad: number; precioUnitario: number; bonificacion?: number }): number {
  const bruto = l.precioUnitario * l.cantidad;
  const bonif = bruto * ((l.bonificacion ?? 0) / 100);
  return round2(bruto - bonif);
}
