"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { ExportDropdown } from "@/components/ExportDropdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { PdfReadySplash } from "@/components/ui/PdfReadySplash"
import { useInvoiceContext } from "@/contexts/InvoiceContext"
import { useProjection } from "@/hooks/useProjection"
import { trackUmamiEvent, UMAMI_EVENTS } from "@/lib/analytics/umami"
import { downloadPdfFile, sharePdfFile } from "@/lib/pdf-save"
import { getMonthShortLabel, roundToNearest } from "@/lib/projection"
import { cn } from "@/lib/utils"
import type { TipoActividad } from "@/types/monotributo"

import { exportProjectionToCSV, exportProjectionToJSON, exportProjectionToPDF } from "./exporters"

function formatMargin(value: number): string {
  if (value >= 1000000) {
    const m = value / 1000000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  return `$${(value / 1000).toFixed(0)}k`
}

/**
 * Format number as currency string (e.g., 3.500.000,50)
 * Uses Argentine format: . for thousands, , for decimals
 */
function formatCurrency(value: number): string {
  if (!value && value !== 0) return ""
  if (value === 0) return ""
  return value.toLocaleString("es-AR", { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })
}

/**
 * Parse Argentine currency string back to number
 * "3.500.000,50" -> 3500000.50
 */
function parseCurrency(value: string): number {
  if (!value) return 0
  // Remove thousand separators (.) and replace decimal comma with dot
  const cleaned = value
    .replace(/\./g, "")      // Remove thousand separators
    .replace(/,/g, ".")      // Replace decimal comma(s) with dot
    .replace(/[^\d.-]/g, "") // Remove any other non-numeric chars
  return parseFloat(cleaned) || 0
}

interface ProjectionPanelProps {
  tipoActividad: TipoActividad
}

export function ProjectionPanel({ tipoActividad }: ProjectionPanelProps) {
  const { state, manualExchangeRates } = useInvoiceContext()

  const {
    projectionData,
    projectionResult,
    monthlyTotals,
    futureMonths,
    recategorizacionOptions,
    setTargetRecategorizacion,
    setTargetCategoria,
    setMargenSeguridad,
    setMonthProjection,
    applyRecommendation,
    clearProjections,
    categorias,
  } = useProjection({
    invoices: state.invoices,
    tipoActividad,
    manualExchangeRates,
  })

  const [userHasCustomized, setUserHasCustomized] = useState(false)
  const [pdfReady, setPdfReady] = useState<File | null>(null)
  const lastRecommendation = useRef(0)

  useEffect(() => {
    if (!projectionResult || userHasCustomized) return

    const newRecommendation = roundToNearest(projectionResult.montoRecomendadoMensual)

    if (newRecommendation !== lastRecommendation.current) {
      lastRecommendation.current = newRecommendation
      applyRecommendation()
    }
  }, [
    projectionData.targetRecategorizacion,
    projectionData.targetCategoria,
    projectionData.margenSeguridad,
    projectionResult,
    applyRecommendation,
    userHasCustomized,
  ])

  const handleMonthEdit = (month: string, value: number) => {
    setUserHasCustomized(true)
    setMonthProjection(month, value)
  }

  const handleClear = () => {
    setUserHasCustomized(false)
    clearProjections()
  }

  if (!projectionResult) {
    return null
  }

  const recommendedRounded = roundToNearest(projectionResult.montoRecomendadoMensual)
  const hasCustomProjections = Object.values(projectionData.monthlyProjections).some(v => v > 0)

  // Create a map for quick historical lookup
  const historicalMap = new Map(monthlyTotals.map((m) => [m.month, m.totalArs]))
  
  // Calculate distance to actual category limit (without margin)
  const distanciaAlLimite = projectionResult.topeCategoria - projectionResult.totalVentana
  const isOverActualLimit = distanciaAlLimite < 0
  const isOverSafetyMargin = projectionResult.excedeObjetivo

  // Progress percentages for segmented bar (historical vs projected)
  const historicalPercent = projectionResult.topeCategoria > 0
    ? Math.min((projectionResult.totalHistorico / projectionResult.topeCategoria) * 100, 100)
    : 0
  const projectedPercent = projectionResult.topeCategoria > 0
    ? Math.min((projectionResult.totalProyectado / projectionResult.topeCategoria) * 100, 100 - historicalPercent)
    : 0
  const totalPercent = Math.min(historicalPercent + projectedPercent, 100)
  const marginPercent = projectionData.margenSeguridad > 0 && projectionResult.topeCategoria > 0
    ? (projectionData.margenSeguridad / projectionResult.topeCategoria) * 100
    : 0
  const disponiblePercent = Math.max(100 - totalPercent - marginPercent, 0)

  // Export handlers
  const getExportData = () => ({
    companyInfo: state.company,
    projectionData,
    projectionResult,
    monthlyTotals,
    futureMonths,
    tipoActividad,
  })

  const handleExportPDF = async () => {
    try {
      const result = await exportProjectionToPDF(getExportData())
      trackUmamiEvent(UMAMI_EVENTS.PanelExport, { context: "projection", format: "pdf" })
      if (result.canShare) {
        setPdfReady(result.file)
      }
    } catch (error) {
      console.error("Error generando PDF de proyección:", error)
    }
  }

  const handleSharePdf = useCallback(async () => {
    if (!pdfReady) return
    try {
      await sharePdfFile(pdfReady)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return
      console.error("Error sharing PDF:", err)
    } finally {
      setPdfReady(null)
    }
  }, [pdfReady])

  const handleDownloadPdf = useCallback(() => {
    if (!pdfReady) return
    downloadPdfFile(pdfReady)
    setPdfReady(null)
  }, [pdfReady])

  const handleDismissPdf = useCallback(() => {
    setPdfReady(null)
  }, [])

  const handleExportCSV = () => {
    exportProjectionToCSV(getExportData())
    trackUmamiEvent(UMAMI_EVENTS.PanelExport, { context: "projection", format: "csv" })
  }
  const handleExportJSON = () => {
    exportProjectionToJSON(getExportData())
    trackUmamiEvent(UMAMI_EVENTS.PanelExport, { context: "projection", format: "json" })
  }

  return (
    <>
      {pdfReady && (
        <PdfReadySplash
          onShare={handleSharePdf}
          onDownload={handleDownloadPdf}
          onDismiss={handleDismissPdf}
        />
      )}
      <Card className="h-full">
        <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ProjectIcon />
            Proyectar
          </CardTitle>
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Calculá cuánto podés facturar para mantenerte en tu categoría objetivo
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Settings Row */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Target Recategorization */}
          <div>
            <label htmlFor="projection-target-recategorizacion" className="text-xs text-muted-foreground block mb-1.5">
              Recategorización
            </label>
            <select
              id="projection-target-recategorizacion"
              name="projection-target-recategorizacion"
              value={projectionData.targetRecategorizacion}
              onChange={(e) => setTargetRecategorizacion(e.target.value)}
              className="w-full px-3 py-2 text-base md:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {recategorizacionOptions.map((opt) => (
                <option key={opt.month} value={opt.month}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Category */}
          <div>
            <label htmlFor="projection-target-categoria" className="text-xs text-muted-foreground block mb-1.5">
              Categoría objetivo
            </label>
            <select
              id="projection-target-categoria"
              name="projection-target-categoria"
              value={projectionData.targetCategoria || ""}
              onChange={(e) => setTargetCategoria(e.target.value || null)}
              className="w-full px-3 py-2 text-base md:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Automático</option>
              {categorias.map((cat) => (
                <option key={cat.categoria} value={cat.categoria}>
                  {cat.categoria} - ${(cat.ingresosBrutos / 1000000).toFixed(1)}M
                </option>
              ))}
            </select>
          </div>

          {/* Margin Setting */}
          <div>
            <label htmlFor="projection-margen-seguridad" className="text-xs text-muted-foreground block mb-1.5">
              Margen seguridad
            </label>
            <select
              id="projection-margen-seguridad"
              name="projection-margen-seguridad"
              value={projectionData.margenSeguridad}
              onChange={(e) => setMargenSeguridad(Number(e.target.value))}
              className="w-full px-3 py-2 text-base md:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value={0}>Sin margen</option>
              <option value={100000}>$100k</option>
              <option value={200000}>$200k</option>
              <option value={500000}>$500k</option>
              <option value={1000000}>$1M</option>
            </select>
          </div>
        </div>

        {/* Recommendation Card */}
        {projectionResult.excedeObjetivo && projectionResult.totalProyectado === 0 ? (
          <div className="rounded-xl border-2 border-destructive/50 bg-gradient-to-br from-destructive/10 to-destructive/5 p-5 text-center">
            <div className="text-destructive text-xl font-bold mb-2">⚠️ Límite excedido</div>
            <p className="text-sm text-muted-foreground">
              Con tus ingresos actuales ya excedés el objetivo.
              La categoría mínima posible sería <strong className="text-foreground">{projectionResult.categoriaResultante}</strong>.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Facturación recomendada
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">
                    ${recommendedRounded.toLocaleString("es-AR")}
                  </span>
                  <span className="text-muted-foreground text-sm">/mes</span>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs text-muted-foreground">Categoría objetivo</span>
                  <span className="text-lg font-bold text-emerald-500 dark:text-emerald-400">{projectionResult.categoriaObjetivo}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  × {futureMonths.length} meses restantes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progreso hacia límite de {projectionResult.categoriaObjetivo}</span>
            <span>{totalPercent.toFixed(0)}%</span>
          </div>
          <div className="flex h-4 rounded-full bg-muted overflow-hidden">
            {/* Historical segment */}
            {historicalPercent > 0 && (
              <div 
                className={cn(
                  "transition-all duration-500",
                  isOverActualLimit ? "bg-destructive" : "bg-emerald-500"
                )}
                style={{ flexGrow: historicalPercent, flexShrink: 1, flexBasis: 0 }}
              />
            )}
            {/* Projected segment */}
            {projectedPercent > 0 && (
              <div 
                className={cn(
                  "transition-all duration-500 border-l-2 border-background",
                  isOverActualLimit 
                    ? "bg-red-400" 
                    : isOverSafetyMargin 
                      ? "bg-amber-400" 
                      : "bg-sky-400",
                  historicalPercent === 0 && "border-l-0",
                )}
                style={{ flexGrow: projectedPercent, flexShrink: 1, flexBasis: 0 }}
              />
            )}
            {/* Disponible (space between projected and margin) */}
            {disponiblePercent > 0 && (
              <div style={{ flexGrow: disponiblePercent, flexShrink: 1, flexBasis: 0 }} />
            )}
            {/* Safety margin segment — guaranteed min-width via flex-shrink: 0 */}
            {projectionData.margenSeguridad > 0 && !isOverActualLimit && (
              <div 
                className="bg-amber-500/60 border-l-2 border-background transition-all duration-500"
                style={{ flexGrow: marginPercent, flexShrink: 0, flexBasis: 0, minWidth: 24 }}
              />
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className={cn("inline-block w-2.5 h-2.5 rounded-sm", isOverActualLimit ? "bg-destructive" : "bg-emerald-500")} />
              Histórico ({historicalPercent.toFixed(0)}%)
            </span>
            {projectedPercent > 0 && (
              <span className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-block w-2.5 h-2.5 rounded-sm",
                  isOverActualLimit ? "bg-red-400" : isOverSafetyMargin ? "bg-amber-400" : "bg-sky-400"
                )} />
                Proyectado ({projectedPercent.toFixed(0)}%)
              </span>
            )}
            {disponiblePercent > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-muted border border-border" />
                Disponible ({disponiblePercent.toFixed(0)}%)
              </span>
            )}
            {projectionData.margenSeguridad > 0 && (
              <span className={cn(
                "flex items-center gap-1.5 font-medium",
                isOverSafetyMargin ? "text-amber-500" : "text-muted-foreground"
              )}>
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500/40" />
                Margen: {formatMargin(projectionData.margenSeguridad)}
              </span>
            )}
          </div>
        </div>

        {/* Monthly Projection Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Proyección mensual</span>
            {hasCustomProjections && (
              <button
                onClick={handleClear}
                className="text-xs text-destructive hover:underline cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Historical months */}
          {monthlyTotals.filter(m => !futureMonths.includes(m.month)).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Histórico</p>
              <div className="grid gap-1">
                {projectionResult.ventana
                  .filter(month => !futureMonths.includes(month))
                  .map((month) => {
                    const historicalValue = historicalMap.get(month) || 0
                    return (
                      <div
                        key={month}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/50"
                      >
                        <span className="text-xs text-muted-foreground w-16">
                          {getMonthShortLabel(month)}
                        </span>
                        <span className="text-sm font-mono text-muted-foreground">
                          ${historicalValue.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Future months */}
          {futureMonths.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">A proyectar</p>
              <div className="grid gap-1.5">
                {futureMonths.map((month) => {
                  const projectedValue = projectionData.monthlyProjections[month] || 0
                  return (
                    <div
                      key={month}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background border border-border"
                    >
                      <span className="text-xs font-medium w-16 shrink-0 text-foreground">
                        {getMonthShortLabel(month)}
                      </span>
                      <div className="flex-1">
                        <CurrencyInput
                          value={projectedValue}
                          onChange={(val) => handleMonthEdit(month, val)}
                          placeholder={formatCurrency(recommendedRounded)}
                          ariaLabel={`Facturación proyectada para ${getMonthShortLabel(month)}`}
                          name={`projection-${month}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">
            Resumen de proyección
          </div>

          {/* Total and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total ventana 12 meses</p>
              <p className="text-xl font-bold font-mono">
                ${projectionResult.totalVentana.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">
                ${projectionResult.totalHistorico.toLocaleString("es-AR", { maximumFractionDigits: 0 })} histórico + ${projectionResult.totalProyectado.toLocaleString("es-AR", { maximumFractionDigits: 0 })} proyectado
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground">Categoría objetivo</p>
              <p className={cn(
                "text-3xl font-bold",
                isOverActualLimit ? "text-destructive" : "text-success"
              )}>
                {projectionResult.categoriaObjetivo}
              </p>
              <p className="text-xs text-muted-foreground">
                Límite: ${projectionResult.topeCategoria.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </p>
              {projectionResult.categoriaResultante !== projectionResult.categoriaObjetivo && (
                <p className="text-xs text-muted-foreground">
                  Resultante: <strong className="text-foreground">{projectionResult.categoriaResultante}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Distance and Margin */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            <div className={cn(
              "flex-1 min-w-[140px] rounded-lg px-3 py-2",
              isOverActualLimit ? "bg-destructive/10" : "bg-success/10"
            )}>
              <p className="text-xs text-muted-foreground mb-0.5">Distancia al límite</p>
              <p className={cn(
                "font-mono font-bold",
                isOverActualLimit ? "text-destructive" : "text-success"
              )}>
                {isOverActualLimit ? "-" : "+"}${Math.abs(distanciaAlLimite).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </p>
            </div>

            {projectionData.margenSeguridad > 0 && (
              <div className={cn(
                "flex-1 min-w-[140px] rounded-lg px-3 py-2",
                isOverSafetyMargin ? "bg-yellow-500/10" : "bg-success/10"
              )}>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Margen {formatMargin(projectionData.margenSeguridad)}
                </p>
                <p className={cn(
                  "font-bold",
                  isOverSafetyMargin ? "text-yellow-500" : "text-success"
                )}>
                  {isOverSafetyMargin ? "⚠️ Usado" : "✓ Respetado"}
                </p>
              </div>
            )}
          </div>

          {/* Alert if over safety margin */}
          {isOverSafetyMargin && !isOverActualLimit && (
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 mt-2">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ Estás dentro de tu margen de seguridad. Considera facturar menos.
              </p>
            </div>
          )}

          {/* Alert if over actual limit */}
          {isOverActualLimit && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 mt-2">
              <p className="text-xs text-destructive">
                ❌ Excedés el límite de la categoría {projectionResult.categoriaObjetivo}. Deberás subir de categoría.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/70 text-center">
          * Proyección estimativa. Puede variar según cotización del dólar al momento de facturar.
        </p>
      </CardContent>
      </Card>
    </>
  )
}

// ============ Sub-components ============

function CurrencyInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  name,
}: {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  ariaLabel?: string
  name?: string
}) {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value))

  // Sync display value when external value changes
  useEffect(() => {
    setDisplayValue(formatCurrency(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<React.ElementRef<"input">>) => {
    const raw = e.target.value.replace(/^\$\s*/, "") // Remove $ prefix
    
    // Allow typing: digits, dots (thousands), comma (decimal)
    // Only allow one comma for decimals
    const cleaned = raw.replace(/[^\d.,]/g, "")
    
    // Validate format: allow partial input while typing
    // E.g., "3.", "3.5", "3.500", "3.500.", "3.500.0", "3.500.000", "3.500.000,"
    setDisplayValue(cleaned)
    
    // Parse and update parent
    const numValue = parseCurrency(cleaned)
    onChange(numValue)
  }

  const handleBlur = () => {
    // Re-format on blur to clean up
    const numValue = parseCurrency(displayValue)
    setDisplayValue(formatCurrency(numValue))
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      name={name}
      aria-label={ariaLabel}
      value={displayValue ? `$ ${displayValue}` : ""}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder ? `$ ${placeholder}` : ""}
      className="w-full px-2 py-1 text-base md:text-sm font-mono text-right rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/40"
    />
  )
}

// ============ Icons ============

function ProjectIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}
