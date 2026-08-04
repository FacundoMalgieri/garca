import { excedeMonotributo, getCategoriaForTotal } from "@/lib/projection"
import type { CategoriaMonotributo, VentanaRecategorizacion } from "@/types/monotributo"

/**
 * Qué le va a pasar a la categoría en la próxima recategorización.
 *
 * La distinción clave es entre lo *confirmado* y lo *proyectado*: mientras la
 * ventana está en curso los ingresos sólo pueden subir, así que superar el tope
 * vigente es un hecho irreversible ("suba-confirmada"), pero quedar por debajo
 * no lo es. Sugerir bajar de categoría con datos parciales es peligroso
 * (recategorizar de menos habilita recategorización de oficio o exclusión), por
 * eso una baja sólo se confirma con la ventana cerrada.
 */
export type RecategorizacionOutlookKind =
  /** No hay datos suficientes para estimar (ventana recién abierta o sin categoría vigente) */
  | "sin-datos"
  /** La estimación cae en la misma categoría vigente */
  | "estable"
  /** Lo ya facturado en la ventana supera el tope vigente: la suba es un hecho */
  | "suba-confirmada"
  /** Al ritmo actual la ventana terminaría por encima del tope vigente */
  | "suba-proyectada"
  /** Ventana cerrada por debajo del tope: se puede bajar de categoría */
  | "baja-confirmada"
  /** Al ritmo actual terminaría más abajo, pero la ventana sigue abierta */
  | "baja-posible"

export interface RecategorizacionOutlook {
  kind: RecategorizacionOutlookKind
  /** Categoría estimada al cierre de la ventana; null si no hay datos */
  categoriaEstimada: CategoriaMonotributo | null
  /** Excedente sobre el tope vigente, sólo en suba-confirmada (0 en el resto) */
  excedente: number
  /** La estimación supera el tope del régimen (exclusión, no categoría K) */
  excluido: boolean
}

export function getRecategorizacionOutlook({
  categoriaVigente,
  ventana,
  categorias,
}: {
  categoriaVigente: CategoriaMonotributo | null
  ventana: VentanaRecategorizacion
  categorias: CategoriaMonotributo[]
}): RecategorizacionOutlook {
  const sinDatos: RecategorizacionOutlook = {
    kind: "sin-datos",
    categoriaEstimada: null,
    excedente: 0,
    excluido: false,
  }

  if (!categoriaVigente || categorias.length === 0) return sinDatos
  if (ventana.mesesCerrados <= 0) return sinDatos

  const topeVigente = categoriaVigente.ingresosBrutos

  // Ya facturado por encima del tope: la ventana sólo puede crecer, así que la
  // suba está confirmada sin necesidad de proyectar nada.
  if (ventana.ingresos > topeVigente) {
    return {
      kind: "suba-confirmada",
      categoriaEstimada: getCategoriaForTotal(ventana.ingresos, categorias),
      excedente: ventana.ingresos - topeVigente,
      excluido: excedeMonotributo(ventana.ingresos, categorias),
    }
  }

  const estimado = ventana.completa ? ventana.ingresos : (ventana.ingresosAnualizados ?? ventana.ingresos)
  const categoriaEstimada = getCategoriaForTotal(estimado, categorias)
  const excluido = excedeMonotributo(estimado, categorias)

  if (!categoriaEstimada) return sinDatos

  if (categoriaEstimada.ingresosBrutos > topeVigente) {
    return { kind: "suba-proyectada", categoriaEstimada, excedente: 0, excluido }
  }

  if (categoriaEstimada.ingresosBrutos < topeVigente) {
    return {
      kind: ventana.completa ? "baja-confirmada" : "baja-posible",
      categoriaEstimada,
      excedente: 0,
      excluido,
    }
  }

  return { kind: "estable", categoriaEstimada, excedente: 0, excluido }
}
