/** Subconjunto de MonotributoStatus que necesita esta función (evita acoplar al hook). */
export interface TopeStatusInput {
  /** Margen disponible hasta el tope de la categoría actual (ARS). */
  margenDisponible: number;
}

export type TopeLevel = "ok" | "warning" | "exceeds";

export interface TopeAlert {
  level: TopeLevel;
  /** Margen que quedaría luego de emitir esta factura (puede ser negativo). */
  margenRestante: number;
}

/** Umbral: si tras emitir el margen restante cae por debajo del 20% del margen previo, es warning. */
const WARNING_RATIO = 0.2;

/**
 * Calcula el impacto de una factura de `importe` sobre el margen de la categoría.
 * `status` puede ser null (sin datos de monotributo) → devuelve null.
 */
export function computeTopeAlert(status: TopeStatusInput | null, importe: number): TopeAlert | null {
  if (!status) return null;
  const margenRestante = status.margenDisponible - importe;
  if (margenRestante < 0) return { level: "exceeds", margenRestante };
  if (margenRestante < status.margenDisponible * WARNING_RATIO) return { level: "warning", margenRestante };
  return { level: "ok", margenRestante };
}
