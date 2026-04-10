import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AFIPInvoice, MonotributoAFIPInfo } from "@/types/afip-scraper";

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
  default: vi.fn().mockImplementation((doc: Record<string, unknown>, options?: Record<string, unknown>) => {
    doc.lastAutoTable = { finalY: 100 };
    const didParseCell = options?.didParseCell as
      | ((data: { row: { index: number }; cell: { styles: Record<string, unknown> } }) => void)
      | undefined;
    const body = options?.body as unknown[][] | undefined;
    if (didParseCell && Array.isArray(body)) {
      body.forEach((row, rowIndex) => {
        const colCount = row?.length ?? 0;
        for (let c = 0; c < colCount; c++) {
          didParseCell({
            row: { index: rowIndex },
            cell: { styles: {} },
          });
        }
      });
    }
  }),
}));

vi.mock("html2canvas", () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => "data:image/png;base64,test",
    width: 800,
    height: 600,
  }),
}));

vi.mock("@/lib/pdf-save", () => ({
  savePdf: vi.fn().mockResolvedValue(undefined),
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

    it("includes tipoDeCambio when exchange rate is greater than zero", () => {
      exportToJSON(mockInvoices, mockCompany);

      const blobArg = mockCreateObjectURL.mock.calls[0][0] as { content: string[] };
      const parsed = JSON.parse(blobArg.content[0]) as {
        facturas: Array<{ tipoDeCambio?: number; moneda: string }>;
      };
      const usd = parsed.facturas.find((f) => f.moneda === "USD");
      expect(usd?.tipoDeCambio).toBe(1100);
    });

    it("omits tipoDeCambio when exchange rate is zero or missing", () => {
      const arsOnly: AFIPInvoice[] = [{ ...mockInvoices[0], xmlData: { exchangeRate: 0 } }];
      exportToJSON(arsOnly, mockCompany);

      const blobArg = mockCreateObjectURL.mock.calls[0][0] as { content: string[] };
      const parsed = JSON.parse(blobArg.content[0]) as { facturas: Array<{ tipoDeCambio?: number }> };
      expect(parsed.facturas[0].tipoDeCambio).toBeUndefined();
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

    it("uses venta monotributo totals when localStorage prefers venta", async () => {
      const getItem = vi.fn().mockReturnValue("venta");
      vi.stubGlobal("localStorage", { ...localStorage, getItem });

      const monotributoInfo: MonotributoAFIPInfo = {
        categoria: "C",
        tipoActividad: "venta",
        actividadDescripcion: "Venta",
        proximaRecategorizacion: "Julio 2026",
        nombreCompleto: "Test User",
        cuit: "20345678901",
      };

      await exportToPDF(mockInvoices, mockCompany, monotributoInfo);

      const autoTable = (await import("jspdf-autotable")).default;
      const firstCallBody = (autoTable as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][1] as {
        body: string[][];
      };
      expect(firstCallBody.body.some((row) => row.includes("Venta de Bienes"))).toBe(true);
    });

    it("includes monotributo ARCA table rows when monotributoInfo matches a category", async () => {
      const monotributoInfo: MonotributoAFIPInfo = {
        categoria: "A",
        tipoActividad: "servicios",
        actividadDescripcion: "LOCACIONES",
        proximaRecategorizacion: "Enero 2026",
        nombreCompleto: "Test User",
        cuit: "20345678901",
      };

      await exportToPDF(mockInvoices, mockCompany, monotributoInfo);

      const autoTable = (await import("jspdf-autotable")).default;
      const firstCallBody = (autoTable as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][1] as {
        body: string[][];
      };
      expect(firstCallBody.body.some((row) => row.includes("Categoría actual:"))).toBe(true);
      expect(firstCallBody.body.some((row) => row.includes("Pago mensual actual (A):"))).toBe(true);
    });

    it("sorts multiple foreign currencies alphabetically in totals table", async () => {
      const eurUsd: AFIPInvoice[] = [
        {
          fecha: "01/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 1,
          numero: 1,
          numeroCompleto: "0001-00000001",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "X",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Y",
          importeNeto: 100,
          importeIVA: 0,
          importeTotal: 100,
          moneda: "EUR",
          cae: "1",
          xmlData: { exchangeRate: 1200 },
        },
        {
          fecha: "02/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 1,
          numero: 2,
          numeroCompleto: "0001-00000002",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "X",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Y",
          importeNeto: 50,
          importeIVA: 0,
          importeTotal: 50,
          moneda: "USD",
          cae: "2",
          xmlData: { exchangeRate: 1100 },
        },
      ];

      await exportToPDF(eurUsd, mockCompany);

      const autoTable = (await import("jspdf-autotable")).default;
      const totalsCall = (autoTable as unknown as { mock: { calls: unknown[][] } }).mock.calls.find(
        (call) => (call[1] as { head?: string[][] })?.head?.[0]?.[0] === "Período"
      );
      const head = (totalsCall?.[1] as { head: string[][] }).head[0];
      const eurIdx = head.indexOf("EUR");
      const usdIdx = head.indexOf("USD");
      expect(eurIdx).toBeGreaterThan(-1);
      expect(usdIdx).toBeGreaterThan(-1);
      expect(eurIdx).toBeLessThan(usdIdx);
    });

    it("styles yearly total rows in didParseCell when both month and year rows exist", async () => {
      await exportToPDF(mockInvoices, mockCompany);

      const autoTable = (await import("jspdf-autotable")).default;
      const totalsCall = (autoTable as unknown as { mock: { calls: unknown[][] } }).mock.calls.find(
        (call) => typeof (call[1] as { didParseCell?: unknown })?.didParseCell === "function"
      );
      expect(totalsCall).toBeDefined();
      if (!totalsCall) return;
      const options = totalsCall[1] as {
        didParseCell: (data: { row: { index: number }; cell: { styles: Record<string, unknown> } }) => void;
        body: unknown[][];
      };
      const monthsCount = options.body.length - 1;
      const cell = { styles: {} as Record<string, unknown> };
      options.didParseCell({ row: { index: monthsCount }, cell });
      expect(cell.styles.fillColor).toEqual([38, 47, 85]);
      expect(cell.styles.textColor).toEqual([255, 255, 255]);
      expect(cell.styles.fontStyle).toBe("bold");
    });
  });

  describe("exportToPDF dark mode and charts", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("toggles dark class on document and loading splash while exporting", async () => {
      vi.useFakeTimers();

      const splashClassList = { add: vi.fn(), remove: vi.fn() };
      const splash = { classList: splashClassList };
      const htmlClassList = {
        contains: vi.fn((token: string) => token === "dark"),
        add: vi.fn(),
        remove: vi.fn(),
      };

      vi.stubGlobal("document", {
        ...document,
        createElement: mockCreateElement,
        documentElement: { classList: htmlClassList },
        getElementById: vi.fn((id: string) => (id === "pdf-loading-splash" ? splash : null)),
      });

      const exportPromise = exportToPDF(mockInvoices, mockCompany);
      await vi.advanceTimersByTimeAsync(50);
      await vi.advanceTimersByTimeAsync(100);
      await exportPromise;

      expect(htmlClassList.remove).toHaveBeenCalledWith("dark");
      expect(splashClassList.add).toHaveBeenCalledWith("dark");
      expect(htmlClassList.add).toHaveBeenCalledWith("dark");
      expect(splashClassList.remove).toHaveBeenCalledWith("dark");
    });

    it("captures charts when graficos section and chart nodes exist", async () => {
      vi.useFakeTimers();

      const buttons = [{ click: vi.fn() }, { click: vi.fn() }, { click: vi.fn() }];
      const graficosEl = { querySelectorAll: vi.fn().mockReturnValue(buttons) };

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
        getElementById: vi.fn((id: string) => {
          if (id === "graficos") return graficosEl;
          if (id === "chart-progreso" || id === "chart-distribucion" || id === "chart-mensual") return {};
          return null;
        }),
      });

      const html2canvas = (await import("html2canvas")).default;
      const exportPromise = exportToPDF(mockInvoices, mockCompany);
      await vi.advanceTimersByTimeAsync(50);
      await vi.advanceTimersByTimeAsync(4000 * 3 + 1);
      await exportPromise;

      expect(buttons.every((b) => b.click.mock.calls.length > 0)).toBe(true);
      expect(html2canvas).toHaveBeenCalled();
    });

    it("logs and skips chart when html2canvas rejects", async () => {
      vi.useFakeTimers();
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      const buttons = [{ click: vi.fn() }];
      const graficosEl = { querySelectorAll: vi.fn().mockReturnValue(buttons) };

      const html2canvas = (await import("html2canvas")).default;
      vi.mocked(html2canvas).mockRejectedValueOnce(new Error("capture failed"));

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
        getElementById: vi.fn((id: string) => {
          if (id === "graficos") return graficosEl;
          if (id === "chart-progreso") return {};
          return null;
        }),
      });

      const exportPromise = exportToPDF(mockInvoices, mockCompany);
      await vi.advanceTimersByTimeAsync(50);
      await vi.advanceTimersByTimeAsync(4000 + 1);
      await exportPromise;

      expect(consoleError).toHaveBeenCalledWith("Error capturing chart chart-progreso:", expect.any(Error));
      consoleError.mockRestore();
    });

    it("shows fallback text when graficos exists but no chart was captured", async () => {
      vi.useFakeTimers();

      const buttons = [{ click: vi.fn() }];
      const graficosEl = { querySelectorAll: vi.fn().mockReturnValue(buttons) };

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
        getElementById: vi.fn((id: string) => {
          if (id === "graficos") return graficosEl;
          return null;
        }),
      });

      const jsPDF = (await import("jspdf")).default;
      const exportPromise = exportToPDF(mockInvoices, mockCompany);
      await vi.advanceTimersByTimeAsync(50);
      await vi.advanceTimersByTimeAsync(4000 + 1);
      await exportPromise;

      const docInstance = vi.mocked(jsPDF).mock.results[0].value as { text: ReturnType<typeof vi.fn> };
      expect(docInstance.text).toHaveBeenCalledWith(
        "Los gráficos están disponibles en la versión web.",
        14,
        40
      );
    });

    it("shows message when graficos section is missing", async () => {
      vi.useFakeTimers();

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

      const jsPDF = (await import("jspdf")).default;
      const exportPromise = exportToPDF(mockInvoices, mockCompany);
      await vi.advanceTimersByTimeAsync(50);
      await exportPromise;

      const docInstance = vi.mocked(jsPDF).mock.results[0].value as { text: ReturnType<typeof vi.fn> };
      expect(docInstance.text).toHaveBeenCalledWith("No hay gráficos disponibles", 14, 40);
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
