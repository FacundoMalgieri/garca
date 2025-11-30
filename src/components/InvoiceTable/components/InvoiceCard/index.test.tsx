import { describe, expect, it } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { InvoiceCard } from "./index";

import { render, screen } from "@testing-library/react";

const mockInvoiceARS: AFIPInvoice = {
  fecha: "15/01/2025",
  tipo: "Factura C",
  tipoComprobante: 11,
  puntoVenta: 1,
  numero: 100,
  numeroCompleto: "00001-00000100",
  cuitEmisor: "20123456789",
  razonSocialEmisor: "Test Emisor",
  cuitReceptor: "30123456789",
  razonSocialReceptor: "Cliente ABC",
  importeNeto: 1000,
  importeIVA: 210,
  importeTotal: 1210,
  moneda: "ARS",
};

const mockInvoiceUSD: AFIPInvoice = {
  fecha: "20/02/2025",
  tipo: "Factura de Exportación E",
  tipoComprobante: 19,
  puntoVenta: 1,
  numero: 101,
  numeroCompleto: "00001-00000101",
  cuitEmisor: "20123456789",
  razonSocialEmisor: "Test Emisor",
  cuitReceptor: "30999888777",
  razonSocialReceptor: "Cliente XYZ",
  importeNeto: 2000,
  importeIVA: 0,
  importeTotal: 2000,
  moneda: "USD",
  xmlData: { exchangeRate: 1000 },
};

describe("InvoiceCard", () => {
  describe("ARS invoice", () => {
    it("should render date", () => {
      render(<InvoiceCard invoice={mockInvoiceARS} />);
      expect(screen.getByText("15/01/2025")).toBeInTheDocument();
    });

    it("should render numero completo", () => {
      render(<InvoiceCard invoice={mockInvoiceARS} />);
      expect(screen.getByText("00001-00000100")).toBeInTheDocument();
    });

    it("should render tipo", () => {
      render(<InvoiceCard invoice={mockInvoiceARS} />);
      expect(screen.getByText("Factura C")).toBeInTheDocument();
    });

    it("should render currency badge", () => {
      render(<InvoiceCard invoice={mockInvoiceARS} />);
      expect(screen.getByText("ARS")).toBeInTheDocument();
    });

    it("should render total label", () => {
      render(<InvoiceCard invoice={mockInvoiceARS} />);
      expect(screen.getByText("Total (ARS):")).toBeInTheDocument();
    });

    it("should render total en pesos label", () => {
      render(<InvoiceCard invoice={mockInvoiceARS} />);
      expect(screen.getByText("Total en Pesos:")).toBeInTheDocument();
    });

    it("should not show exchange rate for ARS", () => {
      render(<InvoiceCard invoice={mockInvoiceARS} />);
      expect(screen.queryByText("Tipo de cambio:")).not.toBeInTheDocument();
    });
  });

  describe("USD invoice", () => {
    it("should render date", () => {
      render(<InvoiceCard invoice={mockInvoiceUSD} />);
      expect(screen.getByText("20/02/2025")).toBeInTheDocument();
    });

    it("should format Factura E type", () => {
      render(<InvoiceCard invoice={mockInvoiceUSD} />);
      expect(screen.getByText("Factura E")).toBeInTheDocument();
    });

    it("should render USD badge", () => {
      render(<InvoiceCard invoice={mockInvoiceUSD} />);
      expect(screen.getByText("USD")).toBeInTheDocument();
    });

    it("should show exchange rate", () => {
      render(<InvoiceCard invoice={mockInvoiceUSD} />);
      expect(screen.getByText("Tipo de cambio:")).toBeInTheDocument();
    });

    it("should display total in USD", () => {
      render(<InvoiceCard invoice={mockInvoiceUSD} />);
      expect(screen.getByText("Total (USD):")).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("should have card border", () => {
      const { container } = render(<InvoiceCard invoice={mockInvoiceARS} />);
      expect(container.firstChild).toHaveClass("border");
    });

    it("should apply success styling for Factura E", () => {
      const { container } = render(<InvoiceCard invoice={mockInvoiceUSD} />);
      const badge = container.querySelector(".bg-success\\/10");
      expect(badge).toBeInTheDocument();
    });
  });
});
