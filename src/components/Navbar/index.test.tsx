import { beforeEach,describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { Navbar } from "./index";

import { fireEvent,render, screen } from "@testing-library/react";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: (e: React.MouseEvent) => void }) => (
    <a href={href} onClick={onClick}>{children}</a>
  ),
}));

// Mock next/navigation
let mockPathname = "/";
const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn(), back: vi.fn() }),
}));

// Keep the `mockInvoices` array as the source of truth for what the Navbar
// should consider "has data" — useHasStoredInvoices is mocked to derive its
// boolean from this same fixture so existing tests keep their shape.
let mockInvoices: AFIPInvoice[] = [];

vi.mock("@/hooks/useHasStoredInvoices", () => ({
  useHasStoredInvoices: () => mockInvoices.length > 0,
}));

// Mock useTheme
const mockToggleTheme = vi.fn();
let mockTheme = "light";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
    mounted: true,
  }),
}));

// Mock TourContext
const mockStartTour = vi.fn();
vi.mock("@/contexts/TourContext", () => ({
  useTourContext: () => ({
    startTour: mockStartTour,
    registerTour: vi.fn(),
  }),
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoices = [];
    mockTheme = "light";
    mockPathname = "/panel";
  });

  it("should be defined", () => {
    expect(Navbar).toBeDefined();
  });

  it("renders the logo", () => {
    render(<Navbar />);
    expect(screen.getByAltText("GARCA Logo")).toBeInTheDocument();
  });

  it("renders the brand name", () => {
    render(<Navbar />);
    expect(screen.getByText("GARCA")).toBeInTheDocument();
  });

  it("renders the tagline on desktop", () => {
    render(<Navbar />);
    expect(screen.getByText("Gestor de Recuperación de Comprobantes de ARCA")).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(<Navbar />);
    expect(screen.getByTitle("Cambiar a modo oscuro")).toBeInTheDocument();
  });

  it("calls toggleTheme when theme button is clicked", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByTitle("Cambiar a modo oscuro"));
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it("shows sun icon in dark mode", () => {
    mockTheme = "dark";
    render(<Navbar />);
    expect(screen.getByTitle("Cambiar a modo claro")).toBeInTheDocument();
  });

  it("does not show navigation links when no invoices", () => {
    render(<Navbar />);
    expect(screen.queryByText("Monotributo")).not.toBeInTheDocument();
    expect(screen.queryByText("Gráficos")).not.toBeInTheDocument();
    expect(screen.queryByText("Totales")).not.toBeInTheDocument();
    expect(screen.queryByText("Facturas")).not.toBeInTheDocument();
  });

  it("shows navigation links when invoices exist", () => {
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

    render(<Navbar />);
    // Desktop navigation links
    expect(screen.getByText("Monotributo")).toBeInTheDocument();
    expect(screen.getByText("Gráficos")).toBeInTheDocument();
    expect(screen.getByText("Totales")).toBeInTheDocument();
    expect(screen.getByText("Facturas")).toBeInTheDocument();
  });

  it("shows clear data button when invoices exist", () => {
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

    render(<Navbar />);
    expect(screen.getByText("Limpiar Datos")).toBeInTheDocument();
  });

  it("does not show clear data button when no invoices", () => {
    render(<Navbar />);
    expect(screen.queryByText("Limpiar Datos")).not.toBeInTheDocument();
  });

  it("clears localStorage and redirects home when clear button is confirmed", () => {
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

    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");

    render(<Navbar />);

    fireEvent.click(screen.getByText("Limpiar Datos"));
    expect(screen.getByText("¿Limpiar todos los datos?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Sí, limpiar"));

    expect(removeItemSpy).toHaveBeenCalledWith("garca_invoices");
    expect(removeItemSpy).toHaveBeenCalledWith("garca_company");
    expect(removeItemSpy).toHaveBeenCalledWith("garca_monotributo");
    expect(removeItemSpy).toHaveBeenCalledWith("garca_invoices_ts");
    expect(removeItemSpy).toHaveBeenCalledWith("garca_manual_fx_rates");
    expect(mockRouterPush).toHaveBeenCalledWith("/");

    removeItemSpy.mockRestore();
  });

  it("opens mobile menu when hamburger is clicked", () => {
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

    render(<Navbar />);

    // Find and click hamburger button
    const hamburgerButton = screen.getByRole("button", { name: /menú/i });
    fireEvent.click(hamburgerButton);

    // Mobile menu should show navigation links
    const mobileLinks = screen.getAllByText("Monotributo");
    expect(mobileLinks.length).toBeGreaterThan(1); // Desktop + mobile
  });

  it("logo links to home page", () => {
    render(<Navbar />);
    const logoLink = screen.getAllByRole("link")[0];
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("closes mobile menu when a navigation link is clicked", () => {
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

    render(<Navbar />);

    // Open mobile menu
    const hamburgerButton = screen.getByRole("button", { name: /menú/i });
    fireEvent.click(hamburgerButton);

    // Mobile menu should be visible
    const mobileLinks = screen.getAllByText("Monotributo");
    expect(mobileLinks.length).toBeGreaterThan(1);

    // Click a mobile navigation link (second occurrence is mobile)
    fireEvent.click(mobileLinks[1]);

    // Menu should close - hamburger should be back to "Menú" state
    expect(screen.getByRole("button", { name: /menú/i })).toBeInTheDocument();
  });

  it("closes confirmation dialog when cancel is clicked", () => {
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

    render(<Navbar />);

    // Click "Limpiar Datos" opens confirmation dialog
    fireEvent.click(screen.getByText("Limpiar Datos"));

    // Verify dialog is shown
    expect(screen.getByText("¿Limpiar todos los datos?")).toBeInTheDocument();

    // Click cancel button
    fireEvent.click(screen.getByText("Cancelar"));

    // Dialog should close
    expect(screen.queryByText("¿Limpiar todos los datos?")).not.toBeInTheDocument();

    // Redirect should NOT have been triggered
    expect(mockRouterPush).not.toHaveBeenCalledWith("/");
  });

  it("shows Ingresar link when no invoices", () => {
    render(<Navbar />);
    const links = screen.getAllByText("Ingresar");
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("hides Ingresar link when invoices exist", () => {
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

    render(<Navbar />);
    expect(screen.queryByText("Ingresar")).not.toBeInTheDocument();
  });

  it("toggles mobile menu open and closed", () => {
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

    render(<Navbar />);

    const hamburgerButton = screen.getByRole("button", { name: /menú/i });

    // Open menu
    fireEvent.click(hamburgerButton);
    let mobileLinks = screen.getAllByText("Monotributo");
    expect(mobileLinks.length).toBeGreaterThan(1);

    // Close menu
    fireEvent.click(hamburgerButton);
    // After closing, we should only have the desktop link
    mobileLinks = screen.getAllByText("Monotributo");
    expect(mobileLinks.length).toBe(1);
  });

  it("logo always links to home page", () => {
    mockPathname = "/panel";
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

    render(<Navbar />);

    const logoLink = screen.getAllByRole("link")[0];
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("scrolls to section when desktop nav button is clicked", async () => {
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

    // Create a mock element with getBoundingClientRect
    const mockElement = document.createElement("div");
    mockElement.id = "monotributo";
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ top: 500 });
    document.body.appendChild(mockElement);

    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    vi.stubGlobal("pageYOffset", 0);

    render(<Navbar />);

    // Click desktop nav button
    const monotributoButton = screen.getByText("Monotributo");
    fireEvent.click(monotributoButton);

    // Wait for setTimeout
    await vi.waitFor(() => {
      expect(scrollToMock).toHaveBeenCalled();
    }, { timeout: 200 });

    document.body.removeChild(mockElement);
    vi.unstubAllGlobals();
  });

  it("opens mobile clear data dialog from mobile menu", () => {
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

    render(<Navbar />);

    // Open mobile menu
    const hamburgerButton = screen.getByRole("button", { name: /menú/i });
    fireEvent.click(hamburgerButton);

    // Find mobile clear data button (second occurrence)
    const clearButtons = screen.getAllByText("Limpiar Datos");
    fireEvent.click(clearButtons[1]); // Mobile button

    // Dialog should open
    expect(screen.getByText("¿Limpiar todos los datos?")).toBeInTheDocument();
  });

  it("invokes scrollTo for each desktop navigation target", async () => {
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

    const sectionIds = ["monotributo", "graficos", "totales", "proyectar", "facturas"] as const;
    const elements: HTMLElement[] = [];
    for (const id of sectionIds) {
      const el = document.createElement("div");
      el.id = id;
      el.getBoundingClientRect = vi.fn().mockReturnValue({ top: 100 });
      document.body.appendChild(el);
      elements.push(el);
    }

    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    vi.stubGlobal("pageYOffset", 0);

    render(<Navbar />);

    const desktopLabels = ["Monotributo", "Gráficos", "Totales", "Proyectar", "Facturas"] as const;
    for (const label of desktopLabels) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${label}$`, "i") }));
      await vi.waitFor(
        () => {
          expect(scrollToMock).toHaveBeenCalled();
        },
        { timeout: 300 }
      );
      scrollToMock.mockClear();
    }

    for (const el of elements) {
      document.body.removeChild(el);
    }
    vi.unstubAllGlobals();
  });

  it("invokes scrollTo for each mobile navigation target", async () => {
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

    const sectionIds = ["monotributo", "graficos", "totales", "proyectar", "facturas"] as const;
    const elements: HTMLElement[] = [];
    for (const id of sectionIds) {
      const el = document.createElement("div");
      el.id = id;
      el.getBoundingClientRect = vi.fn().mockReturnValue({ top: 100 });
      document.body.appendChild(el);
      elements.push(el);
    }

    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    vi.stubGlobal("pageYOffset", 0);

    render(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: /menú/i }));

    const mobileLabels = ["Monotributo", "Gráficos", "Totales", "Proyectar", "Facturas"] as const;
    for (const label of mobileLabels) {
      const matches = screen.getAllByText(label);
      const mobileButton = matches[matches.length - 1].closest("button");
      expect(mobileButton).not.toBeNull();
      fireEvent.click(mobileButton as HTMLElement);
      await vi.waitFor(
        () => {
          expect(scrollToMock).toHaveBeenCalled();
        },
        { timeout: 300 }
      );
      scrollToMock.mockClear();
      fireEvent.click(screen.getByRole("button", { name: /menú/i }));
    }

    for (const el of elements) {
      document.body.removeChild(el);
    }
    vi.unstubAllGlobals();
  });
});
