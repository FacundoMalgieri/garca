import { describe, expect, it } from "vitest"

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias"
import type { VentanaRecategorizacion } from "@/types/monotributo"

import { getRecategorizacionOutlook } from "./outlook"

const CATEGORIAS = MONOTRIBUTO_DATA.categorias
const cat = (letra: string) => {
  const encontrada = CATEGORIAS.find((c) => c.categoria === letra)
  if (!encontrada) throw new Error(`Categoría ${letra} no existe en MONOTRIBUTO_DATA`)
  return encontrada
}

function ventana(overrides: Partial<VentanaRecategorizacion> = {}): VentanaRecategorizacion {
  return {
    label: "Enero 2027",
    desde: "2026-01",
    hasta: "2026-12",
    ingresos: 0,
    mesesCerrados: 7,
    totalMeses: 12,
    completa: false,
    ingresosAnualizados: null,
    tieneDatos: true,
    // El outlook no mira la cobertura (eso lo decide resolveCategoriaVigente),
    // así que el default es la ventana bien consultada.
    cobertura: { estado: "completa", mesesCubiertos: 7, mesesCerrados: 7, faltantes: [] },
    ...overrides,
  }
}

describe("getRecategorizacionOutlook", () => {
  it("does not suggest a downgrade from a partial window (regression: H shown as D)", () => {
    // Categoría vigente H, ventana Ene-Dic 2026 con 7 de 12 meses facturados
    // ($14M). El acumulado parcial cae en B, pero anualizado ($24M) cae en C.
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: cat("H"),
      ventana: ventana({ ingresos: 14_000_000, mesesCerrados: 7, ingresosAnualizados: 24_000_000 }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("baja-posible")
    expect(outlook.categoriaEstimada?.categoria).toBe("C")
    expect(outlook.categoriaEstimada?.categoria).not.toBe("B")
    expect(outlook.excedente).toBe(0)
  })

  it("confirms a downgrade only once the window is complete", () => {
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: cat("H"),
      ventana: ventana({
        ingresos: 46_000_000,
        mesesCerrados: 12,
        completa: true,
        ingresosAnualizados: 46_000_000,
      }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("baja-confirmada")
    expect(outlook.categoriaEstimada?.categoria).toBe("G")
  })

  it("confirms an upgrade when the partial window already exceeds the current cap", () => {
    const capH = cat("H").ingresosBrutos
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: cat("H"),
      ventana: ventana({ ingresos: capH + 5_000_000, mesesCerrados: 7, ingresosAnualizados: 999_999_999 }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("suba-confirmada")
    expect(outlook.excedente).toBeCloseTo(5_000_000, 2)
    expect(outlook.categoriaEstimada?.categoria).toBe("I")
  })

  it("projects an upgrade when only the annualized total exceeds the current cap", () => {
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: cat("D"),
      ventana: ventana({ ingresos: 25_000_000, mesesCerrados: 6, ingresosAnualizados: 50_000_000 }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("suba-proyectada")
    expect(outlook.categoriaEstimada?.categoria).toBe("G")
    expect(outlook.excedente).toBe(0)
  })

  it("reports stable when the projection lands in the same category", () => {
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: cat("D"),
      ventana: ventana({ ingresos: 15_000_000, mesesCerrados: 6, ingresosAnualizados: 30_000_000 }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("estable")
    expect(outlook.categoriaEstimada?.categoria).toBe("D")
  })

  it("has no estimate while the window has no closed months", () => {
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: cat("H"),
      ventana: ventana({ ingresos: 0, mesesCerrados: 0, ingresosAnualizados: null }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("sin-datos")
    expect(outlook.categoriaEstimada).toBeNull()
  })

  it("has no estimate without a current category", () => {
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: null,
      ventana: ventana({ ingresos: 14_000_000, ingresosAnualizados: 24_000_000 }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("sin-datos")
  })

  it("flags exclusion when the confirmed total is above the top category", () => {
    const tope = Math.max(...CATEGORIAS.map((c) => c.ingresosBrutos))
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: cat("K"),
      ventana: ventana({ ingresos: tope + 1_000_000, mesesCerrados: 8, ingresosAnualizados: tope + 2_000_000 }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("suba-confirmada")
    expect(outlook.excluido).toBe(true)
  })

  it("falls back to the raw total when a complete window has no annualized value", () => {
    const outlook = getRecategorizacionOutlook({
      categoriaVigente: cat("H"),
      ventana: ventana({ ingresos: 20_000_000, mesesCerrados: 12, completa: true, ingresosAnualizados: null }),
      categorias: CATEGORIAS,
    })

    expect(outlook.kind).toBe("baja-confirmada")
    expect(outlook.categoriaEstimada?.categoria).toBe("C")
  })
})
