import { computeAnnualIncome } from "@/lib/facturador/annual-income"
import { computeCobertura } from "@/lib/monotributo/cobertura"
import { annualizeWindowTotal, countClosedMonths, getCategoriaByLetter, getCategoriaForTotal } from "@/lib/projection"
import type { AFIPInvoice } from "@/types/afip-scraper"
import type { CategoriaMonotributo, VentanaRecategorizacion } from "@/types/monotributo"
import type { RecategorizacionInfo } from "@/types/projection"

/**
 * Ingresos de una ventana de recategorización, marcando cuántos de sus 12 meses
 * ya cerraron. Una ventana en curso queda con `completa: false` para que nadie
 * lea su acumulado parcial como si fuera el total del período.
 *
 * `rangoConsultado` es obligatorio y puede ser null (no se sabe): sin él no hay
 * forma de distinguir un mes sin facturación de un mes que nunca se consultó, y
 * esa diferencia decide si `ingresos` es el total real de la ventana o sólo un
 * pedazo. Ver computeCobertura.
 */
export function buildVentanaRecategorizacion(
  info: RecategorizacionInfo,
  invoices: AFIPInvoice[],
  manualRates: Record<string, number>,
  rangoConsultado: { from: string; to: string } | null,
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
    cobertura: computeCobertura(info.ventana, rangoConsultado, today),
  }
}

/**
 * Categoría vigente hoy.
 *
 * Prioridad: la que informa ARCA (verdad legal). Si no está, se deriva de la
 * última ventana de recategorización YA CERRADA. Nunca de la ventana en curso:
 * es parcial y subestima la categoría (con 7 de 12 meses facturados, una
 * categoría H se ve como D).
 *
 * Y sólo si la consulta cubrió esa ventana COMPLETA. Un mes que no se consultó
 * suma $0 y hunde el total igual que un mes en blanco: el default de la app
 * ("hoy menos 12 meses") deja afuera el primer mes de la ventana cerrada, y eso
 * alcanzaba para mostrar G a un monotributista H. Ante cobertura parcial o
 * desconocida se devuelve null y el panel lo dice, en vez de arriesgar la letra.
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

  if (ventanaCerrada?.tieneDatos && ventanaCerrada.cobertura.estado === "completa") {
    return getCategoriaForTotal(ventanaCerrada.ingresos, categorias)
  }

  return null
}
