import { describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { EmittedTab } from "./index";

import { render, screen } from "@testing-library/react";

vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({
    state: {
      invoices: [
        {
          fecha: "03/07/2026",
          tipo: "FACTURA C",
          tipoComprobante: 11,
          puntoVenta: 3,
          numero: 89,
          numeroCompleto: "00003-00000089",
          cuitReceptor: "30707915281",
          razonSocialReceptor: "CLIENTE X",
          importeNeto: 200000,
          importeTotal: 200000,
          importeIVA: 0,
          moneda: "ARS",
          cae: "1",
          vencimientoCae: "",
          cuitEmisor: "",
          razonSocialEmisor: "GSA",
          emittedByGarca: true,
        } as AFIPInvoice,
        {
          fecha: "03/07/2026",
          tipo: "FACTURA C",
          tipoComprobante: 11,
          puntoVenta: 3,
          numero: 10,
          numeroCompleto: "00003-00000010",
          cuitReceptor: "30707915281",
          razonSocialReceptor: "CLIENTE X",
          importeNeto: 200000,
          importeTotal: 200000,
          importeIVA: 0,
          moneda: "ARS",
          cae: "1",
          vencimientoCae: "",
          cuitEmisor: "",
          razonSocialEmisor: "GSA",
          emittedByGarca: false,
        } as AFIPInvoice,
      ],
      company: null,
      isHydrated: true,
      isLoading: false,
      error: null,
      errorCode: null,
      progress: null,
      hasQueried: true,
    },
    companiesState: { companies: [], isLoading: false, error: null },
    monotributoInfo: null,
    manualExchangeRates: {},
    setManualExchangeRate: () => {},
    fetchCompanies: async () => false,
    fetchInvoicesWithCompany: async () => {},
    clearInvoices: () => {},
    clearCompanies: () => {},
    loadFromStorage: () => {},
    loadDemoData: () => {},
    cancelOperation: () => {},
    isOperationInProgress: false,
    addEmittedInvoice: () => {},
  }),
}));

describe("EmittedTab", () => {
  it("muestra solo las facturas emitidas por GARCA", () => {
    render(<EmittedTab />);
    expect(screen.getAllByText("00003-00000089").length).toBeGreaterThan(0);
    expect(screen.queryByText("00003-00000010")).not.toBeInTheDocument();
  });
});
