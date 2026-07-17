import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EmissionPreview, EmissionResult, Plantilla } from "@/types/facturador";

import { EmissionModal } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

const startPreview = vi.fn();
const confirm = vi.fn();
const reset = vi.fn();
let mockState: { phase: string; preview: EmissionPreview | null; result: EmissionResult | null; error: string | null } = {
  phase: "idle", preview: null, result: null, error: null,
};
vi.mock("@/hooks/useEmission", () => ({
  useEmission: () => ({ ...mockState, startPreview, confirm, reset }),
}));
vi.mock("@/lib/crypto", () => ({ encryptCredentials: (c: string, p: string) => ({ cuit: `e:${c}`, password: `e:${p}`, encrypted: true }) }));
vi.mock("@/components/TurnstileWidget", () => ({
  TurnstileWidget: ({ onSuccess }: { onSuccess: (t: string) => void }) => (
    <button data-testid="ts-solve" onClick={() => onSuccess("TS-TOKEN")}>solve</button>
  ),
}));

const PLANTILLA: Plantilla = {
  id: "1", nombre: "X", puntoDeVenta: "3", concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "CLIENTE X SA", condicionVenta: ["6"] },
  lineas: [{ descripcion: "Serv", cantidad: 1, unidad: "7", precioUnitario: 200000 }],
};
const PREVIEW: EmissionPreview = {
  puntoVenta: "3", tipoComprobante: 11,
  emisor: { razonSocial: "GSA SA", puntoVenta: "0003", domicilio: "Corrientes 1234", concepto: "Servicios", periodoDesde: "01/06/2026", periodoHasta: "30/06/2026", vtoPago: "13/07/2026" },
  receptor: { cuit: "30-70791528-1", razonSocial: "CLIENTE X SA", domicilio: "San Martín 500", email: "c@x.com", condicionIVA: "Responsable Inscripto", condicionVenta: "Transferencia" },
  lineas: [{ codigo: "", descripcion: "Serv", cantidad: 1, unidad: "unidades", precioUnitario: 200000, porcentajeBonificacion: 0, importeBonificacion: 0, subtotal: 200000 }],
  subtotal: 200000, importeOtrosTributos: 0, importeTotal: 200000, html: "<div>RESUMEN</div>",
};
const RESULT: EmissionResult = { ...PREVIEW, numeroCompleto: "00003-00000089", cae: "75123456789012", vencimientoCae: "23/07/2026" };

const baseProps = { isOpen: true, plantilla: PLANTILLA, cuit: "20354104076", companyIndex: 2, margenDisponible: 2540000, onClose: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  mockState = { phase: "idle", preview: null, result: null, error: null };
});

describe("EmissionModal", () => {
  it("no renderiza si isOpen es false", () => {
    const { container } = render(<EmissionModal {...baseProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("fase clave: muestra CUIT readonly y pide clave", () => {
    render(<EmissionModal {...baseProps} />);
    expect(screen.getByText(/reingresá tu clave/i)).toBeInTheDocument();
    expect(screen.getByText(/20354104076/)).toBeInTheDocument();
  });
  it("genera preview con creds encriptadas + token + companyIndex", () => {
    render(<EmissionModal {...baseProps} />);
    fireEvent.change(screen.getByTestId("clave-input"), { target: { value: "mi-clave" } });
    fireEvent.click(screen.getByTestId("ts-solve"));
    fireEvent.click(screen.getByRole("button", { name: /generar preview/i }));
    expect(startPreview).toHaveBeenCalledTimes(1);
    const [targetArg, creds] = startPreview.mock.calls[0];
    expect(targetArg).toEqual({ kind: "facturaC", plantilla: PLANTILLA });
    expect(creds).toMatchObject({ cuit: "e:20354104076", password: "e:mi-clave", encrypted: true, turnstileToken: "TS-TOKEN", companyIndex: 2 });
  });
  it("fase preview: muestra emisor, receptor, líneas, total y alerta de tope", () => {
    mockState = { phase: "preview", preview: PREVIEW, result: null, error: null };
    render(<EmissionModal {...baseProps} />);
    expect(screen.getByText("GSA SA")).toBeInTheDocument();
    expect(screen.getByText("CLIENTE X SA")).toBeInTheDocument();
    expect(screen.getByTestId("modal-total")).toHaveTextContent("200.000,00");
    expect(screen.getByTestId("tope-alert")).toHaveTextContent(/2\.340\.000/);
  });
  it("botón Emitir deshabilitado hasta checkbox + tipear EMITIR", () => {
    mockState = { phase: "preview", preview: PREVIEW, result: null, error: null };
    render(<EmissionModal {...baseProps} />);
    fireEvent.click(screen.getByTestId("ts-solve"));
    const btn = screen.getByRole("button", { name: /emitir factura/i });
    expect(btn).toBeDisabled();
    fireEvent.click(screen.getByTestId("confirm-check"));
    expect(btn).toBeDisabled();
    fireEvent.change(screen.getByTestId("confirm-typed"), { target: { value: "EMITIR" } });
    expect(btn).toBeEnabled();
  });
  it("confirmar llama confirm con la plantilla y creds", () => {
    mockState = { phase: "preview", preview: PREVIEW, result: null, error: null };
    render(<EmissionModal {...baseProps} />);
    fireEvent.click(screen.getByTestId("ts-solve"));
    fireEvent.click(screen.getByTestId("confirm-check"));
    fireEvent.change(screen.getByTestId("confirm-typed"), { target: { value: "emitir" } });
    fireEvent.click(screen.getByRole("button", { name: /emitir factura/i }));
    expect(confirm).toHaveBeenCalledWith(
      { kind: "facturaC", plantilla: PLANTILLA },
      expect.objectContaining({ turnstileToken: "TS-TOKEN", companyIndex: 2 }),
    );
  });
  it("fase done: muestra número y CAE", () => {
    mockState = { phase: "done", preview: PREVIEW, result: RESULT, error: null };
    render(<EmissionModal {...baseProps} />);
    expect(screen.getByText("00003-00000089")).toBeInTheDocument();
    expect(screen.getByText(/75123456789012/)).toBeInTheDocument();
  });
  it("fase error muestra el mensaje y aviso anti-duplicado", () => {
    mockState = { phase: "error", preview: PREVIEW, result: null, error: "Falló la confirmación" };
    render(<EmissionModal {...baseProps} />);
    expect(screen.getByText("Falló la confirmación")).toBeInTheDocument();
    expect(screen.getByText(/mis comprobantes/i)).toBeInTheDocument();
  });
  it("alerta de tope 'exceeds' cuando el total supera el margen", () => {
    mockState = { phase: "preview", preview: PREVIEW, result: null, error: null };
    render(<EmissionModal {...baseProps} margenDisponible={100000} />);
    expect(screen.getByTestId("tope-alert")).toHaveTextContent(/supera/i);
  });
});
