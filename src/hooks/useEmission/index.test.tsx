import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InvoiceProvider, useInvoiceContext } from "@/contexts/InvoiceContext";
import { useEmission } from "@/hooks/useEmission";
import { loadClientMemory } from "@/lib/facturador/client-memory";

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

  it("guarda el hint del cliente al emitir una factura C", async () => {
    localStorage.clear();
    const resultObj = {
      ...previewObj,
      receptor: { ...previewObj.receptor, cuit: "30707915281", razonSocial: "GSA SA" },
      numeroCompleto: "00003-00000089",
      cae: "123",
      vencimientoCae: "13/07/2026",
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(resultObj), { status: 200 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    const plantilla = {
      cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", condicionVenta: ["6"] },
    } as never;
    await act(async () => {
      await result.current.confirm({ kind: "facturaC", plantilla }, {} as never);
    });
    await waitFor(() => expect(result.current.phase).toBe("done"));

    expect(loadClientMemory()["30707915281"]).toMatchObject({
      razonSocial: "GSA SA",
      condicionIVA: "1",
      condicionVenta: ["6"],
    });
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

  // [H2] Anti doble-click sincrónico
  it("doble-confirm mientras el primero está en vuelo: el segundo es no-op (un solo fetch)", async () => {
    const resultObj = { ...previewObj, numeroCompleto: "00003-00000091", cae: "111", vencimientoCae: "13/07/2026" };
    // fetch que resuelve recién cuando lo destrabamos → mantiene el primero "en vuelo"
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => { release = r; });
    const fetchMock = vi.fn().mockImplementation(async () => {
      await gate;
      return new Response(JSON.stringify(resultObj), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => {
      // Dos confirm() sincrónicos antes de que el primero resuelva.
      const p1 = result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never);
      const p2 = result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never);
      release();
      await Promise.all([p1, p2]);
    });

    await waitFor(() => expect(result.current.phase).toBe("done"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // [Contrato A P0] retry post-error reusa la MISMA idempotencyKey
  it("confirm falla → reintento (sin reset del target) manda el MISMO idempotencyKey", async () => {
    const keys: (string | undefined)[] = [];
    const fetchMock = vi
      .fn()
      // 1er intento: falla en red
      .mockImplementationOnce((_url, init) => {
        keys.push(JSON.parse((init as { body: string }).body).idempotencyKey);
        return Promise.reject(new Error("network down"));
      })
      // reintento: éxito
      .mockImplementationOnce((_url, init) => {
        keys.push(JSON.parse((init as { body: string }).body).idempotencyKey);
        const resultObj = { ...previewObj, numeroCompleto: "00003-00000092", cae: "222", vencimientoCae: "13/07/2026" };
        return Promise.resolve(new Response(JSON.stringify(resultObj), { status: 200 }));
      });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("error"));

    // Reintento: SIN startPreview/reset del target → confirm() otra vez.
    await act(async () => { await result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("done"));

    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });

  // [Contrato A P0] reset() NO regenera la key
  it("reset() entre el error y el reintento NO cambia el idempotencyKey", async () => {
    const keys: (string | undefined)[] = [];
    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_url, init) => {
        keys.push(JSON.parse((init as { body: string }).body).idempotencyKey);
        return Promise.reject(new Error("network down"));
      })
      .mockImplementationOnce((_url, init) => {
        keys.push(JSON.parse((init as { body: string }).body).idempotencyKey);
        const resultObj = { ...previewObj, numeroCompleto: "00003-00000093", cae: "333", vencimientoCae: "13/07/2026" };
        return Promise.resolve(new Response(JSON.stringify(resultObj), { status: 200 }));
      });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("error"));
    act(() => { result.current.reset(); });
    await act(async () => { await result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("done"));

    expect(keys[1]).toBe(keys[0]);
  });

  // [Contrato A P0] un nuevo comprobante (startPreview) SÍ genera una key distinta
  it("arrancar un target nuevo (startPreview) genera un idempotencyKey distinto en el confirm siguiente", async () => {
    const keys: (string | undefined)[] = [];
    const previewResp = () => new Response(JSON.stringify(previewObj), { status: 200 });
    const confirmResp = (n: string, cae: string) =>
      new Response(JSON.stringify({ ...previewObj, numeroCompleto: n, cae, vencimientoCae: "13/07/2026" }), { status: 200 });

    const fetchMock = vi.fn().mockImplementation((url, init) => {
      if (String(url).includes("/confirm")) {
        keys.push(JSON.parse((init as { body: string }).body).idempotencyKey);
        return Promise.resolve(confirmResp("00003-00000094", "444"));
      }
      return Promise.resolve(previewResp());
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useEmission(), { wrapper });

    // Comprobante 1
    await act(async () => { await result.current.startPreview({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await act(async () => { await result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    // Comprobante 2 (nuevo preview)
    await act(async () => { await result.current.startPreview({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await act(async () => { await result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });

    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBeTruthy();
    expect(keys[1]).not.toBe(keys[0]);
  });

  // [Contrato B] CAE pendiente: cae:"" NO es error, va a "done"
  it("result con cae vacío pasa a phase done (CAE pendiente), no a error", async () => {
    const resultObj = { ...previewObj, numeroCompleto: "00003-00000095", cae: "", vencimientoCae: "" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(resultObj), { status: 200 }));
    const { result } = renderHook(() => useEmission(), { wrapper });
    await act(async () => { await result.current.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.phase).toBe("done"));
    expect(result.current.error).toBeNull();
    expect(result.current.result?.cae).toBe("");
  });

  // [L2-hooks] numeroCompleto sin guion no colapsa a numero 0 si hay dígitos
  it("numeroCompleto sin guion preserva el número (no colapsa a 0)", async () => {
    const resultObj = { ...previewObj, numeroCompleto: "97", cae: "555", vencimientoCae: "13/07/2026" };
    const { result } = renderHook(
      () => ({ emission: useEmission(), ctx: useInvoiceContext() }),
      { wrapper },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(resultObj), { status: 200 }));
    await act(async () => { await result.current.emission.confirm({ kind: "facturaC", plantilla: {} as never }, {} as never); });
    await waitFor(() => expect(result.current.emission.phase).toBe("done"));

    const appended = result.current.ctx.state.invoices.at(-1)!;
    expect(appended.numero).toBe(97);
  });
});
