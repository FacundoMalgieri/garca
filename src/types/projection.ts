/**
 * Types for the Projection/Planning feature
 */

/** Month in YYYY-MM format */
export type MonthKey = string

/** Historical monthly data aggregated from invoices */
export interface MonthlyTotal {
  month: MonthKey
  totalArs: number
  invoiceCount: number
}

/** User's projection for future months */
export interface ProjectionData {
  /** Target recategorization date (e.g., "2026-07" for July 2026) */
  targetRecategorizacion: MonthKey
  /** Target category (optional - if not set, just shows resulting category) */
  targetCategoria: string | null
  /** Safety margin in ARS (default: 200000) */
  margenSeguridad: number
  /** Projected amounts per month (YYYY-MM -> amount in ARS) */
  monthlyProjections: Record<MonthKey, number>
  /** Last updated timestamp */
  updatedAt: string
}

/** Result of projection calculation */
export interface ProjectionResult {
  /** Total income in the 12-month window */
  totalVentana: number
  /** Historical portion of the total */
  totalHistorico: number
  /** Projected portion of the total */
  totalProyectado: number
  /** Resulting category based on total */
  categoriaResultante: string
  /** Category threshold (tope) */
  topeCategoria: number
  /** Remaining margin before hitting the threshold */
  margenRestante: number
  /** Whether the projection exceeds the target */
  excedeObjetivo: boolean
  /** Recommended monthly amount to stay within target */
  montoRecomendadoMensual: number
  /** Number of future months in the window */
  mesesFuturos: number
  /** The 12-month window being calculated */
  ventana: MonthKey[]
}

/** Recategorization period info */
export interface RecategorizacionInfo {
  /** Month key (YYYY-MM) */
  month: MonthKey
  /** Display label (e.g., "Julio 2026") */
  label: string
  /** 12-month window that will be evaluated */
  ventana: MonthKey[]
}


