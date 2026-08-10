import { beforeEach, describe, expect, it, vi } from "vitest";

import PanelPage from "./page";

import { fireEvent, render, screen } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const mockClearInvoices = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ctx: any;
vi.mock("@/contexts/InvoiceContext", () => ({ useInvoiceContext: () => ctx }));
vi.mock("@/contexts/TourContext", () => ({ useTourContext: () => ({ registerTour: vi.fn() }) }));
vi.mock("@/hooks/useTour", () => ({ useTour: () => ({ startTour: vi.fn() }) }));
vi.mock("@/hooks/useMonotributo", () => ({
  useMonotributo: () => ({ data: { categorias: [] }, tipoActividad: "servicios" }),
}));

// Paneles pesados: irrelevantes para lo que se prueba acá (el aviso de última
// sincronización y los banners de período vacío).
vi.mock("@/components/ChartsPanel", () => ({ ChartsPanel: () => <div /> }));
vi.mock("@/components/CompanyHeader", () => ({ CompanyHeader: () => <div /> }));
vi.mock("@/components/InvoiceTable", () => ({ InvoiceTable: () => <div /> }));
vi.mock("@/components/MonotributoPanel", () => ({ MonotributoPanel: () => <div /> }));
vi.mock("@/components/ProjectionPanel", () => ({ ProjectionPanel: () => <div /> }));
vi.mock("@/components/SummaryPanel", () => ({ SummaryPanel: () => <div /> }));
vi.mock("@/components/ui/SupportBanner", () => ({ SupportBanner: () => <div /> }));
vi.mock("@/components/RefreshInvoicesModal", () => ({
  RefreshInvoicesModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>refresh-modal-abierto</div> : null,
}));

const INVOICE = {
  fecha: "15/11/2025",
  tipo: "Factura C",
  moneda: "ARS",
  importeTotal: 100000,
};

beforeEach(() => {
  vi.clearAllMocks();
  ctx = {
    state: {
      isHydrated: true,
      isLoading: false,
      hasQueried: true,
      invoices: [INVOICE],
      company: { cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 0 },
      lastSyncedAt: new Date(2026, 7, 10).getTime(),
    },
    monotributoInfo: { categoria: "B" },
    manualExchangeRates: {},
    setManualExchangeRate: vi.fn(),
    clearInvoices: mockClearInvoices,
  };
});

describe("PanelPage", () => {
  it("ofrece Actualizar con una empresa guardada", () => {
    render(<PanelPage />);
    expect(screen.getByRole("button", { name: /Actualizar/ })).toBeInTheDocument();
  });

  it("abre el modal de actualizar al tocar Actualizar", () => {
    render(<PanelPage />);
    fireEvent.click(screen.getByRole("button", { name: /Actualizar/ }));
    expect(screen.getByText("refresh-modal-abierto")).toBeInTheDocument();
  });

  it("sin empresa guardada no ofrece Actualizar", () => {
    // `hasQueried: true` + `company: null` es alcanzable (extractCompanyInfo
    // devuelve null con lista vacía o con un cuitEmisor que no es de 11
    // dígitos) y sin TTL es permanente. El modal no tendría de dónde sacar el
    // CUIT ni el índice: su submit sería un no-op silencioso.
    ctx.state.company = null;
    render(<PanelPage />);
    expect(screen.queryByRole("button", { name: /Actualizar/ })).not.toBeInTheDocument();
  });

  it("no ofrece Actualizar en la demo", () => {
    ctx.state.company = { cuit: "20345678901", razonSocial: "Mi Empresa SA (Demo)", index: 0 };
    render(<PanelPage />);
    expect(screen.queryByRole("button", { name: /Actualizar/ })).not.toBeInTheDocument();
  });

  it("consultar otro período abre el modal en vez de borrar la sesión", () => {
    ctx.state.invoices = [];
    render(<PanelPage />);

    fireEvent.click(screen.getByRole("button", { name: /consultar otro período/ }));

    expect(screen.getByText("refresh-modal-abierto")).toBeInTheDocument();
    // El camino viejo (clearInvoices + /ingresar) además tiraba
    // garca_manual_fx_rates y garca_monotributo, que el refresh conserva.
    expect(mockClearInvoices).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalledWith("/ingresar");
  });

  it("sin datos de Monotributo también abre el modal en vez de borrar la sesión", () => {
    ctx.state.invoices = [];
    ctx.monotributoInfo = null;
    render(<PanelPage />);

    fireEvent.click(screen.getByRole("button", { name: /consultá otro período/ }));

    expect(screen.getByText("refresh-modal-abierto")).toBeInTheDocument();
    expect(mockClearInvoices).not.toHaveBeenCalled();
  });

  it("sin empresa guardada, consultar otro período vuelve al login", () => {
    // Único camino posible en ese estado: el modal no puede re-consultar.
    ctx.state.invoices = [];
    ctx.state.company = null;
    render(<PanelPage />);

    fireEvent.click(screen.getByRole("button", { name: /consultar otro período/ }));

    expect(mockClearInvoices).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/ingresar");
  });
});
