import { computeAnnualIncome } from "@/lib/facturador/annual-income"
import { annualizeWindowTotal, countClosedMonths, getCategoriaByLetter, getCategoriaForTotal } from "@/lib/projection"
import type { AFIPInvoice } from "@/types/afip-scraper"
import type { CategoriaMonotributo, VentanaRecategorizacion } from "@/types/monotributo"
import type { RecategorizacionInfo } from "@/types/projection"

/**
 * Ingresos de una ventana de recategorización, marcando cuántos de sus 12 meses
 * ya cerraron. Una ventana en curso queda con `completa: false` para que nadie
 * lea su acumulado parcial como si fuera el total del período.
 */
export function buildVentanaRecategorizacion(
  info: RecategorizacionInfo,
  invoices: AFIPInvoice[],
  manualRates: Record<string, number>,
  today: Date = new Date()
): VentanaRecategorizacion {
  const { ingresosAnuales, hasCurrentYearData } = computeAnnualIncome(invoices, manualRates, info.ventana)
  const totalMeses = info.ventana.length
  const mesesCerrados = countClosedMonths(info.ventana, today)

  return {
    label: info.label,
    desde: info.ventana[0],
    hasta: info.ventana[totalMeses - 1],
    ingresos: ingresosAnuales,
    mesesCerrados,
    totalMeses,
    completa: mesesCerrados >= totalMeses,
    ingresosAnualizados: annualizeWindowTotal(ingresosAnuales, mesesCerrados, totalMeses),
    tieneDatos: hasCurrentYearData,
  }
}

/**
 * Categoría vigente hoy.
 *
 * Prioridad: la que informa ARCA (verdad legal). Si no está, se deriva de la
 * última ventana de recategorización YA CERRADA. Nunca de la ventana en curso:
 * es parcial y subestima la categoría (con 7 de 12 meses facturados, una
 * categoría H se ve como D).
 */
export function resolveCategoriaVigente({
  categoriaARCA,
  ventanaCerrada,
  categorias,
}: {
  categoriaARCA?: string | null
  ventanaCerrada: VentanaRecategorizacion | null
  categorias: CategoriaMonotributo[]
}): CategoriaMonotributo | null {
  if (categoriaARCA) {
    const desdeARCA = getCategoriaByLetter(categoriaARCA, categorias)
    if (desdeARCA) return desdeARCA
  }

  if (ventanaCerrada?.tieneDatos) {
    return getCategoriaForTotal(ventanaCerrada.ingresos, categorias)
  }

  return null
}
