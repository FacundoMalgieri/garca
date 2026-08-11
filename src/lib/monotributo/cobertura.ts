import { isMonthInPast } from "@/lib/projection"
import type { CoberturaVentana } from "@/types/monotributo"

/** Último día del mes, como YYYY-MM-DD. El día 0 del mes siguiente es éste. */
function ultimoDiaDe(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number)
  const dia = new Date(year, month, 0).getDate()
  return `${monthKey}-${String(dia).padStart(2, "0")}`
}

/**
 * ¿La consulta cubrió este mes ENTERO?
 *
 * Entero y no "algo": un mes consultado a medias suma sólo parte de su
 * facturación, y ese total parcial es indistinguible de un mes flojo. Las
 * fechas son YYYY-MM-DD, así que alcanza la comparación lexicográfica.
 */
function mesCubierto(monthKey: string, rango: { from: string; to: string }): boolean {
  return rango.from <= `${monthKey}-01` && rango.to >= ultimoDiaDe(monthKey)
}

/**
 * Cobertura de una ventana de recategorización por el rango consultado a ARCA.
 *
 * Sólo se juzgan los meses YA CERRADOS: los que todavía no terminaron no pueden
 * estar cubiertos por una consulta que corta hoy, y contarlos como faltantes
 * marcaría toda ventana en curso como parcial.
 */
export function computeCobertura(
  ventana: string[],
  rango: { from: string; to: string } | null,
  today: Date = new Date()
): CoberturaVentana {
  const cerrados = ventana.filter((mes) => isMonthInPast(mes, today))

  if (!rango) {
    return { estado: "desconocida", mesesCubiertos: 0, mesesCerrados: cerrados.length, faltantes: [] }
  }

  const faltantes = cerrados.filter((mes) => !mesCubierto(mes, rango))

  return {
    estado: faltantes.length === 0 ? "completa" : "parcial",
    mesesCubiertos: cerrados.length - faltantes.length,
    mesesCerrados: cerrados.length,
    faltantes,
  }
}
