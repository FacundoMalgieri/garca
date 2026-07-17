import { describe, expect, it, vi } from "vitest";

import { AnularTab } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

// Mock del contexto para inyectar invoices
vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({
    state: {
      invoices: [
        { fecha: "10/06/2026", tipo: "FACTURA C", tipoComprobante: 11, puntoVenta: 3, numero: 89, numeroCompleto: "0003-00000089", cuitReceptor: "30707915281", razonSocialReceptor: "GSA", importeNeto: 1000, importeIVA: 0, importeTotal: 1000, moneda: "ARS", cuitEmisor: "", razonSocialEmisor: "", emittedByGarca: true },
        { fecha: "11/06/2026", tipo: "NOTA DE CREDITO C", tipoComprobante: 13, puntoVenta: 3, numero: 90, numeroCompleto: "0003-00000090", cuitReceptor: "30707915281", razonSocialReceptor: "GSA", importeNeto: 500, importeIVA: 0, importeTotal: 500, moneda: "ARS", cuitEmisor: "", razonSocialEmisor: "", emittedByGarca: true },
      ],
    },
  }),
}));

describe("AnularTab", () => {
  it("lista solo Factura C y dispara onVoid al tocar Deshacer", () => {
    const onVoid = vi.fn();
    render(<AnularTab onVoid={onVoid} />);
    // La NC no debe aparecer como deshacible: solo 1 botón Deshacer
    const botones = screen.getAllByRole("button", { name: /Deshacer/i });
    expect(botones).toHaveLength(1);
    fireEvent.click(botones[0]);
    expect(onVoid).toHaveBeenCalledTimes(1);
    expect(onVoid.mock.calls[0][0].numeroCompleto).toBe("0003-00000089");
  });

  it("renderiza la fila de la Factura C con su número de comprobante", () => {
    render(<AnularTab onVoid={() => {}} />);
    expect(screen.getByText(/0003-00000089/)).toBeInTheDocument();
  });
});
