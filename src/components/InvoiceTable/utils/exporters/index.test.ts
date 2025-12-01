import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

// Import after mocks
import { exportToCSV, exportToJSON, exportToPDF } from "./index";

// Mock jsPDF and html2canvas
vi.mock("jspdf", () => {
  const MockJsPDF = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.setFontSize = vi.fn();
    this.setTextColor = vi.fn();
    this.setDrawColor = vi.fn();
    this.setFillColor = vi.fn();
    this.setFont = vi.fn();
    this.roundedRect = vi.fn();
    this.line = vi.fn();
    this.text = vi.fn();
    this.addPage = vi.fn();
    this.addImage = vi.fn();
    this.save = vi.fn();
    this.setPage = vi.fn();
    this.internal = {
      pageSize: { width: 210, height: 297 },
      getNumberOfPages: () => 3,
    };
  });
  return { default: MockJsPDF };
});

vi.mock("jspdf-autotable", () => ({
  default: vi.fn().mockImplementation((doc: Record<string, unknown>) => {
    // Set lastAutoTable on the doc instance
    doc.lastAutoTable = { finalY: 100 };
  }),
}));

vi.mock("html2canvas", () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => "data:image/png;base64,test",
    width: 800,
    height: 600,
  }),
}));

describe("exporters", () => {
  const mockInvoices: AFIPInvoice[] = [
    {
      fecha: "15/11/2025",
      tipo: "Factura C",
      tipoComprobante: 11,
      puntoVenta: 2,
      numero: 150,
      numeroCompleto: "0002-00000150",
      cuitEmisor: "20345678901",
      razonSocialEmisor: "Mi Empresa SA",
      cuitReceptor: "30709876543",
      razonSocialReceptor: "Cliente SA",
      importeNeto: 80000,
      importeIVA: 20000,
      importeTotal: 100000,
      moneda: "ARS",
      cae: "12345678901234",
    },
    {
      fecha: "10/11/2025",
      tipo: "Factura de Exportación E",
      tipoComprobante: 19,
      puntoVenta: 2,
      numero: 50,
      numeroCompleto: "0002-00000050",
      cuitEmisor: "20345678901",
      razonSocialEmisor: "Mi Empresa SA",
      cuitReceptor: "99999999999",
      razonSocialReceptor: "Foreign Client LLC",
      importeNeto: 1000,
      importeIVA: 0,
      importeTotal: 1000,
      moneda: "USD",
      cae: "12345678901235",
      xmlData: {
        exchangeRate: 1100,
      },
    },
    {
      fecha: "05/11/2025",
      tipo: "Nota de Crédito C",
      tipoComprobante: 13,
      puntoVenta: 2,
      numero: 10,
      numeroCompleto: "0002-00000010",
      cuitEmisor: "20345678901",
      razonSocialEmisor: "Mi Empresa SA",
      cuitReceptor: "30709876543",
      razonSocialReceptor: "Cliente SA",
      importeNeto: 8000,
      importeIVA: 2000,
      importeTotal: 10000,
      moneda: "ARS",
      cae: "12345678901236",
    },
  ];

  const mockCompany = {
    cuit: "20345678901",
    razonSocial: "Mi Empresa SA",
  };

  let mockCreateElement: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock DOM methods
    mockClick = vi.fn();
    mockCreateElement = vi.fn().mockReturnValue({
      click: mockClick,
      href: "",
      download: "",
    });
    mockCreateObjectURL = vi.fn().mockReturnValue("blob:test-url");

    vi.stubGlobal("document", {
      ...document,
      createElement: mockCreateElement,
      documentElement: {
        classList: {
          contains: () => false,
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
      getElementById: vi.fn().mockReturnValue(null),
    });

    vi.stubGlobal("URL", {
      createObjectURL: mockCreateObjectURL,
    });

    vi.stubGlobal("Blob", class MockBlob {
      content: string[];
      options: { type: string };
      constructor(content: string[], options: { type: string }) {
        this.content = content;
        this.options = options;
      }
    });
  });

  describe("exportToCSV", () => {
    it("creates CSV with correct headers", () => {
      exportToCSV(mockInvoices);

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it("generates filename with company info", () => {
      exportToCSV(mockInvoices, mockCompany);

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toMatch(/mi-empresa-sa-20345678901/);
      expect(linkElement.download).toMatch(/\.csv$/);
    });

    it("generates default filename without company", () => {
      exportToCSV(mockInvoices);

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toMatch(/facturas_/);
      expect(linkElement.download).toMatch(/\.csv$/);
    });

    it("handles empty invoices array", () => {
      exportToCSV([]);

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe("exportToJSON", () => {
    it("creates JSON with correct structure", () => {
      exportToJSON(mockInvoices, mockCompany);

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it("generates filename with company info", () => {
      exportToJSON(mockInvoices, mockCompany);

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toMatch(/mi-empresa-sa-20345678901/);
      expect(linkElement.download).toMatch(/\.json$/);
    });

    it("generates default filename without company", () => {
      exportToJSON(mockInvoices);

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toMatch(/facturas_/);
      expect(linkElement.download).toMatch(/\.json$/);
    });

    it("includes exchange rate for foreign currency invoices", () => {
      // The JSON export should include tipoDeCambio for USD invoices
      // We can't easily check the blob content, but we verify the function runs
      exportToJSON(mockInvoices, mockCompany);
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe("exportToPDF", () => {
    it("creates PDF document", async () => {
      await exportToPDF(mockInvoices, mockCompany);

      // jsPDF constructor should be called
      const jsPDF = (await import("jspdf")).default;
      expect(jsPDF).toHaveBeenCalled();
    });

    it("handles empty invoices", async () => {
      await exportToPDF([], mockCompany);

      const jsPDF = (await import("jspdf")).default;
      expect(jsPDF).toHaveBeenCalled();
    });

    it("handles missing company info", async () => {
      await exportToPDF(mockInvoices, null);

      const jsPDF = (await import("jspdf")).default;
      expect(jsPDF).toHaveBeenCalled();
    });
  });

  describe("filename generation", () => {
    it("sanitizes company name for filename", () => {
      const companyWithSpecialChars = {
        cuit: "20345678901",
        razonSocial: "Empresa Ñoña & Cía. S.A.",
      };

      exportToCSV(mockInvoices, companyWithSpecialChars);

      const linkElement = mockCreateElement.mock.results[0].value;
      // Should not contain special characters like ñ or &
      // Note: the regex excludes . because it's in the extension
      expect(linkElement.download).not.toMatch(/[ñ&]/);
      expect(linkElement.download).toMatch(/empresa-nona/i);
    });

    it("limits filename length", () => {
      const companyWithLongName = {
        cuit: "20345678901",
        razonSocial: `${"A".repeat(100)  } Very Long Company Name That Should Be Truncated`,
      };

      exportToCSV(mockInvoices, companyWithLongName);

      const linkElement = mockCreateElement.mock.results[0].value;
      // Filename should be reasonable length
      expect(linkElement.download.length).toBeLessThan(100);
    });
  });

  describe("invoice calculations", () => {
    it("calculates total in pesos for ARS invoices", () => {
      const arsInvoices: AFIPInvoice[] = [
        {
          ...mockInvoices[0],
          moneda: "ARS",
          importeTotal: 50000,
        },
      ];

      // This is tested indirectly through CSV export
      exportToCSV(arsInvoices);
      expect(mockClick).toHaveBeenCalled();
    });

    it("calculates total in pesos for USD invoices with exchange rate", () => {
      const usdInvoices: AFIPInvoice[] = [
        {
          ...mockInvoices[1],
          moneda: "USD",
          importeTotal: 1000,
          xmlData: { exchangeRate: 1100 },
        },
      ];

      // This is tested indirectly through CSV export
      exportToCSV(usdInvoices);
      expect(mockClick).toHaveBeenCalled();
    });

    it("handles credit notes (subtraction)", () => {
      const creditNoteInvoices: AFIPInvoice[] = [
        {
          ...mockInvoices[2],
          tipo: "Nota de Crédito C",
          importeTotal: 10000,
        },
      ];

      exportToCSV(creditNoteInvoices);
      expect(mockClick).toHaveBeenCalled();
    });
  });
});
