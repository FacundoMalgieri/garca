/**
 * Pure functions for projection/planning calculations.
 * All functions are deterministic and easily testable.
 */

import type { CategoriaMonotributo } from "@/types/monotributo"
import type { MonthKey, MonthlyTotal, ProjectionResult, RecategorizacionInfo } from "@/types/projection"

/**
 * Format a date as YYYY-MM
 */
export function formatMonthKey(date: Date): MonthKey {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/**
 * Parse a YYYY-MM string to a Date (first day of month)
 */
export function parseMonthKey(monthKey: MonthKey): Date {
  const [year, month] = monthKey.split("-").map(Number)
  return new Date(year, month - 1, 1)
}

/**
 * Get the month key for N months from a given date
 */
export function addMonths(monthKey: MonthKey, months: number): MonthKey {
  const date = parseMonthKey(monthKey)
  date.setMonth(date.getMonth() + months)
  return formatMonthKey(date)
}

/**
 * Get the display label for a month (e.g., "Julio 2026")
 */
export function getMonthLabel(monthKey: MonthKey): string {
  const [year, month] = monthKey.split("-").map(Number)
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  return `${monthNames[month - 1]} ${year}`
}

/**
 * Get the short label for a month (e.g., "Jul '26")
 */
export function getMonthShortLabel(monthKey: MonthKey): string {
  const [year, month] = monthKey.split("-").map(Number)
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return `${monthNames[month - 1]} '${String(year).slice(2)}`
}

/**
 * Get the next recategorization dates (January and July)
 * Returns the next 3-4 possible dates
 */
export function getNextRecategorizacionDates(today: Date = new Date()): RecategorizacionInfo[] {
  const currentMonth = today.getMonth() // 0-indexed
  const currentYear = today.getFullYear()
  
  const dates: RecategorizacionInfo[] = []
  
  // Determine starting point
  let year = currentYear
  let startMonth = currentMonth < 6 ? 6 : 0 // July (6) or January (0)
  if (startMonth === 0) year++ // If next is January, it's next year
  
  // Generate next 4 recategorization periods
  for (let i = 0; i < 4; i++) {
    const month = startMonth === 6 ? 6 : 0
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`
    
    dates.push({
      month: monthKey,
      label: getMonthLabel(monthKey),
      ventana: getRecategorizacionWindow(monthKey),
    })
    
    // Alternate between July and January
    if (startMonth === 6) {
      startMonth = 0
      year++
    } else {
      startMonth = 6
    }
  }
  
  return dates
}

/**
 * Get the 12-month window for a recategorization date.
 * The window includes the 12 months BEFORE the recategorization month.
 * 
 * Example: For July 2026 recategorization, window is July 2025 - June 2026
 */
export function getRecategorizacionWindow(targetMonth: MonthKey): MonthKey[] {
  const months: MonthKey[] = []
  
  // Window is 12 months before the target
  // e.g., July 2026 recategorization looks at July 2025 - June 2026
  for (let i = 12; i >= 1; i--) {
    months.push(addMonths(targetMonth, -i))
  }
  
  return months
}

/**
 * Get the current month key
 */
export function getCurrentMonth(today: Date = new Date()): MonthKey {
  return formatMonthKey(today)
}

/**
 * Get future months from current month until (but not including) the target month
 */
export function getFutureMonths(targetMonth: MonthKey, today: Date = new Date()): MonthKey[] {
  const currentMonth = formatMonthKey(today)
  const months: MonthKey[] = []
  
  let month = currentMonth
  while (month < targetMonth) {
    months.push(month)
    month = addMonths(month, 1)
  }
  
  return months
}

/**
 * Check if a month is in the past (before current month)
 */
export function isMonthInPast(monthKey: MonthKey, today: Date = new Date()): boolean {
  const currentMonth = formatMonthKey(today)
  return monthKey < currentMonth
}

/**
 * Check if a month is current or future
 */
export function isMonthCurrentOrFuture(monthKey: MonthKey, today: Date = new Date()): boolean {
  const currentMonth = formatMonthKey(today)
  return monthKey >= currentMonth
}

/**
 * Get the category for a given total income
 */
export function getCategoriaForTotal(
  total: number,
  categorias: CategoriaMonotributo[]
): CategoriaMonotributo | null {
  // Sort by ingresosBrutos ascending
  const sorted = [...categorias].sort((a, b) => a.ingresosBrutos - b.ingresosBrutos)
  
  // Find the first category where total fits within the limit
  for (const cat of sorted) {
    if (total <= cat.ingresosBrutos) {
      return cat
    }
  }
  
  // If exceeds all categories, return the highest one
  return sorted[sorted.length - 1] || null
}

/**
 * Get a category by its letter
 */
export function getCategoriaByLetter(
  letra: string,
  categorias: CategoriaMonotributo[]
): CategoriaMonotributo | null {
  return categorias.find(c => c.categoria === letra) || null
}

/**
 * Sum the income for a 12-month window
 */
export function sumWindow(
  ventana: MonthKey[],
  historical: MonthlyTotal[],
  projections: Record<MonthKey, number>,
  today: Date = new Date()
): { total: number; historico: number; proyectado: number } {
  const currentMonth = formatMonthKey(today)
  
  let historico = 0
  let proyectado = 0
  
  // Create a map for quick historical lookup
  const historicalMap = new Map(historical.map(h => [h.month, h.totalArs]))
  
  for (const month of ventana) {
    if (month < currentMonth) {
      // Past month - use historical data
      historico += historicalMap.get(month) || 0
    } else {
      // Current or future month - use projection
      proyectado += projections[month] || 0
    }
  }
  
  return {
    total: historico + proyectado,
    historico,
    proyectado,
  }
}

/**
 * Calculate recommended monthly amount to stay within a target category
 */
export function getRecommendedMonthlyAmount(
  targetCategoria: CategoriaMonotributo | null,
  margenSeguridad: number,
  mesesFuturos: number,
  totalHistoricoEnVentana: number,
  categorias: CategoriaMonotributo[]
): number {
  if (mesesFuturos <= 0) return 0
  
  // If no target, use the highest category
  const target = targetCategoria || categorias[categorias.length - 1]
  if (!target) return 0
  
  const topeConMargen = target.ingresosBrutos - margenSeguridad
  const disponible = topeConMargen - totalHistoricoEnVentana
  
  if (disponible <= 0) return 0
  
  return Math.floor(disponible / mesesFuturos)
}

/**
 * Calculate the full projection result
 */
export function calculateProjection(
  ventana: MonthKey[],
  historical: MonthlyTotal[],
  projections: Record<MonthKey, number>,
  targetCategoria: CategoriaMonotributo | null,
  margenSeguridad: number,
  categorias: CategoriaMonotributo[],
  today: Date = new Date()
): ProjectionResult {
  const { total, historico, proyectado } = sumWindow(ventana, historical, projections, today)
  
  const categoriaResultante = getCategoriaForTotal(total, categorias)
  const currentMonth = formatMonthKey(today)
  
  // Count future months in the window
  const mesesFuturos = ventana.filter(m => m >= currentMonth).length
  
  // Calculate historical total only for past months in the window
  const pastMonthsInWindow = ventana.filter(m => m < currentMonth)
  const historicalMap = new Map(historical.map(h => [h.month, h.totalArs]))
  const totalHistoricoEnVentana = pastMonthsInWindow.reduce(
    (sum, m) => sum + (historicalMap.get(m) || 0),
    0
  )
  
  // Determine effective target for calculations
  const effectiveTarget = targetCategoria || categoriaResultante
  const topeCategoria = effectiveTarget?.ingresosBrutos || 0
  
  // Calculate margin
  const margenRestante = topeCategoria - margenSeguridad - total
  const excedeObjetivo = total > (topeCategoria - margenSeguridad)
  
  // Calculate recommendation
  const montoRecomendadoMensual = getRecommendedMonthlyAmount(
    targetCategoria,
    margenSeguridad,
    mesesFuturos,
    totalHistoricoEnVentana,
    categorias
  )
  
  return {
    totalVentana: total,
    totalHistorico: historico,
    totalProyectado: proyectado,
    categoriaResultante: categoriaResultante?.categoria || "K",
    topeCategoria,
    margenRestante,
    excedeObjetivo,
    montoRecomendadoMensual,
    mesesFuturos,
    ventana,
  }
}

/**
 * Distribute an amount evenly across future months
 */
export function distributeEvenly(
  amount: number,
  futureMonths: MonthKey[]
): Record<MonthKey, number> {
  if (futureMonths.length === 0) return {}
  
  const perMonth = Math.floor(amount / futureMonths.length)
  const result: Record<MonthKey, number> = {}
  
  for (const month of futureMonths) {
    result[month] = perMonth
  }
  
  return result
}

/**
 * Round a number to the nearest increment (e.g., 10000)
 */
export function roundToNearest(value: number, increment: number = 10000): number {
  return Math.round(value / increment) * increment
}

