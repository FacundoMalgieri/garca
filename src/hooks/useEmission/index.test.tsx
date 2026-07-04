import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { useEmission } from "@/hooks/useEmission";

import { act, renderHook, waitFor } from "@testing-library/react";

const wrapper = ({ children }: { children: ReactNode }) => <InvoiceProvider>{children}</InvoiceProvider>;

const previewObj = {
  puntoVenta: "3", tipoComprobante: 11,
  emisor: { razonSocial: "YO", puntoVenta: "00003", domicilio: "x", concepto: "Servicios" },
  receptor: { cuit: "30707915281", razonSocial: "GSA", domicilio: "y", email: "", condicionIVA: "IVA Responsable Inscripto", condicionVenta: "Transferencia Bancaria" },
  lineas: [], subtotal: 1000, importeOtrosTributos: 0, importeTotal: 1000, html: "<x/>",
};

describe("useEmission", () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it("startPreview setea el preview", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(previewObj), { status: 200 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.startPreview({} as never, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("preview"));
    expect(result.current.preview?.importeTotal).toBe(1000);
  });

  it("error de la ruta pasa a phase error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "boom" }), { status: 500 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.startPreview({} as never, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("error"));
    expect(result.current.error).toBeTruthy();
  });

  it("confirm appendea la emitida al contexto", async () => {
    const resultObj = { ...previewObj, numeroCompleto: "00003-00000089", cae: "123", vencimientoCae: "13/07/2026" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(resultObj), { status: 200 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.confirm({} as never, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("done"));
    expect(result.current.result?.cae).toBe("123");
  });
});
