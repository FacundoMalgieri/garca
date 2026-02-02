"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias"
import {
  calculateProjection,
  formatMonthKey,
  getCategoriaByLetter,
  getFutureMonths,
  getNextRecategorizacionDates,
  getRecategorizacionWindow,
} from "@/lib/projection"
import type { AFIPInvoice } from "@/types/afip-scraper"
import type { TipoActividad } from "@/types/monotributo"
import type { MonthKey, MonthlyTotal, ProjectionData, ProjectionResult, RecategorizacionInfo } from "@/types/projection"

const STORAGE_KEY = "garca_projection"
const DEFAULT_MARGEN = 200000

/**
 * Parse invoice date from DD/MM/YYYY format
 */
function parseInvoiceDate(fecha: string): Date {
  const [day, month, year] = fecha.split("/")
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

/**
 * Convert invoices to monthly totals
 */
export function invoicesToMonthlyTotals(invoices: AFIPInvoice[]): MonthlyTotal[] {
  const monthlyMap = new Map<MonthKey, { total: number; count: number }>()

  for (const invoice of invoices) {
    const date = parseInvoiceDate(invoice.fecha)
    const monthKey = formatMonthKey(date)

    // Get existing or create new
    const existing = monthlyMap.get(monthKey) || { total: 0, count: 0 }

    // Convert to ARS if foreign currency
    let amountArs = invoice.importeTotal
    if (invoice.moneda !== "ARS" && invoice.xmlData?.exchangeRate) {
      amountArs = invoice.importeTotal * invoice.xmlData.exchangeRate
    }

    monthlyMap.set(monthKey, {
      total: existing.total + amountArs,
      count: existing.count + 1,
    })
  }

  // Convert to array and sort by month
  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      totalArs: data.total,
      invoiceCount: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Load projection data from localStorage
 */
function loadProjectionData(): ProjectionData | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as ProjectionData
  } catch {
    return null
  }
}

/**
 * Save projection data to localStorage
 */
function saveProjectionData(data: ProjectionData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save projection data:", error)
  }
}

interface UseProjectionOptions {
  invoices: AFIPInvoice[]
  tipoActividad: TipoActividad
}

interface UseProjectionReturn {
  // Data
  projectionData: ProjectionData
  projectionResult: ProjectionResult | null
  monthlyTotals: MonthlyTotal[]
  futureMonths: MonthKey[]
  recategorizacionOptions: RecategorizacionInfo[]

  // Actions
  setTargetRecategorizacion: (month: MonthKey) => void
  setTargetCategoria: (categoria: string | null) => void
  setMargenSeguridad: (margen: number) => void
  setMonthProjection: (month: MonthKey, amount: number) => void
  setAllProjections: (projections: Record<MonthKey, number>) => void
  applyRecommendation: () => void
  clearProjections: () => void

  // Helpers
  categorias: typeof MONOTRIBUTO_DATA.categorias
}

export function useProjection({ invoices, tipoActividad: _tipoActividad }: UseProjectionOptions): UseProjectionReturn {
  const categorias = MONOTRIBUTO_DATA.categorias

  // Get recategorization options
  const recategorizacionOptions = useMemo(() => getNextRecategorizacionDates(), [])

  // Default to next recategorization
  const defaultRecategorizacion = recategorizacionOptions[0]?.month || formatMonthKey(new Date())

  // State
  const [projectionData, setProjectionData] = useState<ProjectionData>(() => {
    const stored = loadProjectionData()
    if (stored) return stored

    return {
      targetRecategorizacion: defaultRecategorizacion,
      targetCategoria: null,
      margenSeguridad: DEFAULT_MARGEN,
      monthlyProjections: {},
      updatedAt: new Date().toISOString(),
    }
  })

  // Convert invoices to monthly totals
  const monthlyTotals = useMemo(() => invoicesToMonthlyTotals(invoices), [invoices])

  // Get future months based on target recategorization
  const futureMonths = useMemo(
    () => getFutureMonths(projectionData.targetRecategorizacion),
    [projectionData.targetRecategorizacion]
  )

  // Get the window for the target recategorization
  const ventana = useMemo(
    () => getRecategorizacionWindow(projectionData.targetRecategorizacion),
    [projectionData.targetRecategorizacion]
  )

  // Calculate projection result
  const projectionResult = useMemo(() => {
    const targetCat = projectionData.targetCategoria
      ? getCategoriaByLetter(projectionData.targetCategoria, categorias)
      : null

    return calculateProjection(
      ventana,
      monthlyTotals,
      projectionData.monthlyProjections,
      targetCat,
      projectionData.margenSeguridad,
      categorias
    )
  }, [ventana, monthlyTotals, projectionData, categorias])

  // Persist to localStorage when data changes
  useEffect(() => {
    saveProjectionData(projectionData)
  }, [projectionData])

  // Actions
  const setTargetRecategorizacion = useCallback((month: MonthKey) => {
    setProjectionData(prev => ({
      ...prev,
      targetRecategorizacion: month,
      monthlyProjections: {}, // Clear projections when changing target
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const setTargetCategoria = useCallback((categoria: string | null) => {
    setProjectionData(prev => ({
      ...prev,
      targetCategoria: categoria,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const setMargenSeguridad = useCallback((margen: number) => {
    setProjectionData(prev => ({
      ...prev,
      margenSeguridad: margen,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const setMonthProjection = useCallback((month: MonthKey, amount: number) => {
    setProjectionData(prev => ({
      ...prev,
      monthlyProjections: {
        ...prev.monthlyProjections,
        [month]: amount,
      },
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const setAllProjections = useCallback((projections: Record<MonthKey, number>) => {
    setProjectionData(prev => ({
      ...prev,
      monthlyProjections: projections,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const applyRecommendation = useCallback(() => {
    if (!projectionResult || futureMonths.length === 0) return

    const recommended = projectionResult.montoRecomendadoMensual
    const newProjections: Record<MonthKey, number> = {}

    for (const month of futureMonths) {
      newProjections[month] = recommended
    }

    setProjectionData(prev => ({
      ...prev,
      monthlyProjections: newProjections,
      updatedAt: new Date().toISOString(),
    }))
  }, [projectionResult, futureMonths])

  const clearProjections = useCallback(() => {
    setProjectionData(prev => ({
      ...prev,
      monthlyProjections: {},
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  return {
    projectionData,
    projectionResult,
    monthlyTotals,
    futureMonths,
    recategorizacionOptions,
    setTargetRecategorizacion,
    setTargetCategoria,
    setMargenSeguridad,
    setMonthProjection,
    setAllProjections,
    applyRecommendation,
    clearProjections,
    categorias,
  }
}

