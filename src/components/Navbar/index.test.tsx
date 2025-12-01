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

// Mock invoice context
const mockClearInvoices = vi.fn();
let mockInvoices: AFIPInvoice[] = [];

vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({
    state: {
      invoices: mockInvoices,
      isLoading: false,
      error: null,
      errorCode: null,
      company: null,
    },
    clearInvoices: mockClearInvoices,
  }),
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

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoices = [];
    mockTheme = "light";
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

  it("calls clearInvoices when clear button is clicked", () => {
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
    
    // Click confirm button
    fireEvent.click(screen.getByText("Sí, limpiar"));
    
    expect(mockClearInvoices).toHaveBeenCalled();
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

    // clearInvoices should NOT have been called
    expect(mockClearInvoices).not.toHaveBeenCalled();
  });

  it("shows Ingresar link when no invoices", () => {
    render(<Navbar />);
    expect(screen.getByText("Ingresar")).toBeInTheDocument();
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

  it("scrolls to top when logo is clicked with invoices loaded", () => {
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

    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);

    render(<Navbar />);

    const logoLink = screen.getAllByRole("link")[0];
    fireEvent.click(logoLink);

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });

    vi.unstubAllGlobals();
  });

  it("navigates normally when logo is clicked without invoices", () => {
    mockInvoices = [];

    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);

    render(<Navbar />);

    const logoLink = screen.getAllByRole("link")[0];
    fireEvent.click(logoLink);

    // Should NOT scroll - should navigate instead
    expect(scrollToMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
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
});
