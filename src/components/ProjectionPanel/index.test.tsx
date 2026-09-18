import { beforeEach, describe, expect, it, vi } from "vitest"

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias"
import type { MonthKey, ProjectionData, ProjectionResult } from "@/types/projection"

import { ProjectionPanel } from "./index"

import { fireEvent, render, screen } from "@testing-library/react"

vi.mock("@/lib/analytics/umami", () => ({
  trackUmamiEvent: vi.fn(),
  UMAMI_EVENTS: { PanelExport: "funnel_panel_export" },
}))

vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({ state: { company: null, invoices: [] }, manualExchangeRates: {} }),
}))

/** Mutables por test. El hook real lee localStorage y arma la ventana sola. */
const mocks: {
  monthlyTotals: { month: MonthKey; totalArs: number; invoiceCount: number }[]
  futureMonths: MonthKey[]
  monthlyProjections: Record<MonthKey, number>
  /** Fuerza estados del resultado (excluido, sube de categoría, ventana cerrada). */
  resultOverrides: Partial<ProjectionResult>
  ventana: MonthKey[]
} = { monthlyTotals: [], futureMonths: [], monthlyProjections: {}, resultOverrides: {}, ventana: ["2026-07", "2026-08", "2026-09"] }

/** Spy compartido: el factory del mock corre en CADA render del hook. */
const setMonthProjection = vi.hoisted(() => vi.fn())

const CAT_G = MONOTRIBUTO_DATA.categorias.find((c) => c.categoria === "G")
if (!CAT_G) throw new Error("Categoría G no existe en MONOTRIBUTO_DATA")

vi.mock("@/hooks/useProjection", () => ({
  useProjection: () => {
    const projectionData: ProjectionData = {
      targetRecategorizacion: "2027-01",
      targetCategoria: "G",
      margenSeguridad: 0,
      monthlyProjections: mocks.monthlyProjections,
      updatedAt: "2026-08-11T00:00:00.000Z",
    }
    const projectionResult: ProjectionResult = {
      ventana: mocks.ventana,
      totalVentana: 16_000_000,
      totalHistorico: 16_000_000,
      totalProyectado: 0,
      categoriaResultante: "G",
      categoriaObjetivo: "G",
      topeCategoria: CAT_G.ingresosBrutos,
      margenRestante: CAT_G.ingresosBrutos - 16_000_000,
      excedeObjetivo: false,
      excluido: false,
      mesesFuturos: mocks.futureMonths.length,
      montoRecomendadoMensual: 1_000_000,
      ...mocks.resultOverrides,
    }
    return {
      projectionData,
      projectionResult,
      monthlyTotals: mocks.monthlyTotals,
      futureMonths: mocks.futureMonths,
      recategorizacionOptions: [{ month: "2027-01", label: "Enero 2027", ventana: [] }],
      setTargetRecategorizacion: vi.fn(),
      setTargetCategoria: vi.fn(),
      setMargenSeguridad: vi.fn(),
      setMonthProjection,
      setAllProjections: vi.fn(),
      applyRecommendation: vi.fn(),
      clearProjections: vi.fn(),
      categorias: MONOTRIBUTO_DATA.categorias,
    }
  },
}))

describe("ProjectionPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.monthlyProjections = {}
    mocks.resultOverrides = {}
    mocks.ventana = ["2026-07", "2026-08", "2026-09"]
  })

  it("muestra lo ya facturado en el mes en curso, que es el piso de la proyección", () => {
    // El mes en curso está en "A proyectar" con un input en 0, así que la
    // facturación real de ese mes no aparecía en ninguna de las dos listas.
    mocks.futureMonths = ["2026-08", "2026-09"]
    mocks.monthlyTotals = [
      { month: "2026-07", totalArs: 10_000_000, invoiceCount: 5 },
      { month: "2026-08", totalArs: 6_000_000, invoiceCount: 4 },
    ]

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByTestId("ya-facturado-2026-08")).toHaveTextContent("6.000.000")
  })

  it("el mes en curso dice cuánto FALTA, no sólo lo ya facturado", () => {
    // El input muestra el total del mes, así que "$20.000.000" se leía como
    // "facturá 22 palos". El número que el usuario busca es el delta.
    mocks.futureMonths = ["2026-08"]
    mocks.monthlyTotals = [{ month: "2026-08", totalArs: 12_000_000, invoiceCount: 9 }]
    mocks.monthlyProjections = { "2026-08": 20_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)

    const hint = screen.getByTestId("ya-facturado-2026-08")
    expect(hint).toHaveTextContent("12.000.000")
    expect(hint).toHaveTextContent("8.000.000")
  })

  it("al salir del input, el mes en curso no puede quedar abajo de lo facturado", () => {
    // Es el caso que confundía: con la categoría objetivo baja, la recomendación
    // ponía $265.646 en un mes con $7.500.000 ya emitidos. El campo mostraba un
    // número que no iba a pasar. El total de un mes no puede bajar de lo emitido.
    mocks.futureMonths = ["2026-08", "2026-09"]
    mocks.monthlyTotals = [{ month: "2026-08", totalArs: 7_500_000, invoiceCount: 4 }]
    mocks.monthlyProjections = { "2026-08": 265_646 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    fireEvent.blur(screen.getByRole("textbox", { name: /Ago/ }))

    expect(setMonthProjection).toHaveBeenCalledWith("2026-08", 7_500_000)
  })

  it("no toca el input cuando la proyección ya supera lo facturado", () => {
    mocks.futureMonths = ["2026-08"]
    mocks.monthlyTotals = [{ month: "2026-08", totalArs: 7_500_000, invoiceCount: 4 }]
    mocks.monthlyProjections = { "2026-08": 9_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    fireEvent.blur(screen.getByRole("textbox", { name: /Ago/ }))

    expect(setMonthProjection).not.toHaveBeenCalled()
  })

  it("no muestra piso en los meses futuros, que no tienen nada facturado", () => {
    mocks.futureMonths = ["2026-08", "2026-09"]
    mocks.monthlyTotals = [{ month: "2026-08", totalArs: 6_000_000, invoiceCount: 4 }]

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.queryByTestId("ya-facturado-2026-09")).not.toBeInTheDocument()
  })
})

describe("ProjectionPanel · la respuesta primero", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.monthlyProjections = {}
    mocks.monthlyTotals = []
    mocks.resultOverrides = {}
    mocks.ventana = ["2026-07", "2026-08", "2026-09"]
    mocks.futureMonths = ["2026-08", "2026-09"]
  })

  it("muestra el monto recomendado en reposo, sin desplegar nada", () => {
    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByTestId("monto-recomendado")).toHaveTextContent("1.000.000")
  })

  it("arranca con el desglose mes a mes plegado", () => {
    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByTestId("ajuste-mensual")).not.toHaveAttribute("open")
  })

  it("despliega el desglose al abrirlo", () => {
    render(<ProjectionPanel tipoActividad="servicios" />)
    const detalle = screen.getByTestId("ajuste-mensual")

    fireEvent.click(screen.getByText("Ajustar mes por mes"))

    expect(detalle).toHaveAttribute("open")
  })

  it("avisa en la frase principal cuando caés arriba del objetivo", () => {
    // Hoy esto era una línea suelta en el resumen: es el caso en que el usuario
    // más necesita enterarse.
    mocks.resultOverrides = { categoriaResultante: "H", categoriaObjetivo: "G" }

    render(<ProjectionPanel tipoActividad="servicios" />)

    const frase = screen.getByTestId("frase-consecuencia")
    expect(frase).toHaveTextContent("categoría H")
    expect(frase).toHaveTextContent("arriba de tu objetivo G")
  })

  it("reemplaza la respuesta por la alerta cuando quedás excluido", () => {
    mocks.resultOverrides = { excluido: true }

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByText(/Superás el tope del Monotributo/)).toBeInTheDocument()
    expect(screen.queryByTestId("monto-recomendado")).not.toBeInTheDocument()
  })

  it("reemplaza la respuesta cuando ya excediste el objetivo y no hay nada que repartir", () => {
    mocks.resultOverrides = { excedeObjetivo: true, totalProyectado: 0 }

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByText(/Ya excediste tu objetivo/)).toBeInTheDocument()
    expect(screen.queryByTestId("monto-recomendado")).not.toBeInTheDocument()
  })

  it("no recomienda nada si la ventana ya está cerrada", () => {
    mocks.futureMonths = []

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByText(/La ventana ya está cerrada/)).toBeInTheDocument()
    expect(screen.queryByTestId("monto-recomendado")).not.toBeInTheDocument()
  })

  it("el mini-gráfico da el monto de cada mes cerrado como texto, no sólo como barra", () => {
    // La identidad del dato no puede depender de ver bien: el número va escrito.
    mocks.futureMonths = ["2026-09"]
    mocks.monthlyTotals = [
      { month: "2026-07", totalArs: 3_500_000, invoiceCount: 3 },
      { month: "2026-08", totalArs: 7_500_000, invoiceCount: 6 },
    ]

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByTestId("cerrado-2026-07")).toHaveTextContent("$3,5M")
    expect(screen.getByTestId("cerrado-2026-08")).toHaveTextContent("$7,5M")
  })

  it("escala las barras contra el mes más alto de la ventana", () => {
    mocks.futureMonths = ["2026-09"]
    mocks.monthlyTotals = [
      { month: "2026-07", totalArs: 3_750_000, invoiceCount: 3 },
      { month: "2026-08", totalArs: 7_500_000, invoiceCount: 6 },
    ]

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByTestId("barra-2026-08")).toHaveStyle({ height: "100%" })
    expect(screen.getByTestId("barra-2026-07")).toHaveStyle({ height: "50%" })
  })
})
