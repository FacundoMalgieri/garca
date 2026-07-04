import { describe, expect, it, vi } from "vitest";

import type { Plantilla } from "@/types/facturador";

import { EmissionForm } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

const BASE: Plantilla = {
  id: "1", nombre: "Cliente X", puntoDeVenta: "3", concepto: "servicios",
  cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "CLIENTE X SA", condicionVenta: ["6"] },
  periodo: { desde: "01/06/2026", hasta: "30/06/2026", vtoPago: "13/07/2026" },
  lineas: [{ descripcion: "Servicios", cantidad: 1, unidad: "7", precioUnitario: 180000 }],
};

describe("EmissionForm", () => {
  it("muestra el total en vivo de la plantilla inicial", () => {
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    expect(screen.getByTestId("form-total")).toHaveTextContent("180.000,00");
  });

  it("recalcula el total al cambiar el precio unitario", () => {
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    fireEvent.change(screen.getByTestId("linea-precio-0"), { target: { value: "200000" } });
    expect(screen.getByTestId("form-total")).toHaveTextContent("200.000,00");
  });

  it("muestra la barra de cambios cuando el form difiere de la plantilla", () => {
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    expect(screen.queryByTestId("dirty-bar")).not.toBeInTheDocument();
    fireEvent.change(screen.getByTestId("linea-precio-0"), { target: { value: "200000" } });
    expect(screen.getByTestId("dirty-bar")).toBeInTheDocument();
  });

  it("actualizar plantilla llama onUpdateTemplate con el id y el form editado", () => {
    const onUpdateTemplate = vi.fn();
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={onUpdateTemplate} onSaveAsNew={vi.fn()} />);
    fireEvent.change(screen.getByTestId("linea-precio-0"), { target: { value: "200000" } });
    fireEvent.click(screen.getByText("Actualizar plantilla"));
    expect(onUpdateTemplate).toHaveBeenCalledWith("1", expect.objectContaining({ id: "1" }));
    expect(onUpdateTemplate.mock.calls[0][1].lineas[0].precioUnitario).toBe(200000);
  });

  it("previsualizar llama onPreview con el form actual", () => {
    const onPreview = vi.fn();
    render(<EmissionForm initial={BASE} onPreview={onPreview} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /previsualizar y emitir/i }));
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
  });

  it("deshabilita el CTA si el total es 0", () => {
    const empty: Plantilla = { ...BASE, lineas: [{ descripcion: "x", cantidad: 1, unidad: "7", precioUnitario: 0 }] };
    render(<EmissionForm initial={empty} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    expect(screen.getByRole("button", { name: /previsualizar y emitir/i })).toBeDisabled();
  });

  it("agrega y quita líneas", () => {
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    fireEvent.click(screen.getByText(/agregar línea/i));
    expect(screen.getByTestId("linea-precio-1")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("linea-remove-1"));
    expect(screen.queryByTestId("linea-precio-1")).not.toBeInTheDocument();
  });

  it("atajo 'mes anterior' completa el período", () => {
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    fireEvent.click(screen.getByText(/mes anterior/i));
    expect((screen.getByTestId("periodo-desde") as HTMLInputElement).value).toMatch(/^01\//);
  });

  it("en blanco (initial null) muestra 'Guardar como plantilla' cuando hay datos válidos", () => {
    render(<EmissionForm initial={null} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    fireEvent.change(screen.getByTestId("linea-desc-0"), { target: { value: "Trabajo" } });
    fireEvent.change(screen.getByTestId("linea-precio-0"), { target: { value: "50000" } });
    expect(screen.getByText(/guardar como plantilla/i)).toBeInTheDocument();
  });
});
