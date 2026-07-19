import { beforeEach,describe, expect, it, vi } from "vitest";

import FacturarPage from "./page";

import { fireEvent, render, screen } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

let ctx: any;
vi.mock("@/contexts/InvoiceContext", () => ({ useInvoiceContext: () => ctx }));
vi.mock("@/hooks/useTemplates", () => ({ useTemplates: () => ({ templates: [], save: vi.fn(), remove: vi.fn() }) }));
vi.mock("@/hooks/useMonotributo", () => ({ useMonotributo: () => ({ status: { margenDisponible: 1000000 } }) }));
vi.mock("@/components/facturador/EmissionForm", () => ({ EmissionForm: ({ onPreview }: any) => <button onClick={() => onPreview({ id: "x" })}>form-preview</button> }));
vi.mock("@/components/facturador/EmissionModal", () => ({ EmissionModal: ({ isOpen }: any) => (isOpen ? <div>modal-abierto</div> : null) }));
vi.mock("@/components/facturador/EmittedTab", () => ({ EmittedTab: () => <div>emitidas-tab</div> }));

beforeEach(() => {
  vi.clearAllMocks();
  ctx = { state: { isHydrated: true, company: { cuit: "20301234563", razonSocial: "GSA SA", index: 2 }, invoices: [] }, manualExchangeRates: {} };
});

describe("FacturarPage", () => {
  it("muestra el banner con la empresa de la sesión", () => {
    render(<FacturarPage />);
    expect(screen.getByText(/GSA SA/)).toBeInTheDocument();
  });
  it("sin empresa (hidratado) muestra CTA de login", () => {
    ctx.state.company = null;
    render(<FacturarPage />);
    expect(screen.getByText(/iniciá sesión/i)).toBeInTheDocument();
  });
  it("abre el modal al previsualizar desde el form", () => {
    render(<FacturarPage />);
    fireEvent.click(screen.getByText("form-preview"));
    expect(screen.getByText("modal-abierto")).toBeInTheDocument();
  });
  it("cambia al tab Emitidas", () => {
    render(<FacturarPage />);
    fireEvent.click(screen.getByRole("button", { name: /emitidas/i }));
    expect(screen.getByText("emitidas-tab")).toBeInTheDocument();
  });
  it("avisa cuando hay comprobantes en moneda extranjera sin cotización", () => {
    // Un mes atrás: siempre cae dentro de la ventana de recategorización (12 meses previos).
    const lastMonth = new Date();
    lastMonth.setDate(1);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const fecha = `15/${String(lastMonth.getMonth() + 1).padStart(2, "0")}/${lastMonth.getFullYear()}`;
    ctx.state.invoices = [
      { fecha, tipo: "FACTURA C", moneda: "USD", importeTotal: 100 },
    ];
    render(<FacturarPage />);
    expect(screen.getByText(/moneda extranjera sin cotización/i)).toBeInTheDocument();
  });
  it("no avisa cuando no hay comprobantes sin cotización", () => {
    render(<FacturarPage />);
    expect(screen.queryByText(/moneda extranjera sin cotización/i)).not.toBeInTheDocument();
  });
});
