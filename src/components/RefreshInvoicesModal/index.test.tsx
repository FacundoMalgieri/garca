import { beforeEach, describe, expect, it, vi } from "vitest";

import { RefreshInvoicesModal } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

const mockFetchInvoices = vi.fn().mockResolvedValue(true);
const mockState = {
  company: { cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 3 },
  isLoading: false,
  error: null as string | null,
  errorCode: null as string | null,
  progress: null,
};

vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({ state: mockState, fetchInvoicesWithCompany: mockFetchInvoices }),
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

  it("muestra el error del fetch sin cerrarse", () => {
    mockState.error = "Clave incorrecta";
    render(<RefreshInvoicesModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText(/Clave incorrecta/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Traer comprobantes/ })).toBeInTheDocument();
  });

  it("no renderiza nada cerrado", () => {
    render(<RefreshInvoicesModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Traer comprobantes/ })).not.toBeInTheDocument();
  });
});
