import { beforeEach,describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";
import type { MonotributoData } from "@/types/monotributo";

import { ChartsPanel } from "./index";

import { fireEvent,render, screen } from "@testing-library/react";

// Mock recharts to avoid canvas issues in tests
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

// Mock invoice context
const mockInvoices: AFIPInvoice[] = [
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
  {
    fecha: "05/09/2025",
    tipo: "Nota de Crédito C",
    tipoComprobante: 13,
    puntoVenta: 2,
    numero: 10,
    numeroCompleto: "0002-00000010",
    cuitEmisor: "20345678901",
    razonSocialEmisor: "Test Company",
    cuitReceptor: "30712345678",
    razonSocialReceptor: "Client Company",
    importeNeto: -100000,
    importeIVA: -21000,
    importeTotal: -121000,
    moneda: "ARS",
    cae: "75000000000002",
  },
];

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

const mockMonotributoData: MonotributoData = {
  categorias: [
    {
      categoria: "A",
      ingresosBrutos: 7813063.45,
      superficieAfectada: "30",
      energiaElectrica: "3330",
      alquileres: 563459.99,
      precioUnitarioMax: 296735.02,
      impuestoIntegrado: { servicios: 3662.02, venta: 3662.02 },
      aportesSIPA: 10406.36,
      aportesObraSocial: 14815.55,
      total: { servicios: 28883.93, venta: 28883.93 },
    },
    {
      categoria: "B",
      ingresosBrutos: 11447046.44,
      superficieAfectada: "45",
      energiaElectrica: "5000",
      alquileres: 563459.99,
      precioUnitarioMax: 296735.02,
      impuestoIntegrado: { servicios: 7048.18, venta: 7048.18 },
      aportesSIPA: 11446.99,
      aportesObraSocial: 16297.11,
      total: { servicios: 34792.28, venta: 34792.28 },
    },
    {
      categoria: "H",
      ingresosBrutos: 68000000,
      superficieAfectada: "200",
      energiaElectrica: "16500",
      alquileres: 1689014.61,
      precioUnitarioMax: 296735.02,
      impuestoIntegrado: { servicios: 94493.02, venta: 94493.02 },
      aportesSIPA: 22893.98,
      aportesObraSocial: 32594.22,
      total: { servicios: 149981.22, venta: 149981.22 },
    },
  ],
  fechaVigencia: "01/2025",
};

describe("ChartsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(ChartsPanel).toBeDefined();
  });

  it("renders the component with title", () => {
    render(
      <ChartsPanel
        monotributoData={mockMonotributoData}
        ingresosAnuales={5000000}
        isCurrentYearData={true}
      />
    );

    expect(screen.getByText("Análisis Visual")).toBeInTheDocument();
  });

  it("renders all three tabs", () => {
    render(
      <ChartsPanel
        monotributoData={mockMonotributoData}
        ingresosAnuales={5000000}
        isCurrentYearData={true}
      />
    );

    expect(screen.getByText("Progreso Monotributo")).toBeInTheDocument();
    expect(screen.getByText("Distribución")).toBeInTheDocument();
    expect(screen.getByText("Mensual")).toBeInTheDocument();
  });

  it("shows NoDataMessage when isCurrentYearData is false", () => {
    render(
      <ChartsPanel
        monotributoData={mockMonotributoData}
        ingresosAnuales={5000000}
        isCurrentYearData={false}
      />
    );

    expect(screen.getByText("Gráficos no disponibles")).toBeInTheDocument();
    expect(
      screen.getByText(/Los gráficos de progreso de Monotributo solo están disponibles/)
    ).toBeInTheDocument();
  });

  it("switches tabs when clicked", () => {
    render(
      <ChartsPanel
        monotributoData={mockMonotributoData}
        ingresosAnuales={5000000}
        isCurrentYearData={true}
      />
    );

    // Initially on "Progreso Monotributo" tab
    const progresoTab = screen.getByText("Progreso Monotributo");
    expect(progresoTab.closest("button")).toHaveClass("bg-primary");

    // Click on "Distribución" tab
    const distribucionTab = screen.getByText("Distribución");
    fireEvent.click(distribucionTab);
    expect(distribucionTab.closest("button")).toHaveClass("bg-primary");

    // Click on "Mensual" tab
    const mensualTab = screen.getByText("Mensual");
    fireEvent.click(mensualTab);
    expect(mensualTab.closest("button")).toHaveClass("bg-primary");
  });

  it("renders progreso chart by default", () => {
    render(
      <ChartsPanel
        monotributoData={mockMonotributoData}
        ingresosAnuales={5000000}
        isCurrentYearData={true}
      />
    );

    expect(screen.getByText("Ingresos Acumulados vs Límites de Categorías")).toBeInTheDocument();
  });

  it("renders distribucion chart when tab is clicked", () => {
    render(
      <ChartsPanel
        monotributoData={mockMonotributoData}
        ingresosAnuales={5000000}
        isCurrentYearData={true}
      />
    );

    fireEvent.click(screen.getByText("Distribución"));
    expect(screen.getByText("Distribución de Ingresos por Moneda")).toBeInTheDocument();
  });

  it("renders mensual chart when tab is clicked", () => {
    render(
      <ChartsPanel
        monotributoData={mockMonotributoData}
        ingresosAnuales={5000000}
        isCurrentYearData={true}
      />
    );

    fireEvent.click(screen.getByText("Mensual"));
    expect(screen.getByText("Ingresos por Mes")).toBeInTheDocument();
  });

  it("handles null monotributoData gracefully", () => {
    render(
      <ChartsPanel
        monotributoData={null}
        ingresosAnuales={5000000}
        isCurrentYearData={true}
      />
    );

    // Should still render without crashing
    expect(screen.getByText("Análisis Visual")).toBeInTheDocument();
  });

  it("handles zero ingresosAnuales", () => {
    render(
      <ChartsPanel
        monotributoData={mockMonotributoData}
        ingresosAnuales={0}
        isCurrentYearData={true}
      />
    );

    expect(screen.getByText("Análisis Visual")).toBeInTheDocument();
  });
});
