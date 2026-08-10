import { beforeEach, describe, expect, it, vi } from "vitest";

import { RefreshInvoicesModal } from "./index";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockFetchInvoices = vi.fn().mockResolvedValue(true);
const mockCancelOperation = vi.fn();
const mockClearError = vi.fn();
type Company = { cuit: string; razonSocial: string; index: number } | null;
const mockState = {
  company: {
    cuit: "20345678901",
    razonSocial: "Mi Empresa SA",
    index: 3,
  } as Company,
  isLoading: false,
  error: null as string | null,
  errorCode: null as string | null,
  progress: null,
};

vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({
    state: mockState,
    fetchInvoicesWithCompany: mockFetchInvoices,
    cancelOperation: mockCancelOperation,
    clearError: mockClearError,
  }),
}));

vi.mock("@/components/TurnstileWidget", () => ({
  TurnstileWidget: ({ onSuccess }: { onSuccess: (t: string) => void }) => (
    <button type="button" onClick={() => onSuccess("tok")}>armar-turnstile</button>
  ),
}));

describe("RefreshInvoicesModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.isLoading = false;
    mockState.error = null;
    mockState.company = { cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 3 };
  });

  it("deja el submit deshabilitado sin password", () => {
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("armar-turnstile"));
    expect(screen.getByRole("button", { name: /Traer comprobantes/ })).toBeDisabled();
  });

  it("deja el submit deshabilitado sin token de Turnstile", () => {
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    expect(screen.getByRole("button", { name: /Traer comprobantes/ })).toBeDisabled();
  });

  it("llama al fetch con el cuit y el index de la empresa guardada y replaceLocal", () => {
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    fireEvent.click(screen.getByText("armar-turnstile"));
    fireEvent.click(screen.getByRole("button", { name: /Traer comprobantes/ }));

    expect(mockFetchInvoices).toHaveBeenCalledWith(
      "20345678901",
      "secreta",
      3,
      expect.objectContaining({ from: expect.any(String), to: expect.any(String) }),
      "EMISOR",
      "tok",
      true,
    );
  });

  it("muestra el error del fetch sin cerrarse", async () => {
    const onClose = vi.fn();
    // El error nace del propio fetch (como en producción), no se inyecta antes
    // del submit: así se cubre también que la sección de error solo aparece
    // después de un intento real, no apenas se abre el modal.
    mockFetchInvoices.mockImplementationOnce(async () => {
      mockState.error = "Clave incorrecta";
      return false;
    });
    render(<RefreshInvoicesModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    fireEvent.click(screen.getByText("armar-turnstile"));
    fireEvent.click(screen.getByRole("button", { name: /Traer comprobantes/ }));

    await waitFor(() => expect(screen.getByText(/Clave incorrecta/)).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Traer comprobantes/ })).toBeInTheDocument();
  });

  it("cierra el modal cuando el fetch resuelve true", async () => {
    const onClose = vi.fn();
    mockFetchInvoices.mockResolvedValueOnce(true);
    render(<RefreshInvoicesModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    fireEvent.click(screen.getByText("armar-turnstile"));
    fireEvent.click(screen.getByRole("button", { name: /Traer comprobantes/ }));

    // La clave se limpia en el .then() de la promesa sin importar el
    // resultado: esperar a que quede vacía es la señal de que la promesa ya
    // resolvió y el efecto (incluido el cierre condicional) ya corrió.
    await waitFor(() => expect(screen.getByLabelText("Contraseña")).toHaveValue(""));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("no cierra el modal cuando el fetch resuelve false", async () => {
    const onClose = vi.fn();
    mockFetchInvoices.mockResolvedValueOnce(false);
    render(<RefreshInvoicesModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    fireEvent.click(screen.getByText("armar-turnstile"));
    fireEvent.click(screen.getByRole("button", { name: /Traer comprobantes/ }));

    await waitFor(() => expect(screen.getByLabelText("Contraseña")).toHaveValue(""));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("no muestra el error viejo si el modal se reabre sin reintentar", async () => {
    mockFetchInvoices.mockImplementationOnce(async () => {
      mockState.error = "Clave incorrecta";
      return false;
    });
    const { rerender } = render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    fireEvent.click(screen.getByText("armar-turnstile"));
    fireEvent.click(screen.getByRole("button", { name: /Traer comprobantes/ }));
    await waitFor(() => expect(screen.getByText(/Clave incorrecta/)).toBeInTheDocument());

    // Cerrar (sin reintentar) y reabrir: `state.error` del contexto sigue
    // "Clave incorrecta" porque nada nuevo lo limpió, pero el modal no debe
    // resucitarlo hasta que el usuario intente de nuevo.
    rerender(<RefreshInvoicesModal isOpen={false} onClose={vi.fn()} />);
    rerender(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);

    expect(screen.queryByText(/Clave incorrecta/)).not.toBeInTheDocument();
  });

  it("mientras isLoading muestra el splash sin backdrop ni tarjeta", () => {
    mockState.isLoading = true;
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText(/Actualizando comprobantes/)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // La tarjeta del formulario (y con ella su "Traer comprobantes") no está.
    expect(screen.queryByRole("button", { name: /Traer comprobantes/ })).not.toBeInTheDocument();
  });

  it("permite cancelar el fetch en curso", () => {
    // Sin cancelable, salir del panel a /facturar y emitir una factura mientras
    // el refresh sigue vivo termina con el fetch aterrizando y descartando la
    // recién emitida (replaceLocal vacía las emitidas por GARCA).
    mockState.isLoading = true;
    const onClose = vi.fn();
    render(<RefreshInvoicesModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancelar actualización/ }));

    expect(mockCancelOperation).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("limpia el error del contexto al cerrar", () => {
    mockState.error = "Credenciales inválidas";
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /^Cancelar$/ }));

    // El contexto sólo limpiaba el error al arrancar otro fetch: sin esto el
    // cartel rojo queda en /panel y /ingresar deja de redirigir.
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it("bloquea el submit con un rango invertido y muestra el motivo", () => {
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    fireEvent.click(screen.getByText("armar-turnstile"));
    fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2026-08-10" } });
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2026-01-01" } });

    expect(screen.getByText(/no puede ser posterior/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Traer comprobantes/ })).toBeDisabled();
  });

  it("bloquea el submit con un rango mayor a un año", () => {
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    fireEvent.click(screen.getByText("armar-turnstile"));
    fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2023-01-01" } });
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2026-01-01" } });

    // El server sólo valida el formato: sin este chequeo, tres años de rango
    // llegan al scraper.
    expect(screen.getByText(/no puede ser mayor a 1 año/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Traer comprobantes/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Traer comprobantes/ }));
    expect(mockFetchInvoices).not.toHaveBeenCalled();
  });

  it("sin empresa guardada no deja enviar", () => {
    mockState.company = null;
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta" } });
    fireEvent.click(screen.getByText("armar-turnstile"));

    // Antes el botón quedaba habilitado y el submit era un no-op silencioso.
    expect(screen.getByRole("button", { name: /Traer comprobantes/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Traer comprobantes/ }));
    expect(mockFetchInvoices).not.toHaveBeenCalled();
  });

  it("con isLoading en true, Escape no cierra el modal", () => {
    mockState.isLoading = true;
    const onClose = vi.fn();
    render(<RefreshInvoicesModal isOpen onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("no renderiza nada cerrado", () => {
    render(<RefreshInvoicesModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Traer comprobantes/ })).not.toBeInTheDocument();
  });
});
