import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonotributoAFIPInfo } from "@/types/afip-scraper";

import { MonotributoPanel } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

// Mock the hooks
const mockClearInvoices = vi.fn();
const mockUpdateTipoActividad = vi.fn();

/** Mutable panel context for tests that need scraped AFIP info or hook activity mismatch */
const monotributoPanelMocks = vi.hoisted(() => ({
  monotributoInfo: null as MonotributoAFIPInfo | null,
  hookTipoActividad: "servicios" as "servicios" | "venta",
}));

function baseMonotributoInfo(overrides: Partial<MonotributoAFIPInfo> = {}): MonotributoAFIPInfo {
  return {
    categoria: "B",
    tipoActividad: "servicios",
    actividadDescripcion: "",
    proximaRecategorizacion: "",
    nombreCompleto: "Test User",
    cuit: "20123456789",
    ...overrides,
  };
}

const mockMonotributoStatus = {
  categoriaActual: {
    categoria: "B",
    ingresosBrutos: 11447046.44,
    superficieAfectada: "45 m²",
    energiaElectrica: "5000 Kw",
    alquileres: 563459.99,
    precioUnitarioMax: 296735.02,
    impuestoIntegrado: { servicios: 7048.18, venta: 6500 },
    aportesSIPA: 11446.99,
    aportesObraSocial: 16297.11,
    total: { servicios: 34792.28, venta: 34000 },
  },
  categoriaSiguiente: {
    categoria: "C",
    ingresosBrutos: 16050091.57,
    superficieAfectada: "60 m²",
    energiaElectrica: "6700 Kw",
    alquileres: 563459.99,
    precioUnitarioMax: 296735.02,
    impuestoIntegrado: { servicios: 12529.94, venta: 12000 },
    aportesSIPA: 12591.69,
    aportesObraSocial: 17926.82,
    total: { servicios: 43048.45, venta: 42500 },
  },
  porcentajeUtilizado: 65.5,
  margenDisponible: 3947046.44,
  ingresosAcumulados: 7500000,
  pagoMensual: 34792.28,
  tipoActividad: "servicios" as const,
};

const mockMonotributoData = {
  categorias: [
    {
      categoria: "A",
      ingresosBrutos: 7813063.45,
      superficieAfectada: "30 m²",
      energiaElectrica: "3330 Kw",
      alquileres: 563459.99,
      precioUnitarioMax: 296735.02,
      impuestoIntegrado: { servicios: 3662.02, venta: 3500 },
      aportesSIPA: 10406.36,
      aportesObraSocial: 14815.55,
      total: { servicios: 28883.93, venta: 28721.91 },
    },
    {
      categoria: "B",
      ingresosBrutos: 11447046.44,
      superficieAfectada: "45 m²",
      energiaElectrica: "5000 Kw",
      alquileres: 563459.99,
      precioUnitarioMax: 296735.02,
      impuestoIntegrado: { servicios: 7048.18, venta: 6500 },
      aportesSIPA: 11446.99,
      aportesObraSocial: 16297.11,
      total: { servicios: 34792.28, venta: 34244.1 },
    },
  ],
  fechaVigencia: "01/2025",
};

vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({
    clearInvoices: mockClearInvoices,
    monotributoInfo: monotributoPanelMocks.monotributoInfo,
  }),
}));

vi.mock("@/hooks/useMonotributo", () => ({
  useMonotributo: () => ({
    data: mockMonotributoData,
    tipoActividad: monotributoPanelMocks.hookTipoActividad,
    updateTipoActividad: mockUpdateTipoActividad,
    status: mockMonotributoStatus,
  }),
}));

describe("MonotributoPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    monotributoPanelMocks.monotributoInfo = null;
    monotributoPanelMocks.hookTipoActividad = "servicios";
  });

  it("should be defined", () => {
    expect(MonotributoPanel).toBeDefined();
  });

  it("renders the component with title", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    expect(screen.getByText("Monotributo")).toBeInTheDocument();
  });

  it("shows no data message when isCurrentYearData is false", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={false} />);
    expect(screen.getByText("Datos de Monotributo no disponibles")).toBeInTheDocument();
    expect(screen.getByText(/Los cálculos de Monotributo requieren datos de los últimos 12 meses/)).toBeInTheDocument();
  });

  it("renders activity type selector", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    expect(screen.getByText("Tipo de actividad:")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Venta de Bienes")).toBeInTheDocument();
  });

  it("displays calculated category", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    // When no monotributoInfo is scraped, it shows "Categoría según tus ingresos"
    expect(screen.getByText("Categoría según tus ingresos")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("displays progress percentage", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    expect(screen.getByText("65.5%")).toBeInTheDocument();
  });

  it("displays available margin", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    expect(screen.getByText("Margen disponible:")).toBeInTheDocument();
  });

  it("displays monthly payment", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    // When no monotributoInfo is scraped, it shows just "Pago mensual:"
    expect(screen.getByText("Pago mensual:")).toBeInTheDocument();
  });

  it("calls updateTipoActividad when activity button is clicked", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    fireEvent.click(screen.getByText("Venta de Bienes"));
    expect(mockUpdateTipoActividad).toHaveBeenCalledWith("venta");
  });

  it("renders external link to official categories", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    const link = screen.getByText("Ver categorías oficiales");
    expect(link).toHaveAttribute("href", "https://www.arca.gob.ar/monotributo/categorias.asp");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays validity date when available", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    expect(screen.getByText(/Vigente desde:/)).toBeInTheDocument();
    expect(screen.getByText(/01\/2025/)).toBeInTheDocument();
  });

  it("shows clear data button in no data message", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={false} />);
    const clearButton = screen.getByText("limpiá los datos");
    expect(clearButton).toBeInTheDocument();
  });

  it("calls clearInvoices when clear data button is clicked and confirmed", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={false} />);

    // Click "limpiá los datos" opens confirmation dialog
    fireEvent.click(screen.getByText("limpiá los datos"));

    // Verify dialog is shown
    expect(screen.getByText("¿Limpiar todos los datos?")).toBeInTheDocument();

    // Click confirm button
    fireEvent.click(screen.getByText("Sí, limpiar"));

    expect(mockClearInvoices).toHaveBeenCalled();
  });

  it("does not call clearInvoices when clear data is cancelled", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={false} />);

    // Click "limpiá los datos" opens confirmation dialog
    fireEvent.click(screen.getByText("limpiá los datos"));

    // Verify dialog is shown
    expect(screen.getByText("¿Limpiar todos los datos?")).toBeInTheDocument();

    // Click cancel button
    fireEvent.click(screen.getByText("Cancelar"));

    expect(mockClearInvoices).not.toHaveBeenCalled();
  });

  it("calls updateTipoActividad when servicios button is clicked", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    fireEvent.click(screen.getByText("Servicios"));
    expect(mockUpdateTipoActividad).toHaveBeenCalledWith("servicios");
  });

  it("displays next category info when available", () => {
    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);
    expect(screen.getByText(/Para categoría C:/)).toBeInTheDocument();
  });

  it("syncs tipoActividad from scraped monotributoInfo when hook disagrees", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ tipoActividad: "venta" });
    monotributoPanelMocks.hookTipoActividad = "servicios";

    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);

    expect(mockUpdateTipoActividad).toHaveBeenCalledWith("venta");
  });

  it("does not call updateTipoActividad when scraped activity matches hook", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ tipoActividad: "servicios" });
    monotributoPanelMocks.hookTipoActividad = "servicios";

    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);

    expect(mockUpdateTipoActividad).not.toHaveBeenCalled();
  });

  it("renders MonotributoInfoCard with Servicios label when scraped tipo is servicios", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ tipoActividad: "servicios" });

    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);

    expect(screen.getByText("Tu actividad:")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Pago mensual actual:")).toBeInTheDocument();
  });

  it("renders MonotributoInfoCard with Venta de Bienes and venta monthly payment when hook uses venta", () => {
    monotributoPanelMocks.hookTipoActividad = "venta";
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ tipoActividad: "venta" });

    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);

    expect(screen.getByText("Venta de Bienes")).toBeInTheDocument();
    expect(screen.getByText(/\$34\.244,10/)).toBeInTheDocument();
  });

  it("shows actividadDescripcion in MonotributoInfoCard when tipoActividad is null", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({
      tipoActividad: null,
      actividadDescripcion: "LOCACIONES DE SERVICIOS",
    });

    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);

    expect(screen.getByText("LOCACIONES DE SERVICIOS")).toBeInTheDocument();
  });

  it("shows No especificada when scraped activity type and description are empty", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({
      tipoActividad: null,
      actividadDescripcion: "",
    });

    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);

    expect(screen.getByText("No especificada")).toBeInTheDocument();
  });

  it("shows próxima recategorización when present on scraped info", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({
      proximaRecategorizacion: "Enero 2026",
    });

    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);

    expect(screen.getByText("Próxima recategorización:")).toBeInTheDocument();
    expect(screen.getByText("Enero 2026")).toBeInTheDocument();
  });

  it("omits pago mensual actual row when category is not in categorias list", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ categoria: "Z" });

    render(<MonotributoPanel ingresosAnuales={7500000} isCurrentYearData={true} />);

    expect(screen.getByText("Categoría actual:")).toBeInTheDocument();
    expect(screen.queryByText("Pago mensual actual:")).not.toBeInTheDocument();
  });
});
