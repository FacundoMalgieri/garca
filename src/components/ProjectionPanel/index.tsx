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

/** Opciones de margen de seguridad, en pesos. */
const MARGENES = [0, 200_000, 500_000, 1_000_000, 2_000_000]

/**
 * Debajo de esto, el descuadre es redondeo y no una decisión.
 *
 * Repartir el recomendado entre los meses deja restos de pocos pesos: sin este
 * piso, el panel ofrecía "redistribuir $2" y la alarma roja saltaba por nada.
 */
const RESIDUO_IGNORABLE = 1_000

/** Número de meses en palabras, para que la frase no diga "1 meses". */
function mesesEnPalabras(n: number): string {
  const palabras = ["Cero", "Un", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez", "Once", "Doce"]
  if (n === 1) return "Un mes"
  return `${palabras[n] ?? n} meses`
}

/**
 * Monto abreviado para los extremos de la barra.
 *
 * Ahí el número compite con la respuesta principal: lo que importa es la
 * magnitud, no el peso exacto. El exacto vive en el desglose.
 */
function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    // toFixed(1) sobre 23.02 da "23,0": la decimal no aporta y ensucia el número.
    const texto = m.toFixed(1).endsWith(".0") ? m.toFixed(0) : m.toFixed(1)
    return `$${texto.replace(".", ",")}M`
  }
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`
  return `$${Math.round(value).toLocaleString("es-AR")}`
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
    toggleMonthLock,
    redistribute,
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

  // La recomendación reparte el disponible entre los meses que faltan. Si no hay
  // disponible, no hay nada que recomendar: es el caso "ya te pasaste".
  const noHayMargen = projectionResult.excedeObjetivo && projectionResult.totalProyectado === 0

  // Caer arriba del objetivo es el dato que más le importa al usuario y hoy vivía
  // como una línea perdida en el resumen. Va en la frase principal.
  const subeDeCategoria = projectionResult.categoriaResultante !== projectionResult.categoriaObjetivo

  const mesesLabel = mesesEnPalabras(futureMonths.length)

  // ¿El plan cargado sigue siendo el recomendado, o lo editaste a mano?
  //
  // El titular muestra SIEMPRE el recomendado. Si la frase dijera "a ese ritmo"
  // con meses editados, estaría atribuyéndole al recomendado un resultado que
  // produce otro plan — con Oct en $25M la frase anunciaba categoría J "a ese
  // ritmo" de $5,75M, que en realidad cae en H.
  //
  // El piso del mes en curso entra en la cuenta: su plan recomendado es
  // piso + recomendado, no el recomendado pelado.
  const planEsElRecomendado = futureMonths.every((month) => {
    const piso = historicalMap.get(month) || 0
    const esperado = piso + projectionResult.montoRecomendadoMensual
    return Math.abs((projectionData.monthlyProjections[month] || 0) - esperado) <= 1
  })

  const mesRecategorizacion = (
    recategorizacionOptions.find((o) => o.month === projectionData.targetRecategorizacion)?.label ?? ""
  )
    .split(" ")[0]
    .toLowerCase()

  // Plata del objetivo que no está asignada a ningún mes. No es un error:
  // facturar menos del tope es una decisión válida, así que se ofrece repartirla
  // sin teñirla de alerta.
  const sinAsignar = projectionResult.margenRestante >= RESIDUO_IGNORABLE ? projectionResult.margenRestante : 0
  // El espejo del sobrante. Se arregla con el MISMO reparto: cuando el
  // disponible queda por debajo de lo cargado, los meses abiertos bajan en vez
  // de subir.
  const exceso = projectionResult.margenRestante <= -RESIDUO_IGNORABLE ? -projectionResult.margenRestante : 0
  const mesesAbiertos = futureMonths.filter((month) => !projectionData.lockedMonths.includes(month))
  const puedeRedistribuir = sinAsignar > 0 && mesesAbiertos.length > 0

  // Meses ya cerrados de la ventana, para el mini-gráfico del desglose.
  const mesesCerrados = projectionResult.ventana
    .filter((month) => !futureMonths.includes(month))
    .map((month) => ({ month, total: historicalMap.get(month) || 0 }))

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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── La respuesta ────────────────────────────────────────────────
            El panel contesta UNA pregunta: cuánto podés facturar por mes sin
            pasarte. Va primero y es el elemento más grande; todo lo demás es
            evidencia o ajuste. */}
        {projectionResult.excluido ? (
          <div className="rounded-xl border-2 border-destructive/50 bg-destructive/5 p-5">
            <p className="text-destructive text-xl font-bold mb-1">Superás el tope del Monotributo</p>
            <p className="text-sm text-muted-foreground">
              Con esta proyección quedarías <strong className="text-foreground">excluido</strong> y
              deberías pasar a <strong className="text-foreground">Responsable Inscripto</strong>.
            </p>
          </div>
        ) : noHayMargen ? (
          <div className="rounded-xl border-2 border-destructive/50 bg-destructive/5 p-5">
            <p className="text-destructive text-xl font-bold mb-1">Ya excediste tu objetivo</p>
            <p className="text-sm text-muted-foreground">
              Con lo que llevás facturado, la categoría más baja posible es{" "}
              <strong className="text-foreground">{projectionResult.categoriaResultante}</strong>.
            </p>
          </div>
        ) : futureMonths.length === 0 ? (
          <div>
            <p className="text-sm text-muted-foreground">La ventana ya está cerrada</p>
            <p className="text-3xl font-bold font-mono tabular-nums mt-1">
              ${projectionResult.totalVentana.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm mt-1">
              Cerrás en categoría{" "}
              <strong className="text-success">{projectionResult.categoriaResultante}</strong>.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">
              Hasta la recategorización de {mesRecategorizacion} podés facturar
            </p>
            <p
              data-testid="monto-recomendado"
              className="text-4xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight text-success mt-1 mb-1"
            >
              ${recommendedRounded.toLocaleString("es-AR")}{" "}
              <span className="font-sans text-lg font-medium text-muted-foreground tracking-normal">por mes</span>
            </p>
            <p className="text-sm" data-testid="frase-consecuencia">
              {planEsElRecomendado ? `${mesesLabel} a ese ritmo y cerrás` : "Con lo que cargaste cerrás"}{" "}
              el año en categoría{" "}
              <strong className={cn(subeDeCategoria ? "text-destructive" : "text-success")}>
                {projectionResult.categoriaResultante}
              </strong>
              {subeDeCategoria ? (
                <>, arriba de tu objetivo {projectionResult.categoriaObjetivo}.</>
              ) : (
                <>, con ${Math.abs(distanciaAlLimite).toLocaleString("es-AR", { maximumFractionDigits: 0 })} de aire.</>
              )}
            </p>
          </div>
        )}

        {/* ── La prueba ───────────────────────────────────────────────────
            Único gráfico en reposo. Sin leyenda: los dos números de abajo
            etiquetan los segmentos, que es lo mismo que decían las cuatro
            entradas que había antes. */}
        <div>
          <div className="flex h-3 rounded-full bg-muted overflow-hidden">
            {historicalPercent > 0 && (
              <div
                className={cn("transition-all duration-500", isOverActualLimit ? "bg-destructive" : "bg-success")}
                style={{ flexGrow: historicalPercent, flexShrink: 1, flexBasis: 0 }}
              />
            )}
            {projectedPercent > 0 && (
              <div
                className={cn(
                  "transition-all duration-500 border-l-2 border-background",
                  isOverActualLimit ? "bg-destructive/60" : isOverSafetyMargin ? "bg-amber-400" : "bg-sky-400",
                  historicalPercent === 0 && "border-l-0"
                )}
                style={{ flexGrow: projectedPercent, flexShrink: 1, flexBasis: 0 }}
              />
            )}
            {disponiblePercent > 0 && (
              <div style={{ flexGrow: disponiblePercent, flexShrink: 1, flexBasis: 0 }} />
            )}
            {projectionData.margenSeguridad > 0 && !isOverActualLimit && (
              <div
                className="bg-amber-500/60 border-l-2 border-background transition-all duration-500"
                style={{ flexGrow: marginPercent, flexShrink: 0, flexBasis: 0, minWidth: 16 }}
              />
            )}
          </div>
          <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
            {/* Izquierda: de qué está hecha la barra. */}
            <span>
              <span className="font-mono tabular-nums text-foreground">
                {formatCompact(projectionResult.totalHistorico)}
              </span>{" "}
              facturado
              {projectionResult.totalProyectado > 0 && (
                <>
                  {" · "}
                  <span className="font-mono tabular-nums text-foreground">
                    {formatCompact(projectionResult.totalProyectado)}
                  </span>{" "}
                  proyectado
                </>
              )}
            </span>
            {/* Derecha: dónde termina la ventana. Exacto y no abreviado — es el
                número que contesta "¿en cuánto quedo?", y antes no estaba. */}
            <span data-testid="total-ventana" className="text-right">
              <span
                className={cn(
                  "font-mono tabular-nums font-medium",
                  isOverActualLimit ? "text-destructive" : "text-foreground"
                )}
              >
                ${projectionResult.totalVentana.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </span>{" "}
              de ${projectionResult.topeCategoria.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* ── Los ajustes ─────────────────────────────────────────────────
            Selects nativos con pinta de chip: se tocan una vez, no son una
            decisión previa a ver la respuesta. Nativos y no popovers para no
            reimplementar teclado, foco y mobile. */}
        <div className="flex flex-wrap gap-2">
          <ChipSelect
            id="projection-target-categoria"
            label="Objetivo"
            value={projectionData.targetCategoria || ""}
            onChange={(v) => setTargetCategoria(v || null)}
          >
            <option value="">Automático</option>
            {categorias.map((cat) => (
              <option key={cat.categoria} value={cat.categoria}>
                {cat.categoria} · {formatMargin(cat.ingresosBrutos)}
              </option>
            ))}
          </ChipSelect>

          <ChipSelect
            id="projection-margen-seguridad"
            label="Margen"
            value={String(projectionData.margenSeguridad)}
            onChange={(v) => setMargenSeguridad(Number(v))}
          >
            {MARGENES.map((m) => (
              <option key={m} value={m}>
                {m === 0 ? "Sin margen" : formatMargin(m)}
              </option>
            ))}
          </ChipSelect>

          <ChipSelect
            id="projection-target-recategorizacion"
            label="Recategorización"
            value={projectionData.targetRecategorizacion}
            onChange={setTargetRecategorizacion}
          >
            {recategorizacionOptions.map((opt) => (
              <option key={opt.month} value={opt.month}>
                {opt.label}
              </option>
            ))}
          </ChipSelect>
        </div>

        {/* ── El detalle, bajo demanda ────────────────────────────────────
            <details> nativo: teclado y lectores de pantalla gratis. */}
        <details data-testid="ajuste-mensual" className="border-t border-border pt-3 group">
          <summary className="cursor-pointer text-sm text-muted-foreground list-none flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-success rounded">
            <span className="text-[10px] transition-transform group-open:rotate-90 motion-reduce:transition-none">▶</span>
            Ajustar mes por mes
          </summary>

          <div className="mt-3 space-y-1.5">
            {futureMonths.map((month) => {
              const projectedValue = projectionData.monthlyProjections[month] || 0
              // El mes en curso ya puede tener facturación real. Es el piso del
              // mes —no se puede desfacturar— así que el input muestra el TOTAL
              // del mes y la ayuda dice cuánto falta para llegar a ese total.
              const yaFacturado = historicalMap.get(month) || 0
              const falta = Math.max(0, projectedValue - yaFacturado)
              const conCandado = projectionData.lockedMonths.includes(month)
              return (
                <div key={month} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background border border-border">
                  <span className="text-xs font-medium w-16 shrink-0">{getMonthShortLabel(month)}</span>
                  <button
                    type="button"
                    data-testid={`candado-${month}`}
                    aria-pressed={conCandado}
                    aria-label={
                      conCandado
                        ? `Soltar ${getMonthShortLabel(month)}: vuelve a entrar en el reparto`
                        : `Fijar ${getMonthShortLabel(month)}: no lo toca el reparto`
                    }
                    title={conCandado ? "Fijo — el reparto no lo toca" : "Fijar este mes"}
                    onClick={() => toggleMonthLock(month)}
                    className={cn(
                      // Ancho fijo: si la etiqueta cambiara de ancho al tocarla,
                      // toda la fila saltaría en cada click.
                      "shrink-0 w-[4.6rem] text-center rounded-full px-2 py-1 text-[11px] font-medium",
                      "cursor-pointer transition-colors border",
                      "focus-visible:outline-2 focus-visible:outline-success",
                      conCandado
                        ? "text-success border-success/30 bg-success/10"
                        : "text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    {conCandado ? "Fijo" : "Abierto"}
                  </button>
                  <div className="flex-1">
                    <CurrencyInput
                      value={projectedValue}
                      onChange={(val) => handleMonthEdit(month, val)}
                      placeholder={formatCurrency(recommendedRounded)}
                      ariaLabel={`Facturación proyectada para ${getMonthShortLabel(month)}`}
                      name={`projection-${month}`}
                      min={yaFacturado}
                    />
                    {yaFacturado > 0 && (
                      <p data-testid={`ya-facturado-${month}`} className="mt-1 text-[11px] text-muted-foreground">
                        Ya facturaste{" "}
                        <span className="font-mono text-foreground">
                          ${yaFacturado.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
                        {falta > 0 ? (
                          // "te quedan $X" se leía como aire contra el tope —que
                          // es como habla el resto del panel ("te sobran",
                          // "libres hasta H")— cuando es facturación nueva de
                          // ESTE mes. Con el total en rojo por pasarse, la frase
                          // parecía decir lo contrario de lo que pasaba.
                          <>
                            {" "}· proyectás{" "}
                            <span className="font-mono text-success">
                              ${falta.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                            </span>{" "}
                            más este mes
                          </>
                        ) : (
                          // Poner el total en lo ya emitido es decir "no facturo
                          // más este mes"; "te quedan $0" no decía nada.
                          <> · no proyectás nada más este mes</>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {puedeRedistribuir && (
              <div
                data-testid="sin-asignar"
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 mt-1 rounded-lg bg-muted/40 border border-border"
              >
                <span className="text-xs text-muted-foreground">
                  Te quedan{" "}
                  <span className="font-mono tabular-nums text-foreground">
                    ${sinAsignar.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </span>{" "}
                  sin asignar
                </span>
                <button
                  type="button"
                  onClick={redistribute}
                  className="text-xs font-medium text-success hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-success rounded"
                >
                  Redistribuir entre los {mesesAbiertos.length === 1 ? "meses abiertos" : `${mesesAbiertos.length} meses abiertos`}
                </button>
              </div>
            )}

            {exceso > 0 && (
              <div
                data-testid="te-pasas"
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 mt-1 rounded-lg bg-destructive/10 border border-destructive/30"
              >
                <span className="text-xs text-destructive">
                  Hay que recortar{" "}
                  <span className="font-mono tabular-nums font-medium">
                    ${exceso.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </span>{" "}
                  para entrar en {projectionResult.categoriaObjetivo}
                  {mesesAbiertos.length === 0 && " · todos los meses están fijos, soltá alguno para reajustar"}
                </span>
                {mesesAbiertos.length > 0 && (
                  <button
                    type="button"
                    onClick={redistribute}
                    className="text-xs font-medium text-destructive hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-destructive rounded"
                  >
                    Recortar {mesesAbiertos.length === 1 ? "el mes abierto" : `los ${mesesAbiertos.length} meses abiertos`}
                  </button>
                )}
              </div>
            )}

            {/* Editás arriba y el total se mueve acá: sin esto, tipear números no
                tenía respuesta numérica en ningún lado. */}
            <div
              data-testid="total-desglose"
              className="flex items-baseline justify-between gap-3 px-3 pt-3 mt-1 border-t border-border"
            >
              <span className="text-xs text-muted-foreground">Total de la ventana</span>
              <div className="text-right">
                <p
                  className={cn(
                    "font-mono tabular-nums font-semibold",
                    isOverActualLimit ? "text-destructive" : "text-foreground"
                  )}
                >
                  ${projectionResult.totalVentana.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </p>
                <p className={cn("text-[11px]", isOverActualLimit ? "text-destructive" : "text-muted-foreground")}>
                  {isOverActualLimit ? "te pasás por " : "te sobran "}
                  <span className="font-mono">
                    ${Math.abs(distanciaAlLimite).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </span>{" "}
                  {isOverActualLimit ? "del" : "para el"} tope de {projectionResult.categoriaObjetivo}
                </p>
              </div>
            </div>

            {hasCustomProjections && (
              <button onClick={handleClear} className="text-xs text-destructive hover:underline cursor-pointer">
                Limpiar
              </button>
            )}
          </div>

          {mesesCerrados.length > 0 && <ClosedMonthsChart months={mesesCerrados} />}
        </details>

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

/**
 * Select nativo con pinta de chip.
 *
 * Nativo y no un popover: teclado, foco y el picker de mobile vienen puestos, y
 * no hay posicionamiento que mantener.
 */
function ChipSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative inline-flex items-center gap-1.5 rounded-full border border-border bg-background pl-3 pr-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-success/50">
      <label htmlFor={id} className="text-muted-foreground shrink-0">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer max-w-[11rem]"
      >
        {children}
      </select>
    </div>
  )
}

/**
 * Los meses ya cerrados de la ventana.
 *
 * Una sola serie —lo facturado por mes—, así que un solo color y sin leyenda: el
 * título la nombra. El monto de cada mes va como TEXTO debajo de su barra, no
 * como color ni como tooltip, así que la identidad nunca depende de ver bien.
 * Las barras están para leer la forma del año de un vistazo; el número exacto lo
 * da el texto.
 */
function ClosedMonthsChart({ months }: { months: { month: string; total: number }[] }) {
  const max = Math.max(...months.map((m) => m.total), 0)
  const suma = months.reduce((acc, m) => acc + m.total, 0)

  return (
    <div className="mt-4 max-w-lg rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2.5">
        Meses cerrados ·{" "}
        <span className="font-mono tabular-nums text-foreground normal-case">
          ${suma.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
        </span>
      </p>

      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}
      >
        {months.map(({ month, total }) => {
          const pct = max > 0 ? (total / max) * 100 : 0
          return (
            <div key={month} className="flex flex-col items-center gap-1 min-w-0">
              <div className="flex h-20 w-full items-end">
                <div
                  data-testid={`barra-${month}`}
                  className="w-full rounded-t-[3px] bg-success/70"
                  style={{ height: total > 0 ? `${Math.max(pct, 4)}%` : 0 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {getMonthShortLabel(month).split(" ")[0]}
              </span>
              <span
                data-testid={`cerrado-${month}`}
                className="text-[10px] font-mono tabular-nums text-foreground truncate w-full text-center"
              >
                {formatCompact(total)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  name,
  min = 0,
}: {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  ariaLabel?: string
  name?: string
  /**
   * Piso del campo, aplicado al SALIR y no al tipear: clavarlo en cada tecla
   * pelearía con el teclado (borrar todo para escribir otro número saltaría al
   * piso en el primer dígito).
   */
  min?: number
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
    // Abajo del piso no es un valor posible: se sube y se avisa al padre, así el
    // campo no queda mostrando un número que no va a pasar.
    const clamped = Math.max(numValue, min)
    setDisplayValue(formatCurrency(clamped))
    if (clamped !== numValue) onChange(clamped)
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
