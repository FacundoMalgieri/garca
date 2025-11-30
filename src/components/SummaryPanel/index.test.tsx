import { beforeEach,describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { SummaryPanel } from "./index";

import { render, screen } from "@testing-library/react";

// Mock invoice context
let mockInvoices: AFIPInvoice[] = [];

vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({
    state: {
      invoices: mockInvoices,
      isLoading: false,
      error: null,
      errorCode: null,
      company: null,
    },
  }),
}));

describe("SummaryPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoices = [];
  });

  it("should be defined", () => {
    expect(SummaryPanel).toBeDefined();
  });

  it("renders the title", () => {
    render(<SummaryPanel />);
    expect(screen.getByText("Totales")).toBeInTheDocument();
  });

  it("shows no data message when no invoices", () => {
    render(<SummaryPanel />);
    expect(screen.getByText("No hay datos para mostrar")).toBeInTheDocument();
  });

  it("renders monthly data when invoices exist", () => {
    mockInvoices = [
      {
        fecha: "15/11/2025",
        tipo: "Factura C",
        tipoComprobante: 11,
        puntoVenta: 2,
        numero: 150,
        numeroCompleto: "0002-00000150",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "30712345678",
        razonSocialReceptor: "Client Company",
        importeNeto: 1000000,
        importeIVA: 210000,
        importeTotal: 1210000,
        moneda: "ARS",
        cae: "75000000000000",
      },
    ];

    render(<SummaryPanel />);
    // Should not show "no data" message
    expect(screen.queryByText("No hay datos para mostrar")).not.toBeInTheDocument();
  });

  it("renders yearly totals", () => {
    mockInvoices = [
      {
        fecha: "15/11/2025",
        tipo: "Factura C",
        tipoComprobante: 11,
        puntoVenta: 2,
        numero: 150,
        numeroCompleto: "0002-00000150",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "30712345678",
        razonSocialReceptor: "Client Company",
        importeNeto: 1000000,
        importeIVA: 210000,
        importeTotal: 1210000,
        moneda: "ARS",
        cae: "75000000000000",
      },
    ];

    render(<SummaryPanel />);
    // Should show year 2025 (in "Total 2025" or "Noviembre 2025")
    expect(screen.getAllByText(/2025/).length).toBeGreaterThan(0);
  });

  it("handles USD invoices with exchange rate", () => {
    mockInvoices = [
      {
        fecha: "10/10/2025",
        tipo: "Factura de Exportación E",
        tipoComprobante: 19,
        puntoVenta: 1,
        numero: 25,
        numeroCompleto: "0001-00000025",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "55000002126",
        razonSocialReceptor: "Foreign Client",
        importeNeto: 2000,
        importeIVA: 0,
        importeTotal: 2000,
        moneda: "USD",
        cae: "75000000000001",
        xmlData: {
          tipo: "Factura de Exportación E",
          puntoVenta: "0001",
          numero: "00000025",
          fecha: "10/10/2025",
          importe: "2000",
          moneda: "USD",
          cuitEmisor: "20345678901",
          cuitReceptor: "55000002126",
          cae: "75000000000001",
          exchangeRate: 1000,
        },
      },
    ];

    render(<SummaryPanel />);
    // Should not show "no data" message
    expect(screen.queryByText("No hay datos para mostrar")).not.toBeInTheDocument();
  });

  it("handles credit notes (subtracts from totals)", () => {
    mockInvoices = [
      {
        fecha: "15/11/2025",
        tipo: "Factura C",
        tipoComprobante: 11,
        puntoVenta: 2,
        numero: 150,
        numeroCompleto: "0002-00000150",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "30712345678",
        razonSocialReceptor: "Client Company",
        importeNeto: 1000000,
        importeIVA: 210000,
        importeTotal: 1210000,
        moneda: "ARS",
        cae: "75000000000000",
      },
      {
        fecha: "20/11/2025",
        tipo: "Nota de Crédito C",
        tipoComprobante: 13,
        puntoVenta: 2,
        numero: 10,
        numeroCompleto: "0002-00000010",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "30712345678",
        razonSocialReceptor: "Client Company",
        importeNeto: 100000,
        importeIVA: 21000,
        importeTotal: 121000,
        moneda: "ARS",
        cae: "75000000000002",
      },
    ];

    render(<SummaryPanel />);
    // Should render without crashing
    expect(screen.getByText("Totales")).toBeInTheDocument();
  });

  it("handles multiple currencies", () => {
    mockInvoices = [
      {
        fecha: "15/11/2025",
        tipo: "Factura C",
        tipoComprobante: 11,
        puntoVenta: 2,
        numero: 150,
        numeroCompleto: "0002-00000150",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "30712345678",
        razonSocialReceptor: "Client Company",
        importeNeto: 1000000,
        importeIVA: 210000,
        importeTotal: 1210000,
        moneda: "ARS",
        cae: "75000000000000",
      },
      {
        fecha: "10/11/2025",
        tipo: "Factura de Exportación E",
        tipoComprobante: 19,
        puntoVenta: 1,
        numero: 25,
        numeroCompleto: "0001-00000025",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "55000002126",
        razonSocialReceptor: "Foreign Client",
        importeNeto: 2000,
        importeIVA: 0,
        importeTotal: 2000,
        moneda: "USD",
        cae: "75000000000001",
        xmlData: {
          tipo: "Factura de Exportación E",
          puntoVenta: "0001",
          numero: "00000025",
          fecha: "10/11/2025",
          importe: "2000",
          moneda: "USD",
          cuitEmisor: "20345678901",
          cuitReceptor: "55000002126",
          cae: "75000000000001",
          exchangeRate: 1000,
        },
      },
    ];

    render(<SummaryPanel />);
    // Should render without crashing
    expect(screen.getByText("Totales")).toBeInTheDocument();
  });

  it("handles multiple months", () => {
    mockInvoices = [
      {
        fecha: "15/11/2025",
        tipo: "Factura C",
        tipoComprobante: 11,
        puntoVenta: 2,
        numero: 150,
        numeroCompleto: "0002-00000150",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "30712345678",
        razonSocialReceptor: "Client Company",
        importeNeto: 1000000,
        importeIVA: 210000,
        importeTotal: 1210000,
        moneda: "ARS",
        cae: "75000000000000",
      },
      {
        fecha: "15/10/2025",
        tipo: "Factura C",
        tipoComprobante: 11,
        puntoVenta: 2,
        numero: 149,
        numeroCompleto: "0002-00000149",
        cuitEmisor: "20345678901",
        razonSocialEmisor: "Test Company",
        cuitReceptor: "30712345678",
        razonSocialReceptor: "Client Company",
        importeNeto: 500000,
        importeIVA: 105000,
        importeTotal: 605000,
        moneda: "ARS",
        cae: "75000000000003",
      },
    ];

    render(<SummaryPanel />);
    // Should render without crashing
    expect(screen.getByText("Totales")).toBeInTheDocument();
    expect(screen.getAllByText(/2025/).length).toBeGreaterThan(0);
  });
});
