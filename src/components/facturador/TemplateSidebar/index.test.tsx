import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Plantilla } from "@/types/facturador";
import { TemplateSidebar } from "./index";

const T = (id: string, nombre: string, pv = "3", total = 180000): Plantilla => ({
  id, nombre, puntoDeVenta: pv, concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "X", condicionVenta: ["6"] },
  lineas: [{ descripcion: "s", cantidad: 1, unidad: "7", precioUnitario: total }],
});

describe("TemplateSidebar", () => {
  it("lista las plantillas con nombre y total", () => {
    render(<TemplateSidebar templates={[T("1", "Cliente X")]} activeId={null} onSelect={vi.fn()} onManage={vi.fn()} />);
    expect(screen.getByText("Cliente X")).toBeInTheDocument();
    expect(screen.getByText(/180\.000/)).toBeInTheDocument();
  });
  it("llama onSelect(id) al clickear una plantilla", () => {
    const onSelect = vi.fn();
    render(<TemplateSidebar templates={[T("42", "Cliente Y")]} activeId={null} onSelect={onSelect} onManage={vi.fn()} />);
    fireEvent.click(screen.getByText("Cliente Y"));
    expect(onSelect).toHaveBeenCalledWith("42");
  });
  it("llama onSelect(null) al clickear 'En blanco'", () => {
    const onSelect = vi.fn();
    render(<TemplateSidebar templates={[]} activeId={null} onSelect={onSelect} onManage={vi.fn()} />);
    fireEvent.click(screen.getByText(/en blanco/i));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
  it("marca la plantilla activa con aria-current", () => {
    render(<TemplateSidebar templates={[T("1", "Cliente X")]} activeId="1" onSelect={vi.fn()} onManage={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Cliente X/ })).toHaveAttribute("aria-current", "true");
  });
  it("llama onManage al clickear Gestionar", () => {
    const onManage = vi.fn();
    render(<TemplateSidebar templates={[]} activeId={null} onSelect={vi.fn()} onManage={onManage} />);
    fireEvent.click(screen.getByText(/gestionar/i));
    expect(onManage).toHaveBeenCalled();
  });
});
