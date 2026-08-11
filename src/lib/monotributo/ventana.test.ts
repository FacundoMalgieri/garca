import { describe, expect, it } from "vitest"

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias"
import { getLastRecategorizacionDate, getNextRecategorizacionDates } from "@/lib/projection"
import type { AFIPInvoice } from "@/types/afip-scraper"

import { buildVentanaRecategorizacion, resolveCategoriaVigente } from "./ventana"

const CATEGORIAS = MONOTRIBUTO_DATA.categorias

function inv(fecha: string, tipo: string, importeTotal: number, moneda = "ARS", exchangeRate?: number): AFIPInvoice {
  return {
    fecha,
    tipo,
    tipoComprobante: 11,
    puntoVenta: 3,
    numero: 1,
    numeroCompleto: "0003-00000001",
    cuitEmisor: "CUIT",
    razonSocialEmisor: "",
    cuitReceptor: "",
    razonSocialReceptor: "",
    importeNeto: 0,
    importeIVA: 0,
    importeTotal,
    moneda,
    cae: "1",
    ...(exchangeRate ? { xmlData: { exchangeRate } } : {}),
  } as AFIPInvoice
}

/**
 * Facturación sintética con la forma que disparó el bug: la ventana en curso
 * (Ene-Dic 2026) tiene sólo 7 de 12 meses facturados, así que su acumulado cae en
 * una categoría más baja que la que define la ventana ya cerrada.
 *
 * Números redondos a propósito:
 *   ventana en curso  Ene-Jul 2026 → $14.000.000 (anualizado $24.000.000 → C)
 *   ventana cerrada   Jul 2025-Jun 2026 → $52.000.000 → G
 *   el acumulado parcial solo, leído como total → B
 */
const MENSUAL = 2_000_000;
const USD_IMPORTE = 10_000;
const USD_COTIZACION = 1_500;

const INVOICES: AFIPInvoice[] = [
  // Par factura + nota de crédito de $1: cubre la resta de las NC
  inv("18/07/2026", "Nota de Crédito C", 1),
  inv("18/07/2026", "Factura C", 1),
  inv("10/07/2026", "Factura C", MENSUAL),
  inv("10/06/2026", "Factura C", MENSUAL),
  inv("10/05/2026", "Factura C", MENSUAL),
  inv("10/04/2026", "Factura C", MENSUAL),
  inv("10/03/2026", "Factura C", MENSUAL),
  inv("10/02/2026", "Factura C", MENSUAL),
  inv("10/01/2026", "Factura C", MENSUAL),
  inv("10/12/2025", "Factura C", MENSUAL),
  inv("10/11/2025", "Factura C", MENSUAL),
  inv("10/11/2025", "Factura de Exportación E", USD_IMPORTE, "USD", USD_COTIZACION),
  inv("10/10/2025", "Factura C", MENSUAL),
  inv("10/09/2025", "Factura C", MENSUAL),
  inv("10/08/2025", "Factura de Exportación E", USD_IMPORTE, "USD", USD_COTIZACION),
  inv("10/08/2025", "Factura C", MENSUAL),
];

const TODAY = new Date(2026, 7, 4) // 04/08/2026

/** Rango que cubre la ventana vigente (Jul 2025 - Jun 2026) entera. */
const RANGO_COMPLETO = { from: "2025-07-01", to: "2026-07-31" }
/**
 * Rango de 12 meses que NO cubre la ventana vigente: le falta Julio 2025.
 * Es la forma del bug real — el default de la app es "hoy menos 12 meses", que
 * siempre deja afuera el primer mes de la ventana ya cerrada.
 */
const RANGO_SIN_JULIO = { from: "2025-08-01", to: "2026-07-31" }

describe("buildVentanaRecategorizacion", () => {
  it("marks the in-progress window as partial (Ene-Dic 2026 with 7 of 12 months)", () => {
    const proxima = getNextRecategorizacionDates(TODAY)[0]

    const ventana = buildVentanaRecategorizacion(proxima, INVOICES, {}, RANGO_COMPLETO, TODAY)

    expect(ventana.label).toBe("Enero 2027")
    expect(ventana.desde).toBe("2026-01")
    expect(ventana.hasta).toBe("2026-12")
    expect(ventana.ingresos).toBe(14_000_000)
    expect(ventana.mesesCerrados).toBe(7)
    expect(ventana.completa).toBe(false)
    expect(ventana.ingresosAnualizados).toBe(24_000_000)
    expect(ventana.tieneDatos).toBe(true)
  })

  it("marks the last closed window as complete (Jul 2025 - Jun 2026)", () => {
    const vigente = getLastRecategorizacionDate(TODAY)

    const ventana = buildVentanaRecategorizacion(vigente, INVOICES, {}, RANGO_COMPLETO, TODAY)

    expect(ventana.desde).toBe("2025-07")
    expect(ventana.hasta).toBe("2026-06")
    expect(ventana.ingresos).toBe(52_000_000) // incluye las 2 facturas E convertidas
    expect(ventana.completa).toBe(true)
    expect(ventana.ingresosAnualizados).toBe(52_000_000)
  })

  it("reports no data when the window has no invoices", () => {
    const ventana = buildVentanaRecategorizacion(
      getNextRecategorizacionDates(new Date(2030, 7, 4))[0],
      INVOICES,
      {},
      RANGO_COMPLETO,
      new Date(2030, 7, 4)
    )

    expect(ventana.tieneDatos).toBe(false)
    expect(ventana.ingresos).toBe(0)
  })

  it("expone la cobertura de la ventana según el rango consultado", () => {
    const vigente = getLastRecategorizacionDate(TODAY)

    const ventana = buildVentanaRecategorizacion(vigente, INVOICES, {}, RANGO_SIN_JULIO, TODAY)

    expect(ventana.cobertura.estado).toBe("parcial")
    expect(ventana.cobertura.faltantes).toEqual(["2025-07"])
  })

  it("marca cobertura completa cuando el rango cubre la ventana entera", () => {
    const vigente = getLastRecategorizacionDate(TODAY)

    const ventana = buildVentanaRecategorizacion(vigente, INVOICES, {}, RANGO_COMPLETO, TODAY)

    expect(ventana.cobertura.estado).toBe("completa")
  })

  it("marca cobertura desconocida cuando no se sabe qué rango se consultó", () => {
    const vigente = getLastRecategorizacionDate(TODAY)

    const ventana = buildVentanaRecategorizacion(vigente, INVOICES, {}, null, TODAY)

    expect(ventana.cobertura.estado).toBe("desconocida")
  })
})

describe("resolveCategoriaVigente", () => {
  const ventanaCerrada = buildVentanaRecategorizacion(
    getLastRecategorizacionDate(TODAY),
    INVOICES,
    {},
    RANGO_COMPLETO,
    TODAY
  )
  /** La misma ventana, pero consultada con el rango que se come Julio 2025. */
  const ventanaSinCubrir = buildVentanaRecategorizacion(
    getLastRecategorizacionDate(TODAY),
    INVOICES,
    {},
    RANGO_SIN_JULIO,
    TODAY
  )

  it("prefers the category reported by ARCA", () => {
    const categoria = resolveCategoriaVigente({
      categoriaARCA: "H",
      ventanaCerrada,
      categorias: CATEGORIAS,
    })

    expect(categoria?.categoria).toBe("H")
  })

  it("derives the category from the last CLOSED window when ARCA is unavailable", () => {
    const categoria = resolveCategoriaVigente({
      categoriaARCA: null,
      ventanaCerrada,
      categorias: CATEGORIAS,
    })

    // $52.000.000 → G. Nunca B, que es lo que daría el acumulado parcial.
    expect(categoria?.categoria).toBe("G")
  })

  it("falls back to the closed window when the ARCA letter is unknown", () => {
    const categoria = resolveCategoriaVigente({
      categoriaARCA: "Z",
      ventanaCerrada,
      categorias: CATEGORIAS,
    })

    expect(categoria?.categoria).toBe("G")
  })

  it("returns null when there is no ARCA category and no data in the closed window", () => {
    const vacia = buildVentanaRecategorizacion(
      getLastRecategorizacionDate(new Date(2030, 7, 4)),
      INVOICES,
      {},
      RANGO_COMPLETO,
      new Date(2030, 7, 4)
    )

    expect(resolveCategoriaVigente({ ventanaCerrada: vacia, categorias: CATEGORIAS })).toBeNull()
  })

  it("NO deriva la categoría si la consulta no cubrió la ventana entera", () => {
    // El bug: con Julio 2025 sin consultar, la ventana suma menos y la derivada
    // cae una categoría abajo. Vale más no decir nada que decir la letra mal.
    const categoria = resolveCategoriaVigente({
      categoriaARCA: null,
      ventanaCerrada: ventanaSinCubrir,
      categorias: CATEGORIAS,
    })

    expect(categoria).toBeNull()
  })

  it("NO deriva la categoría si no se sabe qué rango se consultó", () => {
    const sinRango = buildVentanaRecategorizacion(
      getLastRecategorizacionDate(TODAY),
      INVOICES,
      {},
      null,
      TODAY
    )

    expect(resolveCategoriaVigente({ ventanaCerrada: sinRango, categorias: CATEGORIAS })).toBeNull()
  })

  it("la categoría de ARCA gana aunque la cobertura sea parcial", () => {
    // ARCA es la verdad legal: no depende de qué período consultamos nosotros.
    const categoria = resolveCategoriaVigente({
      categoriaARCA: "H",
      ventanaCerrada: ventanaSinCubrir,
      categorias: CATEGORIAS,
    })

    expect(categoria?.categoria).toBe("H")
  })
})
