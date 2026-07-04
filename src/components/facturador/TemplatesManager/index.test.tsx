import { describe, expect, it, vi } from "vitest";

import type { Plantilla } from "@/types/facturador";

import { TemplatesManager } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

const T = (id: string, nombre: string): Plantilla => ({
  id, nombre, puntoDeVenta: "3", concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "1", razonSocial: "X", condicionVenta: ["6"] },
  lineas: [{ descripcion: "s", cantidad: 1, unidad: "7", precioUnitario: 1000 }],
});

describe("TemplatesManager", () => {
  it("no renderiza nada si isOpen es false", () => {
    const { container } = render(<TemplatesManager isOpen={false} onClose={vi.fn()} templates={[T("1", "A")]} onRename={vi.fn()} onDelete={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("lista las plantillas cuando está abierto", () => {
    render(<TemplatesManager isOpen onClose={vi.fn()} templates={[T("1", "Cliente A")]} onRename={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByDisplayValue("Cliente A")).toBeInTheDocument();
  });
  it("renombrar llama onRename con id y nuevo nombre al perder foco", () => {
    const onRename = vi.fn();
    render(<TemplatesManager isOpen onClose={vi.fn()} templates={[T("1", "Cliente A")]} onRename={onRename} onDelete={vi.fn()} />);
    const input = screen.getByDisplayValue("Cliente A");
    fireEvent.change(input, { target: { value: "Cliente B" } });
    fireEvent.blur(input);
    expect(onRename).toHaveBeenCalledWith("1", "Cliente B");
  });
  it("eliminar pide confirmación y luego llama onDelete", () => {
    const onDelete = vi.fn();
    render(<TemplatesManager isOpen onClose={vi.fn()} templates={[T("1", "Cliente A")]} onRename={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/eliminar/i));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
