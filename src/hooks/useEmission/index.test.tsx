import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InvoiceProvider, useInvoiceContext } from "@/contexts/InvoiceContext";
import { useEmission } from "@/hooks/useEmission";

import { act, renderHook, waitFor } from "@testing-library/react";

const wrapper = ({ children }: { children: ReactNode }) => <InvoiceProvider>{children}</InvoiceProvider>;

const previewObj = {
  puntoVenta: "3", tipoComprobante: 11,
  emisor: { razonSocial: "YO", puntoVenta: "00003", domicilio: "x", concepto: "Servicios" },
  receptor: { cuit: "30707915281", razonSocial: "GSA", domicilio: "y", email: "", condicionIVA: "IVA Responsable Inscripto", condicionVenta: "Transferencia Bancaria" },
  lineas: [], subtotal: 1000, importeOtrosTributos: 0, importeTotal: 1000,
};

describe("useEmission", () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it("startPreview setea el preview", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(previewObj), { status: 200 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.startPreview({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("preview"));
    expect(result.current.preview?.importeTotal).toBe(1000);
  });

  it("error de la ruta pasa a phase error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "boom" }), { status: 500 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.startPreview({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("error"));
    expect(result.current.error).toBeTruthy();
  });

  it("confirm appendea la emitida al contexto", async () => {
    const resultObj = { ...previewObj, numeroCompleto: "00003-00000089", cae: "123", vencimientoCae: "13/07/2026" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(resultObj), { status: 200 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("done"));
    expect(result.current.result?.cae).toBe("123");
  });

  it("reenvía turnstileToken como header x-turnstile-token y no en el body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ preview: { importeTotal: 100 } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => {
      await result.current.startPreview({ kind: "facturaC", plantilla: {} as never }, {
        cuit: "enc", password: "enc", encrypted: true, turnstileToken: "TS-TOKEN", companyIndex: 2,
      } as never);
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["x-turnstile-token"]).toBe("TS-TOKEN");
    const body = JSON.parse(init.body);
    expect(body.turnstileToken).toBeUndefined();
    expect(body.companyIndex).toBe(2);
    expect(body.encrypted).toBe(true);
  });

  it("confirm de NC: envía kind notaCreditoC y appendea al contexto con tipo NC, tipoComprobante 13 y moneda ARS", async () => {
    const resultObj = { ...previewObj, numeroCompleto: "00003-00000090", cae: "999", vencimientoCae: "13/07/2026" };

    const captured: Record<string, unknown>[] = [];
    const fetchMock = vi.fn().mockImplementation((_url, init) => {
      captured.push(JSON.parse((init as { body: string }).body));
      return Promise.resolve(new Response(JSON.stringify(resultObj), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () => ({ emission: useEmission(), ctx: useInvoiceContext() }),
      { wrapper },
    );
    const original = {
      fecha: "10/06/2026", tipo: "FACTURA C", tipoComprobante: 11, puntoVenta: 3, numero: 89,
      numeroCompleto: "0003-00000089", cuitEmisor: "", razonSocialEmisor: "", cuitReceptor: "30707915281",
      razonSocialReceptor: "GSA", importeNeto: 1000, importeIVA: 0, importeTotal: 1000, moneda: "ARS", emittedByGarca: true,
    };
    await act(async () => {
      await result.current.emission.confirm(
        { kind: "notaCreditoC", original: original as never, condicionIVA: "1" },
        { cuit: "e", password: "e", encrypted: true } as never,
      );
    });
    await waitFor(() => expect(result.current.emission.phase).toBe("done"));

    // 1) Body enviado a la ruta
    const body = captured[0];
    expect(body.kind).toBe("notaCreditoC");
    expect(body.condicionIVA).toBe("1");
    expect((body.original as { numeroCompleto: string }).numeroCompleto).toBe("0003-00000089");

    // 2) Invoice appendeado al contexto (lo que hace que baje el ingreso)
    const appended = result.current.ctx.state.invoices.at(-1)!;
    expect(appended.tipo.toLowerCase()).toContain("nota de credito");
    expect(appended.tipoComprobante).toBe(13);
    expect(appended.moneda).toBe("ARS");
  });
});
