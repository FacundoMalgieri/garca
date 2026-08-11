import { beforeEach,describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";
import type { MonotributoData } from "@/types/monotributo";

import { ChartsPanel, prepareMonthlyData } from "./index";

import { fireEvent,render, screen } from "@testing-library/react";

// Mock recharts to avoid canvas issues in tests
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({
    children,
    label,
  }: {
    children?: React.ReactNode;
    label?: (props: { percent?: number }) => React.ReactNode;
  }) => (
    <div data-testid="pie">
      {typeof label === "function" ? label({ percent: 0.25 }) : null}
      {children}
    </div>
  ),
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ReferenceLine: ({
    label,
  }: {
    label?: (props: { viewBox?: { x?: number; y?: number } }) => React.ReactNode;
  }) => (
    <div data-testid="reference-line">
      {typeof label === "function" ? label({ viewBox: { x: 10, y: 20 } }) : null}
    </div>
  ),
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
  {
    fecha: "01/08/2025",
    tipo: "Factura C",
    tipoComprobante: 11,
    puntoVenta: 1,
    numero: 99,
    numeroCompleto: "0001-00000099",
    cuitEmisor: "20345678901",
    razonSocialEmisor: "Test Company",
    cuitReceptor: "30712345678",
    razonSocialReceptor: "Client Company",
    importeNeto: 50000,
    importeIVA: 10500,
    importeTotal: 60500,
    moneda: "CLP",
    cae: "75000000000003",
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

/** Ventana que cubre los meses de mockInvoices (Ago-Nov 2025). */
const VENTANA_TEST = {
  desde: "2025-08",
  hasta: "2026-07",
  cobertura: { estado: "completa" as const, mesesCubiertos: 12, mesesCerrados: 12, faltantes: [] },
};

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

/** Categoría vigente cuyo tope dibuja la línea de referencia del gráfico */
const mockCategoriaLimite = mockMonotributoData.categorias[1]; // B

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
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
        isCurrentYearData={true}
      />
    );

    expect(screen.getByText("Análisis Visual")).toBeInTheDocument();
  });

  it("renders all three tabs", () => {
    render(
      <ChartsPanel
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
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
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
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
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
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
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
        isCurrentYearData={true}
      />
    );

    expect(screen.getByText("Ingresos Acumulados vs Límites de Categorías")).toBeInTheDocument();
  });

  it("renders distribucion chart when tab is clicked", () => {
    render(
      <ChartsPanel
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
        isCurrentYearData={true}
      />
    );

    fireEvent.click(screen.getByText("Distribución"));
    expect(screen.getByText("Distribución de Ingresos por Moneda")).toBeInTheDocument();
  });

  it("renders mensual chart when tab is clicked", () => {
    render(
      <ChartsPanel
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
        isCurrentYearData={true}
      />
    );

    fireEvent.click(screen.getByText("Mensual"));
    expect(screen.getByText("Ingresos por Mes")).toBeInTheDocument();
  });

  it("handles a null categoriaLimite gracefully", () => {
    render(
      <ChartsPanel
        categoriaLimite={null}
        ventana={VENTANA_TEST}
        isCurrentYearData={true}
      />
    );

    // Should still render without crashing
    expect(screen.getByText("Análisis Visual")).toBeInTheDocument();
  });

  it("renders with the category cap line", () => {
    render(
      <ChartsPanel
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
        isCurrentYearData={true}
      />
    );

    expect(screen.getByText("Análisis Visual")).toBeInTheDocument();
  });

  it("renders reference line labels when category is available", () => {
    render(
      <ChartsPanel
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
        isCurrentYearData={true}
      />
    );

    expect(screen.getByText(/Límite Cat\./)).toBeInTheDocument();
  });

  it("uses fallback colors for unknown currencies in distribución", () => {
    render(
      <ChartsPanel
        categoriaLimite={mockCategoriaLimite}
        ventana={VENTANA_TEST}
        isCurrentYearData={true}
      />
    );

    fireEvent.click(screen.getByText("Distribución"));
    expect(screen.getByText("Facturas en CLP")).toBeInTheDocument();
  });
});

describe("prepareMonthlyData", () => {
  /** Total en pesos de los mocks, por mes. NC de Septiembre resta. */
  // Ago 2025: 60500 CLP sin cotización → excluido del total
  // Sep 2025: -121000 (nota de crédito)
  // Oct 2025: 2000 USD × 1000 = 2.000.000
  // Nov 2025: 1.210.000

  it("sin ventana devuelve todos los meses del período consultado", () => {
    const data = prepareMonthlyData(mockInvoices, {});

    // Sin sufijo de año: los mocks son todos 2025 y el label sólo lo agrega
    // cuando el período cruza años.
    expect(data.map((d) => d.month)).toEqual(["Ago", "Sep", "Oct", "Nov"]);
  });

  it("con ventana deja afuera los meses que no son de la ventana", () => {
    // El bug: el gráfico acumulaba los 13 meses del período consultado y los
    // comparaba contra un tope ANUAL. Cruzar esa línea no significaba nada.
    const data = prepareMonthlyData(mockInvoices, {}, { desde: "2025-10", hasta: "2026-09" });

    expect(data.map((d) => d.month)).toEqual(["Oct", "Nov"]);
  });

  it("el acumulado arranca de cero en la ventana, sin arrastrar lo anterior", () => {
    const data = prepareMonthlyData(mockInvoices, {}, { desde: "2025-10", hasta: "2026-09" });

    // Oct: 2.000.000 (y NO 2.000.000 - 121.000 de la NC de Septiembre)
    expect(data[0].acumulado).toBe(2_000_000);
    expect(data[1].acumulado).toBe(3_210_000);
  });

  it("excluye los meses posteriores a la ventana", () => {
    const data = prepareMonthlyData(mockInvoices, {}, { desde: "2025-08", hasta: "2025-09" });

    expect(data.map((d) => d.month)).toEqual(["Ago", "Sep"]);
  });
});

describe("ChartsPanel · subtítulo del progreso", () => {
  it("nombra la ventana de recategorización, no 'el período consultado'", () => {
    // Un acumulado del período consultado comparado contra un tope anual no
    // quiere decir nada. El subtítulo tiene que decir sobre qué 12 meses corre.
    render(
      <ChartsPanel
        categoriaLimite={null}
        ventana={{
          desde: "2026-01",
          hasta: "2026-12",
          cobertura: { estado: "completa", mesesCubiertos: 7, mesesCerrados: 7, faltantes: [] },
        }}
      />
    );

    expect(screen.getByText(/Ene 2026 a Dic 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/Acumulado del período consultado/)).not.toBeInTheDocument();
  });
})

describe("ChartsPanel · ventana sin datos", () => {
  const SIN_DATOS = { desde: "2030-01", hasta: "2030-12" };

  it("no dibuja un gráfico vacío: explica que la consulta no cubre la ventana", () => {
    // Un área en cero se lee como "no facturaste nada en la ventana", que es una
    // conclusión distinta de "no consultamos esos meses".
    render(
      <ChartsPanel
        categoriaLimite={null}
        ventana={{
          ...SIN_DATOS,
          cobertura: { estado: "parcial", mesesCubiertos: 0, mesesCerrados: 12, faltantes: ["2030-01"] },
        }}
      />
    );

    expect(screen.queryByTestId("area-chart")).not.toBeInTheDocument();
    expect(screen.getByText(/no cubre/i)).toBeInTheDocument();
  });

  it("cuando la ventana está bien cubierta y no hay facturación, lo dice sin culpar a la consulta", () => {
    render(
      <ChartsPanel
        categoriaLimite={null}
        ventana={{
          ...SIN_DATOS,
          cobertura: { estado: "completa", mesesCubiertos: 12, mesesCerrados: 12, faltantes: [] },
        }}
      />
    );

    expect(screen.getByText(/sin facturación/i)).toBeInTheDocument();
    expect(screen.queryByText(/no cubre/i)).not.toBeInTheDocument();
  });
})
