import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClearDataModal } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

const mockClearInvoices = vi.fn();
vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({ clearInvoices: mockClearInvoices }),
}));

describe("ClearDataModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("arranca con sólo Comprobantes tildado", () => {
    render(<ClearDataModal isOpen onClose={vi.fn()} onCleared={vi.fn()} />);
    expect(screen.getByRole("checkbox", { name: /Comprobantes y sesión/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Facturador/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Preferencias/ })).not.toBeChecked();
  });

  it("deshabilita confirmar si no hay ningún grupo tildado", () => {
    render(<ClearDataModal isOpen onClose={vi.fn()} onCleared={vi.fn()} />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Comprobantes y sesión/ }));
    expect(screen.getByRole("button", { name: /Borrar lo seleccionado/ })).toBeDisabled();
  });

  it("borra sólo lo tildado y avisa qué borró", () => {
    localStorage.setItem("garca_facturador_templates", "[]");
    localStorage.setItem("garca_projection", "{}");
    const onCleared = vi.fn();

    render(<ClearDataModal isOpen onClose={vi.fn()} onCleared={onCleared} />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Comprobantes y sesión/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Facturador/ }));
    fireEvent.click(screen.getByRole("button", { name: /Borrar lo seleccionado/ }));

    expect(localStorage.getItem("garca_facturador_templates")).toBeNull();
    expect(localStorage.getItem("garca_projection")).toBe("{}");
    expect(mockClearInvoices).not.toHaveBeenCalled();
    expect(onCleared).toHaveBeenCalledWith(["facturador"]);
  });

  it("usa clearInvoices cuando se tilda Comprobantes", () => {
    render(<ClearDataModal isOpen onClose={vi.fn()} onCleared={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Borrar lo seleccionado/ }));
    expect(mockClearInvoices).toHaveBeenCalledTimes(1);
  });

  it("explica qué se pierde en cada grupo", () => {
    render(<ClearDataModal isOpen onClose={vi.fn()} onCleared={vi.fn()} />);
    expect(screen.getByText(/No se recuperan/)).toBeInTheDocument();
  });
});
