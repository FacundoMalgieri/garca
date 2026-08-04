import { describe, expect, it } from "vitest"

import type { AFIPInvoice } from "@/types/afip-scraper"

import { computeHeaderStats } from "./stats"

function invoice(overrides: Partial<AFIPInvoice> = {}): AFIPInvoice {
  return {
    fecha: "03/07/2026",
    tipo: "Factura C",
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
    importeTotal: 1_000_000,
    moneda: "ARS",
    cae: "1",
    ...overrides,
  } as AFIPInvoice
}

describe("computeHeaderStats", () => {
  it("returns null without invoices", () => {
    expect(computeHeaderStats([], {})).toBeNull()
  })

  it("subtracts credit notes from the peso total", () => {
    const stats = computeHeaderStats(
      [
        invoice({ importeTotal: 3_000_000 }),
        invoice({ tipo: "Nota de Crédito C", importeTotal: 1_000_000 }),
      ],
      {}
    )

    expect(stats?.totalPesos).toBe(2_000_000)
    expect(stats?.count).toBe(2)
  })

  it("converts foreign currency with the XML rate and counts by currency", () => {
    const stats = computeHeaderStats(
      [
        invoice({ importeTotal: 1_000_000 }),
        invoice({
          moneda: "USD",
          importeTotal: 10_000,
          xmlData: { exchangeRate: 1500 } as AFIPInvoice["xmlData"],
        }),
      ],
      {}
    )

    expect(stats?.totalPesos).toBe(1_000_000 + 15_000_000)
    expect(stats?.currencies).toEqual({ ARS: 1, USD: 1 })
  })

  it("uses manual rates for foreign invoices without an XML rate", () => {
    const stats = computeHeaderStats([invoice({ moneda: "USD", importeTotal: 100 })], { USD: 1500 })

    expect(stats?.totalPesos).toBe(150_000)
    expect(stats?.unconvertedCount).toBe(0)
  })

  it("excludes foreign invoices with no usable rate instead of counting face value as pesos", () => {
    const stats = computeHeaderStats(
      [invoice({ importeTotal: 1_000_000 }), invoice({ moneda: "USD", importeTotal: 10_000 })],
      {}
    )

    expect(stats?.totalPesos).toBe(1_000_000)
    expect(stats?.unconvertedCount).toBe(1)
  })

  it("computes the date range from the invoice dates", () => {
    const stats = computeHeaderStats(
      [invoice({ fecha: "17/07/2026" }), invoice({ fecha: "08/08/2025" }), invoice({ fecha: "05/12/2025" })],
      {}
    )

    expect(stats?.dateRange.from).toEqual(new Date(2025, 7, 8))
    expect(stats?.dateRange.to).toEqual(new Date(2026, 6, 17))
  })

  it("nets out the $1 factura/NC pairs (credit notes subtracted)", () => {
    // Regresión: el header sumaba las NC en positivo, así que cada par
    // factura+NC de $1 inflaba el total en $2 en vez de cancelarse.
    const stats = computeHeaderStats(
      [
        invoice({ fecha: "18/07/2026", tipo: "Nota de Crédito C", importeTotal: 1 }),
        invoice({ fecha: "18/07/2026", importeTotal: 1 }),
        invoice({ fecha: "17/07/2026", tipo: "Nota de Crédito C", importeTotal: 1 }),
        invoice({ fecha: "17/07/2026", importeTotal: 1 }),
        invoice({ fecha: "17/07/2026", tipo: "Nota de Crédito C", importeTotal: 1 }),
        invoice({ fecha: "17/07/2026", importeTotal: 1 }),
        invoice({ fecha: "17/07/2026", importeTotal: 3_000_000 }),
      ],
      {}
    )

    expect(stats?.totalPesos).toBe(3_000_000)
  })
})
