import { describe, expect, it } from "vitest"

import type { AFIPInvoice } from "@/types/afip-scraper"

import { getInvoiceMultiplier, invoiceAmountInPesos } from "./invoice-amount"

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

describe("getInvoiceMultiplier", () => {
  it("subtracts credit notes (with and without accent)", () => {
    expect(getInvoiceMultiplier("Nota de Crédito C")).toBe(-1)
    expect(getInvoiceMultiplier("NOTA DE CREDITO E")).toBe(-1)
  })

  it("adds everything else", () => {
    expect(getInvoiceMultiplier("Factura C")).toBe(1)
    expect(getInvoiceMultiplier("Factura de Exportación E")).toBe(1)
    expect(getInvoiceMultiplier("Nota de Débito C")).toBe(1)
  })
})

describe("invoiceAmountInPesos", () => {
  it("returns the ARS amount as-is", () => {
    expect(invoiceAmountInPesos(invoice(), {})).toEqual({ amount: 1_000_000, converted: true })
  })

  it("subtracts an ARS credit note", () => {
    const result = invoiceAmountInPesos(invoice({ tipo: "Nota de Crédito C", importeTotal: 1 }), {})

    expect(result).toEqual({ amount: -1, converted: true })
  })

  it("converts foreign currency with the XML exchange rate", () => {
    const result = invoiceAmountInPesos(
      invoice({ moneda: "USD", importeTotal: 10_000, xmlData: { exchangeRate: 1500 } as AFIPInvoice["xmlData"] }),
      {}
    )

    expect(result).toEqual({ amount: 15_000_000, converted: true })
  })

  it("falls back to the manual exchange rate", () => {
    const result = invoiceAmountInPesos(invoice({ moneda: "USD", importeTotal: 100 }), { USD: 1500 })

    expect(result).toEqual({ amount: 150_000, converted: true })
  })

  it("prefers the XML rate over the manual one", () => {
    const result = invoiceAmountInPesos(
      invoice({ moneda: "USD", importeTotal: 100, xmlData: { exchangeRate: 1000 } as AFIPInvoice["xmlData"] }),
      { USD: 1500 }
    )

    expect(result.amount).toBe(100_000)
  })

  it("reports foreign currency without a usable rate as not converted", () => {
    expect(invoiceAmountInPesos(invoice({ moneda: "USD", importeTotal: 100 }), {})).toEqual({
      amount: 0,
      converted: false,
    })
    expect(invoiceAmountInPesos(invoice({ moneda: "USD", importeTotal: 100 }), { USD: 0 })).toEqual({
      amount: 0,
      converted: false,
    })
  })

  it("subtracts a foreign credit note after converting", () => {
    const result = invoiceAmountInPesos(
      invoice({ tipo: "Nota de Crédito E", moneda: "USD", importeTotal: 100 }),
      { USD: 1500 }
    )

    expect(result).toEqual({ amount: -150_000, converted: true })
  })
})
