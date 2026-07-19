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
    fireEvent.change(screen.getByTestId("nro-doc"), { target: { value: "30707915281" } });
    expect(screen.getByText(/guardar como plantilla/i)).toBeInTheDocument();
  });

  // [L2-UI] Los inputs numéricos no deben coercionar a NaN (paste de basura) ni
  // renderizar "$NaN" en el CTA.
  it("no renderiza $NaN cuando se pega basura en el precio", () => {
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    // Un <input type="number"> normaliza la basura a "" antes de llegar al onChange;
    // el helper la trata como 0 en vez de escribir NaN en el estado.
    fireEvent.change(screen.getByTestId("linea-precio-0"), { target: { value: "abc" } });
    expect(screen.getByTestId("form-total")).not.toHaveTextContent("NaN");
    expect(screen.getByTestId("form-total")).toHaveTextContent("0,00");
  });

  it("vaciar el precio deja el total en 0 (no $NaN)", () => {
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    fireEvent.change(screen.getByTestId("linea-precio-0"), { target: { value: "" } });
    expect(screen.getByTestId("form-total")).not.toHaveTextContent("NaN");
    expect(screen.getByTestId("form-total")).toHaveTextContent("0,00");
  });

  // [M2-UI] CF: elegir Consumidor Final autoselecciona tipo doc DNI (96), limpia el
  // número y des-bloquea el CTA (antes bloqueado por "CUIT inválido").
  it("Consumidor Final setea tipoDoc DNI, limpia nroDoc y desbloquea el CTA", () => {
    // Arranca con CUIT (80) y número vacío → CTA bloqueado por CUIT inválido.
    const sinDoc: Plantilla = { ...BASE, cliente: { ...BASE.cliente, tipoDoc: "80", nroDoc: "" } };
    render(<EmissionForm initial={sinDoc} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);

    const cta = screen.getByRole("button", { name: /previsualizar y emitir/i });
    expect(cta).toBeDisabled();
    expect(screen.getByText("CUIT")).toBeInTheDocument(); // tipo doc actual

    // Abrir el dropdown de Condición IVA y elegir Consumidor Final.
    fireEvent.click(screen.getByText("Responsable Inscripto"));
    fireEvent.click(screen.getByText("Consumidor Final"));

    expect((screen.getByTestId("nro-doc") as HTMLInputElement).value).toBe("");
    expect(screen.getByText("DNI")).toBeInTheDocument(); // tipo doc pasó a DNI
    expect(cta).not.toBeDisabled();
  });

  // [M2-UI] Gate de validación: datos inválidos bloquean y muestran el panel de errores.
  it("bloquea y muestra el panel de errores con datos inválidos", () => {
    render(<EmissionForm initial={BASE} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    fireEvent.change(screen.getByTestId("nro-doc"), { target: { value: "123" } }); // CUIT inválido
    expect(screen.getByTestId("validation-errors")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previsualizar y emitir/i })).toBeDisabled();
  });

  // [M2-UI] PV auto-select: al montar con puntosDeVenta, elige uno capaz de Factura C
  // cuando el PV actual no lo es.
  it("autoselecciona un PV capaz de Factura C al recibir puntosDeVenta", () => {
    const puntosDeVenta = [
      { value: "1", label: " 00001-Exporta", tipos: [{ value: "19", label: "Factura E (exportación)" }] },
      { value: "2", label: " 00002-Local", tipos: [{ value: "2", label: "Factura C" }] },
    ];
    render(
      <EmissionForm
        initial={BASE}
        onPreview={vi.fn()}
        onUpdateTemplate={vi.fn()}
        onSaveAsNew={vi.fn()}
        puntosDeVenta={puntosDeVenta}
      />,
    );
    // El PV inicial ("3") no está en la lista → elige el primero capaz = 00002.
    expect(screen.getByText("00002 · Factura C")).toBeInTheDocument();
    expect(screen.queryByText(/exportaci/i)).not.toBeInTheDocument();
  });

  // [L5-UI] Guard: elegir manualmente un PV que no soporta Factura C bloquea la emisión.
  it("bloquea el CTA si el PV elegido no puede emitir Factura C", () => {
    const puntosDeVenta = [
      { value: "3", label: " 00003-Exporta", tipos: [{ value: "19", label: "Factura E (exportación)" }] },
    ];
    render(
      <EmissionForm
        initial={BASE}
        onPreview={vi.fn()}
        onUpdateTemplate={vi.fn()}
        onSaveAsNew={vi.fn()}
        puntosDeVenta={puntosDeVenta}
      />,
    );
    expect(screen.getByTestId("pv-unsupported")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previsualizar y emitir/i })).toBeDisabled();
  });
});

describe("EmissionForm — cliente autocompletar", () => {
  it("no muestra inputs de razón social ni email", () => {
    render(<EmissionForm initial={null} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} />);
    expect(screen.queryByTestId("razon-social")).toBeNull();
    expect(screen.queryByTestId("email")).toBeNull();
  });

  it("al tipear un doc conocido, prefila condición IVA + venta y muestra el nombre", () => {
    const hints = { "30707915281": { razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["1"] } };
    render(<EmissionForm initial={null} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} clientHints={hints} />);
    fireEvent.change(screen.getByTestId("nro-doc"), { target: { value: "30707915281" } });
    expect(screen.getByTestId("cliente-resuelto")).toHaveTextContent("GSA SA");
  });

  it("doc desconocido muestra el aviso de que AFIP completará", () => {
    render(<EmissionForm initial={null} onPreview={vi.fn()} onUpdateTemplate={vi.fn()} onSaveAsNew={vi.fn()} clientHints={{}} />);
    fireEvent.change(screen.getByTestId("nro-doc"), { target: { value: "99999999999" } });
    expect(screen.getByTestId("cliente-resuelto")).toHaveTextContent(/AFIP/i);
  });
});
