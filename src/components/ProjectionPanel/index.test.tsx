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
  lockedMonths: MonthKey[]
} = { monthlyTotals: [], futureMonths: [], monthlyProjections: {}, resultOverrides: {}, ventana: ["2026-07", "2026-08", "2026-09"], lockedMonths: [] }

/** Spy compartido: el factory del mock corre en CADA render del hook. */
const setMonthProjection = vi.hoisted(() => vi.fn())
const toggleMonthLock = vi.hoisted(() => vi.fn())
const redistribute = vi.hoisted(() => vi.fn())

const CAT_G = MONOTRIBUTO_DATA.categorias.find((c) => c.categoria === "G")
if (!CAT_G) throw new Error("Categoría G no existe en MONOTRIBUTO_DATA")

vi.mock("@/hooks/useProjection", () => ({
  useProjection: () => {
    const projectionData: ProjectionData = {
      targetRecategorizacion: "2027-01",
      targetCategoria: "G",
      margenSeguridad: 0,
      monthlyProjections: mocks.monthlyProjections,
      lockedMonths: mocks.lockedMonths,
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
      toggleMonthLock,
      redistribute,
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
    mocks.lockedMonths = []
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

  it("no describe el delta del mes como margen disponible", () => {
    // "te quedan $X" se leía como aire contra el tope —que es como habla el
    // resto del panel: "te sobran", "libres hasta H"— cuando en realidad es
    // facturación nueva de ESE mes. Con el total en rojo, la contradicción era
    // total.
    mocks.futureMonths = ["2026-08"]
    mocks.monthlyTotals = [{ month: "2026-08", totalArs: 12_000_000, invoiceCount: 9 }]
    mocks.monthlyProjections = { "2026-08": 22_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)

    const hint = screen.getByTestId("ya-facturado-2026-08")
    expect(hint).toHaveTextContent("10.000.000")
    expect(hint).not.toHaveTextContent(/te quedan/i)
    expect(hint).toHaveTextContent(/proyect/i)
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
    mocks.lockedMonths = []
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

describe("ProjectionPanel · dónde termina la ventana", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.monthlyProjections = {}
    mocks.monthlyTotals = []
    mocks.resultOverrides = {}
    mocks.lockedMonths = []
    mocks.ventana = ["2026-07", "2026-08", "2026-09"]
    mocks.futureMonths = ["2026-08", "2026-09"]
  })

  it("muestra el total de la ventana contra el tope, sin desplegar nada", () => {
    // Al sacar el bloque "Resumen de proyección" se había perdido el número que
    // contesta "¿en cuánto termino?".
    mocks.resultOverrides = { totalVentana: 16_000_000, topeCategoria: 53_995_798 }

    render(<ProjectionPanel tipoActividad="servicios" />)

    const total = screen.getByTestId("total-ventana")
    expect(total).toHaveTextContent("16.000.000")
    expect(total).toHaveTextContent("53.995.798")
  })

  it("el total refleja lo que se proyecta, no sólo lo facturado", () => {
    // El label de la derecha calculaba sobre el histórico, así que decía
    // "libres" mientras la barra ya mostraba ese espacio ocupado.
    mocks.resultOverrides = {
      totalVentana: 40_000_000,
      totalHistorico: 16_000_000,
      totalProyectado: 24_000_000,
      topeCategoria: 53_995_798,
    }

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByTestId("total-ventana")).toHaveTextContent("40.000.000")
  })

  it("el desglose cierra con el total y cuánto sobra para el tope", () => {
    mocks.resultOverrides = { totalVentana: 16_000_000, topeCategoria: 53_995_798 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    fireEvent.click(screen.getByText("Ajustar mes por mes"))

    const cierre = screen.getByTestId("total-desglose")
    expect(cierre).toHaveTextContent("16.000.000")
    expect(cierre).toHaveTextContent("37.995.798")
    expect(cierre).toHaveTextContent(/te sobran/i)
  })

  it("avisa cuando el total se pasa del tope", () => {
    mocks.resultOverrides = { totalVentana: 60_000_000, topeCategoria: 53_995_798 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    fireEvent.click(screen.getByText("Ajustar mes por mes"))

    const cierre = screen.getByTestId("total-desglose")
    expect(cierre).toHaveTextContent(/te pasás/i)
    expect(cierre).toHaveTextContent("6.004.202")
  })
})

describe("ProjectionPanel · la frase no puede mentir sobre el plan", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.monthlyTotals = []
    mocks.resultOverrides = {}
    mocks.lockedMonths = []
    mocks.ventana = ["2026-07", "2026-08", "2026-09"]
    mocks.futureMonths = ["2026-08", "2026-09"]
    mocks.monthlyProjections = {}
  })

  it("dice 'a ese ritmo' sólo cuando el plan ES el recomendado", () => {
    mocks.monthlyProjections = { "2026-08": 1_000_000, "2026-09": 1_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByTestId("frase-consecuencia")).toHaveTextContent(/a ese ritmo/i)
  })

  it("deja de decir 'a ese ritmo' cuando editaste los meses", () => {
    // El titular sigue mostrando el recomendado, así que "a ese ritmo" apuntaría
    // a un número que ya no es el que produce el resultado de la frase.
    mocks.monthlyProjections = { "2026-08": 9_000_000, "2026-09": 1_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)

    const frase = screen.getByTestId("frase-consecuencia")
    expect(frase).not.toHaveTextContent(/a ese ritmo/i)
    expect(frase).toHaveTextContent(/lo que cargaste/i)
  })

  it("respeta el piso del mes en curso al comparar contra el recomendado", () => {
    // El plan recomendado para el mes en curso es piso + recomendado, no el
    // recomendado pelado: sin esto, un mes con facturación real siempre parecía
    // editado a mano.
    mocks.monthlyTotals = [{ month: "2026-08", totalArs: 4_000_000, invoiceCount: 3 }]
    mocks.monthlyProjections = { "2026-08": 5_000_000, "2026-09": 1_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.getByTestId("frase-consecuencia")).toHaveTextContent(/a ese ritmo/i)
  })
})

describe("ProjectionPanel · candados y redistribución", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.monthlyTotals = []
    mocks.resultOverrides = {}
    mocks.lockedMonths = []
    mocks.ventana = ["2026-07", "2026-08", "2026-09"]
    mocks.futureMonths = ["2026-08", "2026-09"]
    mocks.monthlyProjections = {}
  })

  const abrirDesglose = () => fireEvent.click(screen.getByText("Ajustar mes por mes"))

  it("no dice 'te quedan $0' cuando el mes en curso no proyecta nada nuevo", () => {
    // Poner en el mes en curso exactamente lo ya facturado es decir "no facturo
    // más". La frase quedaba sin sentido.
    mocks.monthlyTotals = [{ month: "2026-08", totalArs: 12_000_000, invoiceCount: 9 }]
    mocks.monthlyProjections = { "2026-08": 12_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    const hint = screen.getByTestId("ya-facturado-2026-08")
    expect(hint).toHaveTextContent("12.000.000")
    expect(hint).not.toHaveTextContent("$0")
    expect(hint).toHaveTextContent(/no proyect/i)
  })

  it("cada mes tiene candado y avisa su estado", () => {
    mocks.lockedMonths = ["2026-08"]

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.getByTestId("candado-2026-08")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByTestId("candado-2026-09")).toHaveAttribute("aria-pressed", "false")
  })

  it("el candado se prende y se apaga", () => {
    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    fireEvent.click(screen.getByTestId("candado-2026-09"))

    expect(toggleMonthLock).toHaveBeenCalledWith("2026-09")
  })

  it("ofrece redistribuir cuando queda plata sin asignar", () => {
    mocks.resultOverrides = { margenRestante: 8_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.getByTestId("sin-asignar")).toHaveTextContent("8.000.000")

    fireEvent.click(screen.getByRole("button", { name: /redistribuir/i }))
    expect(redistribute).toHaveBeenCalled()
  })

  it("no ofrece redistribuir cuando no sobra nada", () => {
    mocks.resultOverrides = { margenRestante: 0 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.queryByTestId("sin-asignar")).not.toBeInTheDocument()
  })

  it("no ofrece redistribuir si están todos los meses con candado", () => {
    // No habría dónde poner la plata.
    mocks.resultOverrides = { margenRestante: 8_000_000 }
    mocks.lockedMonths = ["2026-08", "2026-09"]

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.queryByTestId("sin-asignar")).not.toBeInTheDocument()
  })
})

describe("ProjectionPanel · volver adentro de la categoría", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.monthlyTotals = []
    mocks.resultOverrides = {}
    mocks.lockedMonths = []
    mocks.ventana = ["2026-07", "2026-08", "2026-09"]
    mocks.futureMonths = ["2026-08", "2026-09"]
    mocks.monthlyProjections = {}
  })

  const abrirDesglose = () => fireEvent.click(screen.getByText("Ajustar mes por mes"))

  it("ofrece recortar cuando te pasaste del tope", () => {
    // Es el mismo reparto: con el disponible por debajo de lo cargado, los meses
    // abiertos bajan en vez de subir.
    mocks.resultOverrides = { margenRestante: -10_000_000, categoriaObjetivo: "H" }

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    const aviso = screen.getByTestId("te-pasas")
    expect(aviso).toHaveTextContent("10.000.000")

    fireEvent.click(screen.getByRole("button", { name: /recortar/i }))
    expect(redistribute).toHaveBeenCalled()
  })

  it("no ofrece recortar si no hay meses abiertos donde recortar", () => {
    mocks.resultOverrides = { margenRestante: -10_000_000 }
    mocks.lockedMonths = ["2026-08", "2026-09"]

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.queryByRole("button", { name: /recortar/i })).not.toBeInTheDocument()
    // Pero sí explica por qué no puede hacer nada, en vez de no mostrar nada.
    expect(screen.getByTestId("te-pasas")).toHaveTextContent(/fijos/i)
  })

  it("no mezcla los dos avisos", () => {
    mocks.resultOverrides = { margenRestante: 8_000_000 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.getByTestId("sin-asignar")).toBeInTheDocument()
    expect(screen.queryByTestId("te-pasas")).not.toBeInTheDocument()
  })

  it("el candado se lee como palabra, no sólo como emoji", () => {
    // 🔓 y 🔒 se distinguen sólo por el arco a 14px: el estado no puede depender
    // de eso.
    mocks.lockedMonths = ["2026-08"]

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.getByTestId("candado-2026-08")).toHaveTextContent(/fijo/i)
    expect(screen.getByTestId("candado-2026-09")).toHaveTextContent(/abierto/i)
  })
})

describe("ProjectionPanel · ruido y referencias", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.monthlyTotals = []
    mocks.resultOverrides = {}
    mocks.lockedMonths = []
    mocks.ventana = ["2026-07", "2026-08", "2026-09"]
    mocks.futureMonths = ["2026-08", "2026-09"]
    mocks.monthlyProjections = {}
  })

  const abrirDesglose = () => fireEvent.click(screen.getByText("Ajustar mes por mes"))

  it("no ofrece repartir migajas de redondeo", () => {
    // Repartir $2 entre cuatro meses no es una acción: es ruido.
    mocks.resultOverrides = { margenRestante: 2 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.queryByTestId("sin-asignar")).not.toBeInTheDocument()
  })

  it("no alarma por migajas de redondeo cuando te pasás", () => {
    mocks.resultOverrides = { margenRestante: -2 }

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    expect(screen.queryByTestId("te-pasas")).not.toBeInTheDocument()
  })

  it("el aviso de exceso no dice 'tope', que es otra referencia", () => {
    // El aviso mide contra tope − margen y el total contra el tope pelado: si
    // los dos dicen "tope", muestran dos números distintos para lo mismo.
    mocks.resultOverrides = { margenRestante: -24_249_896, categoriaObjetivo: "H" }

    render(<ProjectionPanel tipoActividad="servicios" />)
    abrirDesglose()

    const aviso = screen.getByTestId("te-pasas")
    expect(aviso).toHaveTextContent("24.249.896")
    expect(aviso).not.toHaveTextContent(/tope/i)
    expect(aviso).toHaveTextContent(/recortar/i)
  })
})

describe("ProjectionPanel · ayuda", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.monthlyTotals = []
    mocks.resultOverrides = {}
    mocks.lockedMonths = []
    mocks.ventana = ["2026-07", "2026-08", "2026-09"]
    mocks.futureMonths = ["2026-08", "2026-09"]
    mocks.monthlyProjections = {}
  })

  it("el modal de ayuda no está abierto de entrada", () => {
    render(<ProjectionPanel tipoActividad="servicios" />)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("abre la ayuda desde el header", () => {
    render(<ProjectionPanel tipoActividad="servicios" />)

    fireEvent.click(screen.getByRole("button", { name: /cómo usar proyectar/i }))

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Cómo usar Proyectar")
  })
})
