import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonotributoAFIPInfo } from "@/types/afip-scraper";
import type { CategoriaMonotributo, VentanaRecategorizacion } from "@/types/monotributo";

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

function categoria(letra: string, ingresosBrutos: number, total = { servicios: 34792.28, venta: 34244.1 }): CategoriaMonotributo {
  return {
    categoria: letra,
    ingresosBrutos,
    superficieAfectada: "45 m²",
    energiaElectrica: "5000 Kw",
    alquileres: 563459.99,
    precioUnitarioMax: 296735.02,
    impuestoIntegrado: { servicios: 7048.18, venta: 6500 },
    aportesSIPA: 11446.99,
    aportesObraSocial: 16297.11,
    total,
  };
}

const CAT_A = categoria("A", 7813063.45, { servicios: 28883.93, venta: 28721.91 });
const CAT_B = categoria("B", 11447046.44);
const CAT_D = categoria("D", 30628651.43, { servicios: 84612.93, venta: 80000 });
const CAT_G = categoria("G", 53995798.87, { servicios: 250000, venta: 240000 });
const CAT_H = categoria("H", 81924660.37, { servicios: 400000, venta: 390000 });

const mockMonotributoData = {
  categorias: [CAT_A, CAT_B, CAT_D, CAT_G, CAT_H],
  fechaVigencia: "01/2025",
};

function ventana(overrides: Partial<VentanaRecategorizacion> = {}): VentanaRecategorizacion {
  return {
    label: "Enero 2027",
    desde: "2026-01",
    hasta: "2026-12",
    ingresos: 7500000,
    mesesCerrados: 12,
    totalMeses: 12,
    completa: true,
    ingresosAnualizados: 7500000,
    tieneDatos: true,
    ...overrides,
  };
}

/** Ventana cerrada Jul 2025 - Jun 2026 */
const VENTANA_VIGENTE = ventana({ label: "Julio 2026", desde: "2025-07", hasta: "2026-06" });

/** Ventana en curso Ene - Dic 2026 con 7 de 12 meses facturados */
const VENTANA_PARCIAL = ventana({
  ingresos: 14_000_000,
  mesesCerrados: 7,
  completa: false,
  ingresosAnualizados: 24_000_000,
});

function renderPanel(props: Partial<React.ComponentProps<typeof MonotributoPanel>> = {}) {
  return render(
    <MonotributoPanel
      ventanaVigente={VENTANA_VIGENTE}
      ventanaProxima={ventana()}
      categoriaVigente={CAT_B}
      isCurrentYearData={true}
      {...props}
    />
  );
}

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
    status: null,
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
    renderPanel();
    expect(screen.getByText("Monotributo")).toBeInTheDocument();
  });

  it("shows no data message when isCurrentYearData is false", () => {
    renderPanel({ isCurrentYearData: false });
    expect(screen.getByText("Datos de Monotributo no disponibles")).toBeInTheDocument();
    expect(screen.getByText(/Los cálculos de Monotributo requieren datos de los últimos 12 meses/)).toBeInTheDocument();
  });

  it("renders activity type selector", () => {
    renderPanel();
    expect(screen.getByText("Tipo de actividad:")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Venta de Bienes")).toBeInTheDocument();
  });

  it("shows the closed window that defines the current category in the header", () => {
    renderPanel();
    expect(screen.getByText(/Categoría vigente según Jul 2025 a Jun 2026/)).toBeInTheDocument();
    expect(screen.getByText(/próxima recategorización Enero 2027/)).toBeInTheDocument();
  });

  it("displays the current category and the estimate for the next recategorization", () => {
    renderPanel();
    expect(screen.getByText("CATEGORÍA ACTUAL")).toBeInTheDocument();
    expect(screen.getByText("ESTIMADA ENERO 2027")).toBeInTheDocument();
  });

  it("displays progress toward the current category cap", () => {
    renderPanel({ ventanaProxima: ventana({ ingresos: 7500000 }), categoriaVigente: CAT_B });
    // 7.500.000 / 11.447.046,44 = 65,5%
    expect(screen.getByText("Progreso hacia el tope de B")).toBeInTheDocument();
    expect(screen.getByText("65.5%")).toBeInTheDocument();
  });

  it("displays available margin", () => {
    renderPanel();
    expect(screen.getByText(/Podés facturar hasta sin pasar de/)).toBeInTheDocument();
  });

  it("displays the monthly payment for the current category", () => {
    renderPanel();
    expect(screen.getByText("Pago mensual actual (B):")).toBeInTheDocument();
  });

  it("calls updateTipoActividad when activity button is clicked", () => {
    renderPanel();
    fireEvent.click(screen.getByText("Venta de Bienes"));
    expect(mockUpdateTipoActividad).toHaveBeenCalledWith("venta");
  });

  it("renders external link to official categories", () => {
    renderPanel();
    const link = screen.getByText("Ver categorías oficiales");
    expect(link).toHaveAttribute("href", "https://www.arca.gob.ar/monotributo/categorias.asp");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays validity date when available", () => {
    renderPanel();
    expect(screen.getByText(/Vigente desde:/)).toBeInTheDocument();
    expect(screen.getByText(/01\/2025/)).toBeInTheDocument();
  });

  it("shows clear data button in no data message", () => {
    renderPanel({ isCurrentYearData: false });
    expect(screen.getByText("limpiá los datos")).toBeInTheDocument();
  });

  it("calls clearInvoices when clear data button is clicked and confirmed", () => {
    renderPanel({ isCurrentYearData: false });

    fireEvent.click(screen.getByText("limpiá los datos"));
    expect(screen.getByText("¿Limpiar todos los datos?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Sí, limpiar"));

    expect(mockClearInvoices).toHaveBeenCalled();
  });

  it("does not call clearInvoices when clear data is cancelled", () => {
    renderPanel({ isCurrentYearData: false });

    fireEvent.click(screen.getByText("limpiá los datos"));
    expect(screen.getByText("¿Limpiar todos los datos?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancelar"));

    expect(mockClearInvoices).not.toHaveBeenCalled();
  });

  it("calls updateTipoActividad when servicios button is clicked", () => {
    renderPanel();
    fireEvent.click(screen.getByText("Servicios"));
    expect(mockUpdateTipoActividad).toHaveBeenCalledWith("servicios");
  });

  describe("partial recategorization window", () => {
    it("does not offer a downgrade while the window is still open (regression: H shown as D)", () => {
      renderPanel({ ventanaProxima: VENTANA_PARCIAL, categoriaVigente: CAT_H });

      // La categoría vigente manda: nunca la del acumulado parcial (D).
      expect(screen.getByText("H")).toBeInTheDocument();
      expect(screen.queryByText(/podés recategorizarte y pagar menos/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Esperá el cierre antes de bajar de categoría/)).toBeInTheDocument();
      expect(screen.getByText(/faltan 5 meses de la ventana/)).toBeInTheDocument();
    });

    it("labels the accumulated total as partial and shows the annualized projection", () => {
      renderPanel({ ventanaProxima: VENTANA_PARCIAL, categoriaVigente: CAT_H });

      expect(screen.getByText("Facturado en la ventana (7/12 meses):")).toBeInTheDocument();
      expect(screen.getByText("Proyectado a 12 meses:")).toBeInTheDocument();
      expect(screen.getByText("$24.000.000")).toBeInTheDocument();
      expect(
        screen.getByText(/Estimación con 7 de 12 meses de la ventana, proyectados a 12 meses/)
      ).toBeInTheDocument();
    });

    it("measures progress against the current category cap, not the partial one", () => {
      renderPanel({ ventanaProxima: VENTANA_PARCIAL, categoriaVigente: CAT_H });

      // 14.000.000 / 81.924.660,37 = 17,1% contra el tope de H. El bug medía
      // contra el tope de la categoría del parcial (B): 14M/11,4M = 122,3%.
      expect(screen.getByText("Progreso hacia el tope de H")).toBeInTheDocument();
      expect(screen.getByText("17.1%")).toBeInTheDocument();
      expect(screen.queryByText("122.3%")).not.toBeInTheDocument();
    });

    it("confirms the upgrade when the partial window already exceeds the cap", () => {
      renderPanel({
        ventanaProxima: ventana({ ingresos: 60_000_000, mesesCerrados: 7, completa: false, ingresosAnualizados: 102_857_142 }),
        categoriaVigente: CAT_G,
      });

      expect(screen.getByText(/Ya superaste el tope de G/)).toBeInTheDocument();
      expect(screen.getByText(/te recategorizás a H en Enero 2027/)).toBeInTheDocument();
    });

    it("has no estimate when the window has no closed months", () => {
      renderPanel({
        ventanaProxima: ventana({ ingresos: 0, mesesCerrados: 0, completa: false, ingresosAnualizados: null }),
        categoriaVigente: CAT_H,
      });

      expect(screen.getByText("—")).toBeInTheDocument();
      expect(screen.getByText(/recién arrancó/)).toBeInTheDocument();
    });
  });

  it("confirms a downgrade once the window has closed", () => {
    renderPanel({
      ventanaProxima: ventana({ ingresos: 7_500_000, completa: true, ingresosAnualizados: 7_500_000 }),
      categoriaVigente: CAT_H,
    });

    expect(screen.getByText(/La ventana cerró en A: podés recategorizarte y pagar menos/)).toBeInTheDocument();
  });

  it("warns when the estimate exceeds the Monotributo ceiling", () => {
    renderPanel({
      ventanaProxima: ventana({ ingresos: 90_000_000, completa: true, ingresosAnualizados: 90_000_000 }),
      categoriaVigente: CAT_H,
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/supera el tope del Monotributo/);
  });

  it("explains when the current category cannot be resolved", () => {
    renderPanel({ categoriaVigente: null });

    expect(screen.getByText("Categoría vigente no disponible")).toBeInTheDocument();
    expect(screen.queryByText("CATEGORÍA ACTUAL")).not.toBeInTheDocument();
  });

  it("syncs tipoActividad from scraped monotributoInfo when hook disagrees", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ tipoActividad: "venta" });
    monotributoPanelMocks.hookTipoActividad = "servicios";

    renderPanel();

    expect(mockUpdateTipoActividad).toHaveBeenCalledWith("venta");
  });

  it("does not call updateTipoActividad when scraped activity matches hook", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ tipoActividad: "servicios" });
    monotributoPanelMocks.hookTipoActividad = "servicios";

    renderPanel();

    expect(mockUpdateTipoActividad).not.toHaveBeenCalled();
  });

  it("credits ARCA in the header when the category comes from the scrape", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo();

    renderPanel();

    expect(screen.getByText(/Categoría vigente informada por ARCA/)).toBeInTheDocument();
  });

  it("renders MonotributoInfoCard with Servicios label when scraped tipo is servicios", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ tipoActividad: "servicios" });

    renderPanel();

    expect(screen.getByText("Tu actividad:")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Pago mensual actual:")).toBeInTheDocument();
  });

  it("renders MonotributoInfoCard with Venta de Bienes and venta monthly payment when hook uses venta", () => {
    monotributoPanelMocks.hookTipoActividad = "venta";
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ tipoActividad: "venta" });

    renderPanel();

    expect(screen.getByText("Venta de Bienes")).toBeInTheDocument();
    expect(screen.getAllByText(/\$34\.244,10/).length).toBeGreaterThan(0);
  });

  it("shows actividadDescripcion in MonotributoInfoCard when tipoActividad is null", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({
      tipoActividad: null,
      actividadDescripcion: "LOCACIONES DE SERVICIOS",
    });

    renderPanel();

    expect(screen.getByText("LOCACIONES DE SERVICIOS")).toBeInTheDocument();
  });

  it("shows No especificada when scraped activity type and description are empty", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({
      tipoActividad: null,
      actividadDescripcion: "",
    });

    renderPanel();

    expect(screen.getByText("No especificada")).toBeInTheDocument();
  });

  it("shows próxima recategorización when present on scraped info", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({
      proximaRecategorizacion: "Enero 2026",
    });

    renderPanel();

    expect(screen.getByText("Próxima recategorización:")).toBeInTheDocument();
    expect(screen.getByText("Enero 2026")).toBeInTheDocument();
  });

  it("omits pago mensual actual row when category is not in categorias list", () => {
    monotributoPanelMocks.monotributoInfo = baseMonotributoInfo({ categoria: "Z" });

    renderPanel();

    expect(screen.getByText("Categoría actual:")).toBeInTheDocument();
    expect(screen.queryByText("Pago mensual actual:")).not.toBeInTheDocument();
  });
});
