"use client"

import Link from "next/link"
import { useCallback, useMemo, useState } from "react"

import { SupportBanner } from "@/components/ui/SupportBanner"
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias"
import {
  calculateProjection,
  formatMonthKey,
  getCategoriaByLetter,
  getMonthShortLabel,
  getNextRecategorizacionDates,
  getRecategorizacionWindow,
  getRecommendedMonthlyAmount,
} from "@/lib/projection"
import { cn } from "@/lib/utils"
import type { TipoActividad } from "@/types/monotributo"
import type { MonthKey } from "@/types/projection"

const categorias = MONOTRIBUTO_DATA.categorias

const FAQ_ITEMS = [
  {
    question: "¿Cómo funciona la calculadora de Monotributo?",
    answer: (
      <>
        Esta calculadora gratuita te permite <strong>proyectar en qué categoría de Monotributo vas a quedar</strong> en
        tu próxima recategorización. Ingresás tu facturación <strong>mes a mes</strong> para
        los últimos 12 meses y los meses futuros, y la herramienta calcula automáticamente tu categoría resultante.
        Podés usar el botón <strong>&ldquo;Aplicar recomendación&rdquo;</strong> para que
        la calculadora llene los meses futuros con el monto máximo que podés facturar sin cambiar de categoría.
      </>
    ),
  },
  {
    question: "¿Cuándo me tengo que recategorizar?",
    answer: (
      <>
        La <strong>recategorización del Monotributo</strong> se realiza dos veces al año: en <strong>enero</strong> y en <strong>julio</strong>.
        Debés evaluar tus ingresos brutos acumulados de los últimos 12 meses y verificar si corresponde cambiar de categoría.
        Si tus ingresos superan el límite de tu categoría actual, debés subir. Si bajaron, podés bajar y pagar menos.
      </>
    ),
  },
  {
    question: "¿Qué incluye el pago mensual del Monotributo?",
    answer: (
      <>
        El pago mensual tiene tres componentes: <strong>Impuesto integrado</strong> (reemplaza IVA y Ganancias, varía según categoría y actividad),{" "}
        <strong>Aportes jubilatorios (SIPA)</strong> al sistema previsional, y <strong>Obra social</strong> (cobertura de salud obligatoria).
      </>
    ),
  },
  {
    question: "¿Qué pasa si me paso de categoría?",
    answer: (
      <>
        Si al momento de la recategorización tus ingresos superan el tope de tu categoría, ARCA te va a
        recategorizar de oficio a la categoría que corresponda. Esto implica un <strong>aumento en tu cuota mensual</strong>.
        Por eso es importante monitorear tus ingresos y planificar tu facturación.
        Si superás la categoría K, debés inscribirte como <strong>Responsable Inscripto</strong>.
      </>
    ),
  },
  {
    question: "¿Cómo me ayuda GARCA con esto?",
    answer: (
      <>
        GARCA se conecta directamente con ARCA (ex AFIP), descarga tus comprobantes reales y te muestra tu situación actual con datos precisos.
        Podés ver tu categoría actual, cuánto te falta para el tope, y proyectar tu facturación futura.{" "}
        <strong>Es gratis y no almacena tus datos en ningún servidor.</strong>
      </>
    ),
  },
]

function formatARS(value: number): string {
  return value.toLocaleString("es-AR", { maximumFractionDigits: 0 })
}

function formatMargin(value: number): string {
  if (value >= 1000000) {
    const m = value / 1000000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  return `$${(value / 1000).toFixed(0)}k`
}

function parseCurrencyInput(raw: string): number {
  return parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0
}

function formatInputValue(num: number): string {
  return num > 0 ? num.toLocaleString("es-AR") : ""
}

export default function CalculadoraMonotributoPage() {
  const [tipoActividad, setTipoActividad] = useState<TipoActividad>("servicios")
  const [targetCategoria, setTargetCategoria] = useState<string | null>(null)
  const [margenSeguridad, setMargenSeguridad] = useState(0)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const recategorizacionOptions = useMemo(() => getNextRecategorizacionDates(), [])
  const [targetRecat, setTargetRecat] = useState(recategorizacionOptions[0]?.month || formatMonthKey(new Date()))

  const ventana = useMemo(() => getRecategorizacionWindow(targetRecat), [targetRecat])

  const currentMonth = formatMonthKey(new Date())
  const pastMonths = useMemo(() => ventana.filter(m => m < currentMonth), [ventana, currentMonth])
  const futureMonths = useMemo(() => ventana.filter(m => m >= currentMonth), [ventana, currentMonth])

  const [monthlyInputs, setMonthlyInputs] = useState<Record<MonthKey, number>>({})

  const setMonthValue = useCallback((month: MonthKey, value: number) => {
    setMonthlyInputs(prev => ({ ...prev, [month]: value }))
  }, [])

  const historicalTotals = useMemo(
    () => pastMonths.map(month => ({
      month,
      totalArs: monthlyInputs[month] || 0,
      invoiceCount: monthlyInputs[month] ? 1 : 0,
    })),
    [pastMonths, monthlyInputs]
  )

  const futureProjections = useMemo(
    () => Object.fromEntries(futureMonths.map(m => [m, monthlyInputs[m] || 0])),
    [futureMonths, monthlyInputs]
  )

  const hasAnyInput = Object.values(monthlyInputs).some(v => v > 0)

  const targetCat = useMemo(
    () => targetCategoria ? getCategoriaByLetter(targetCategoria, categorias) : null,
    [targetCategoria]
  )

  const projectionResult = useMemo(() => {
    return calculateProjection(ventana, historicalTotals, futureProjections, targetCat, margenSeguridad, categorias)
  }, [ventana, historicalTotals, futureProjections, targetCat, margenSeguridad])

  const historicalTotal = useMemo(
    () => pastMonths.reduce((sum, m) => sum + (monthlyInputs[m] || 0), 0),
    [pastMonths, monthlyInputs]
  )

  const recommendation = useMemo(() => {
    if (futureMonths.length === 0) return null
    if (!targetCat && historicalTotal === 0) return null
    const raw = getRecommendedMonthlyAmount(targetCat, margenSeguridad, futureMonths.length, historicalTotal, categorias)
    return Math.floor(raw / 10000) * 10000
  }, [futureMonths, historicalTotal, targetCat, margenSeguridad])

  const applyRecommendation = useCallback(() => {
    if (!recommendation || recommendation <= 0) return
    setMonthlyInputs(prev => {
      const next = { ...prev }
      for (const m of futureMonths) {
        next[m] = recommendation
      }
      return next
    })
  }, [recommendation, futureMonths])

  const clearAll = useCallback(() => {
    setMonthlyInputs({})
  }, [])

  const totalVentana = ventana.reduce((sum, m) => sum + (monthlyInputs[m] || 0), 0)
  const pago = useMemo(() => {
    const cat = categorias.find(c => c.categoria === projectionResult.categoriaObjetivo)
    return cat ? (tipoActividad === "servicios" ? cat.total.servicios : cat.total.venta) : 0
  }, [projectionResult, tipoActividad])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-500/10 via-background to-background pt-12 pb-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Calculadora de <span className="text-blue-600 dark:text-blue-400">Monotributo 2026</span>
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Ingresá tu facturación mes a mes y proyectá en qué categoría vas a quedar en tu próxima recategorización.
            Planificá cuánto podés facturar para no pasarte de categoría.
          </p>
        </div>
      </section>

      {/* Projection Tool */}
      <section className="px-4 pb-12 -mt-2">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg space-y-6">

            {/* Config Row — 1 col mobile, 2x2 desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Recategorización</label>
                <select
                  value={targetRecat}
                  onChange={e => setTargetRecat(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {recategorizacionOptions.map(opt => (
                    <option key={opt.month} value={opt.month}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Categoría objetivo</label>
                <select
                  value={targetCategoria || ""}
                  onChange={e => setTargetCategoria(e.target.value || null)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Automático</option>
                  {categorias.map(cat => (
                    <option key={cat.categoria} value={cat.categoria}>
                      {cat.categoria} — hasta ${formatARS(cat.ingresosBrutos)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Margen de seguridad</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-sm text-muted-foreground">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatInputValue(margenSeguridad)}
                    onChange={e => setMargenSeguridad(parseCurrencyInput(e.target.value))}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2.5 text-base md:text-sm font-mono rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo de actividad</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTipoActividad("servicios")}
                    className={cn(
                      "flex-1 px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer",
                      tipoActividad === "servicios"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    Servicios
                  </button>
                  <button
                    onClick={() => setTipoActividad("venta")}
                    className={cn(
                      "flex-1 px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer",
                      tipoActividad === "venta"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    Venta de Bienes
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly Inputs */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                <h3 className="text-sm font-medium">
                  Facturación mensual
                </h3>
                <div className="flex gap-2">
                  {recommendation != null && recommendation > 0 && (
                    <button
                      onClick={applyRecommendation}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer font-medium"
                    >
                      Aplicar recomendación (${formatARS(recommendation)}/mes)
                    </button>
                  )}
                  {hasAnyInput && (
                    <button
                      onClick={clearAll}
                      className="text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ventana.map(month => {
                  const isFuture = month >= currentMonth
                  return (
                    <div key={month}>
                      <label className={cn(
                        "text-xs mb-1.5 block font-medium",
                        isFuture ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                      )}>
                        {getMonthShortLabel(month)}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-sm text-muted-foreground">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(monthlyInputs[month] || 0)}
                          onChange={e => setMonthValue(month, parseCurrencyInput(e.target.value))}
                          placeholder="0"
                          className={cn(
                            "w-full pl-7 pr-3 py-2.5 text-base md:text-sm font-mono rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all",
                            isFuture ? "border-blue-500/30" : "border-border"
                          )}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Results */}
            {hasAnyInput ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Category + Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div className={cn(
                    "sm:col-span-2 rounded-xl p-6 flex flex-col items-center justify-center",
                    projectionResult.excedeObjetivo
                      ? "bg-destructive/10 border-2 border-destructive/30"
                      : "bg-blue-500/10 border-2 border-blue-500/30"
                  )}>
                    <p className="text-xs text-muted-foreground">Categoría resultante</p>
                    <p className={cn(
                      "text-5xl font-bold my-2",
                      projectionResult.excedeObjetivo ? "text-destructive" : "text-blue-600 dark:text-blue-400"
                    )}>
                      {projectionResult.categoriaResultante}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tope: ${formatARS(projectionResult.topeCategoria)}
                    </p>
                  </div>

                  <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/50 p-4 flex flex-col justify-center">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Total 12 meses</p>
                      <p className="text-lg font-bold font-mono">${formatARS(totalVentana)}</p>
                    </div>
                    {recommendation != null && recommendation > 0 ? (
                      <div className="rounded-xl bg-blue-500/10 p-4 flex flex-col justify-center">
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Recomendado/mes</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">${formatARS(recommendation)}</p>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-muted/50 p-4 flex flex-col justify-center">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Margen</p>
                        <p className="text-lg font-bold font-mono">${formatARS(Math.max(projectionResult.margenRestante, 0))}</p>
                      </div>
                    )}
                    {pago > 0 && (
                      <div className="rounded-xl bg-muted/50 p-4 flex flex-col justify-center">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Cuota mensual</p>
                        <p className="text-lg font-bold font-mono">${formatARS(pago)}</p>
                        <p className="text-[10px] text-muted-foreground">{tipoActividad === "servicios" ? "Servicios" : "Venta de Bienes"}</p>
                      </div>
                    )}
                    {(projectionResult.topeCategoria - totalVentana) > 0 && (
                      <div className="rounded-xl bg-muted/50 p-4 flex flex-col justify-center">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Disponible al tope</p>
                        <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                          {formatMargin(projectionResult.topeCategoria - totalVentana)}
                        </p>
                        {margenSeguridad > 0 && (
                          <p className="text-[10px] text-amber-500 mt-0.5">
                            {formatMargin(margenSeguridad)} reservado como margen
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progreso hacia límite de {projectionResult.categoriaObjetivo}</span>
                    <span>{Math.min((totalVentana / projectionResult.topeCategoria) * 100, 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex h-4 rounded-full bg-muted overflow-hidden">
                    {projectionResult.totalHistorico > 0 && (
                      <div
                        className={cn(
                          "transition-all duration-500",
                          projectionResult.excedeObjetivo ? "bg-destructive" : "bg-blue-500"
                        )}
                        style={{ flexGrow: projectionResult.totalHistorico, flexShrink: 1, flexBasis: 0 }}
                      />
                    )}
                    {projectionResult.totalProyectado > 0 && (
                      <div
                        className={cn(
                          "transition-all duration-500 border-l-2 border-background",
                          projectionResult.excedeObjetivo ? "bg-red-400" : "bg-sky-400",
                          projectionResult.totalHistorico === 0 && "border-l-0"
                        )}
                        style={{ flexGrow: projectionResult.totalProyectado, flexShrink: 1, flexBasis: 0 }}
                      />
                    )}
                    {(projectionResult.topeCategoria - totalVentana) > 0 && (
                      <div style={{ flexGrow: projectionResult.topeCategoria - totalVentana, flexShrink: 1, flexBasis: 0 }} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("inline-block w-2.5 h-2.5 rounded-sm", projectionResult.excedeObjetivo ? "bg-destructive" : "bg-blue-500")} />
                      Histórico ({formatARS(projectionResult.totalHistorico)})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={cn("inline-block w-2.5 h-2.5 rounded-sm", projectionResult.excedeObjetivo ? "bg-red-400" : "bg-sky-400")} />
                      Proyectado ({formatARS(projectionResult.totalProyectado)})
                    </span>
                    {(projectionResult.topeCategoria - totalVentana) > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-muted border border-border" />
                        Disponible ({formatMargin(projectionResult.topeCategoria - totalVentana)})
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    ¿Querés conectar con ARCA y cargar tus datos reales automáticamente?
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Usar GARCA gratis
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <p className="text-sm">
                  {recommendation != null && recommendation > 0
                    ? <>Completá los meses históricos o hacé click en <strong className="text-blue-600 dark:text-blue-400">&quot;Aplicar recomendación&quot;</strong> para proyectar automáticamente.</>
                    : targetCategoria
                      ? "Ingresá tu facturación mensual o usá \"Aplicar recomendación\" para llenar los meses futuros."
                      : "Seleccioná una categoría objetivo o ingresá tu facturación mensual para ver la proyección."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Support Banner */}
      <section className="px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <SupportBanner />
        </div>
      </section>

      {/* Categories Table */}
      <section className="px-4 py-12 bg-gradient-to-b from-transparent via-muted/30 to-transparent">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">
            Tabla de Categorías Monotributo 2026
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Valores actualizados vigentes. Incluye impuesto integrado, aportes jubilatorios (SIPA) y obra social.
          </p>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cat.</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ingresos Brutos</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Servicios</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Venta</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat, i) => (
                  <tr
                    key={cat.categoria}
                    className={cn(
                      "border-t border-border transition-colors",
                      projectionResult?.categoriaResultante === cat.categoria
                        ? "bg-blue-500/10 font-medium"
                        : i % 2 === 0 ? "bg-background" : "bg-muted/20"
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                        projectionResult?.categoriaResultante === cat.categoria
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {cat.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">${formatARS(cat.ingresosBrutos)}</td>
                    <td className="px-4 py-3 text-right font-mono">${formatARS(cat.total.servicios)}</td>
                    <td className="px-4 py-3 text-right font-mono">${formatARS(cat.total.venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Fuente: <a href="https://www.arca.gob.ar/monotributo/categorias.asp" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">ARCA (ex AFIP)</a>.
            Los topes se actualizan en cada período de recategorización (enero y julio).
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <span>{faq.question}</span>
                    <span
                      className="shrink-0 text-slate-400 transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
