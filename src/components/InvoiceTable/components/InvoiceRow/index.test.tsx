import { describe, expect, it } from "vitest";

import { InvoiceProvider } from "@/contexts/InvoiceContext";
import type { AFIPInvoice } from "@/types/afip-scraper";

import { InvoiceRow } from "./index";

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

const mockInvoiceUSDNoRate: AFIPInvoice = {
  ...mockInvoiceUSD,
  numero: 102,
  numeroCompleto: "00001-00000102",
  xmlData: undefined,
};

// PERF-1: InvoiceRow no longer subscribes to InvoiceContext. It receives the FX
// map as a prop, so it must render fully outside any provider. The provider here
// only exercises that the component still works when nested in the real tree.
const renderInTable = (children: React.ReactNode) => {
  return render(
    <InvoiceProvider>
      <table>
        <tbody>{children}</tbody>
      </table>
    </InvoiceProvider>
  );
};

const renderRowStandalone = (children: React.ReactNode) => {
  return render(
    <table>
      <tbody>{children}</tbody>
    </table>
  );
};

describe("InvoiceRow", () => {
  describe("ARS invoice", () => {
    it("should render date", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceARS} index={0} />);
      expect(screen.getByText("15/01/2025")).toBeInTheDocument();
    });

    it("should render tipo", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceARS} index={0} />);
      expect(screen.getByText("Factura C")).toBeInTheDocument();
    });

    it("should render numero completo", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceARS} index={0} />);
      expect(screen.getByText("00001-00000100")).toBeInTheDocument();
    });

    it("should render currency badge", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceARS} index={0} />);
      expect(screen.getByText("ARS")).toBeInTheDocument();
    });

    it("should render total with peso sign", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceARS} index={0} />);
      expect(screen.getAllByText(/\$.*1.*210/)).toHaveLength(2); // Total and Total en Pesos
    });
  });

  describe("USD invoice", () => {
    it("should render date", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceUSD} index={0} />);
      expect(screen.getByText("20/02/2025")).toBeInTheDocument();
    });

    it("should format Factura E type", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceUSD} index={0} />);
      expect(screen.getByText("Factura E")).toBeInTheDocument();
    });

    it("should render USD badge", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceUSD} index={0} />);
      expect(screen.getByText("USD")).toBeInTheDocument();
    });

    it("should show exchange rate", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceUSD} index={0} />);
      expect(screen.getByText(/TC:/)).toBeInTheDocument();
    });

    it("should calculate total in pesos", () => {
      renderInTable(<InvoiceRow invoice={mockInvoiceUSD} index={0} />);
      // 2000 USD * 1000 = 2.000.000 ARS
      expect(screen.getByText(/2.*000.*000/)).toBeInTheDocument();
    });
  });

  describe("manualExchangeRates prop (no context)", () => {
    it("renders standalone without an InvoiceProvider", () => {
      renderRowStandalone(<InvoiceRow invoice={mockInvoiceARS} index={0} />);
      expect(screen.getByText("00001-00000100")).toBeInTheDocument();
    });

    it("applies a manual FX rate passed via prop for a rate-less foreign invoice", () => {
      renderRowStandalone(
        <InvoiceRow invoice={mockInvoiceUSDNoRate} index={0} manualExchangeRates={{ USD: 900 }} />
      );
      // Manual rate flagged and total-in-pesos computed (2000 * 900 = 1.800.000)
      expect(screen.getByText(/\(manual\)/)).toBeInTheDocument();
      expect(screen.getByText(/1.*800.*000/)).toBeInTheDocument();
    });

    it("shows 'Sin TC' when no rate is provided for a foreign invoice", () => {
      renderRowStandalone(<InvoiceRow invoice={mockInvoiceUSDNoRate} index={0} />);
      expect(screen.getByText(/Sin TC/)).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("should have striped background for even rows", () => {
      const { container } = renderInTable(<InvoiceRow invoice={mockInvoiceARS} index={0} />);
      const row = container.querySelector("tr");
      expect(row).toHaveClass("bg-muted/80");
    });

    it("should not have striped background for odd rows", () => {
      const { container } = renderInTable(<InvoiceRow invoice={mockInvoiceARS} index={1} />);
      const row = container.querySelector("tr");
      expect(row).not.toHaveClass("bg-muted/80");
    });

    it("should have hover effect", () => {
      const { container } = renderInTable(<InvoiceRow invoice={mockInvoiceARS} index={0} />);
      const row = container.querySelector("tr");
      expect(row).toHaveClass("hover:bg-primary/15");
    });

    it("should apply success styling for Factura E", () => {
      const { container } = renderInTable(<InvoiceRow invoice={mockInvoiceUSD} index={0} />);
      const badge = container.querySelector(".bg-success\\/10");
      expect(badge).toBeInTheDocument();
    });
  });
});
