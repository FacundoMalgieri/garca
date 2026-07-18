import { describe, expect,it } from "vitest";

import { dedupeInvoices,invoiceKey, mergeFetchedInvoices } from "@/lib/facturador/dedupe";
import type { AFIPInvoice } from "@/types/afip-scraper";

function inv(partial: Partial<AFIPInvoice>): AFIPInvoice {
  return {
    fecha: "03/07/2026", tipo: "FACTURA C", tipoComprobante: 11,
    puntoVenta: 3, numero: 88, numeroCompleto: "00003-00000088",
    cuitEmisor: "20354104076", razonSocialEmisor: "YO",
    cuitReceptor: "30707915281", razonSocialReceptor: "GSA",
    importeNeto: 3500000, importeIVA: 0, importeTotal: 3500000, moneda: "PES",
    ...partial,
  };
}

describe("dedupe", () => {
  it("invoiceKey combina tipo+pv+numero", () => {
    expect(invoiceKey(inv({}))).toBe("11-3-88");
  });

  it("mergea prefiriendo la versión existente (emitida por GARCA)", () => {
    const emitida = { ...inv({}), emittedByGarca: true } as AFIPInvoice;
    const scrapeada = inv({ estado: "APROBADO" });
    const result = dedupeInvoices([emitida], [scrapeada]);
    expect(result).toHaveLength(1);
    expect((result[0] as { emittedByGarca?: boolean }).emittedByGarca).toBe(true);
  });

  it("suma facturas distintas", () => {
    const a = inv({ numero: 88, numeroCompleto: "00003-00000088" });
    const b = inv({ numero: 89, numeroCompleto: "00003-00000089" });
    expect(dedupeInvoices([a], [b])).toHaveLength(2);
  });
});

describe("mergeFetchedInvoices", () => {
  it("preserva una emitida por GARCA que el re-fetch NO incluye", () => {
    const emitida = { ...inv({ cae: "70000000000001" }), emittedByGarca: true } as AFIPInvoice;
    const otra = inv({ numero: 89, numeroCompleto: "00003-00000089", cae: "70000000000002" });
    const merged = mergeFetchedInvoices([emitida], [otra]);
    expect(merged).toHaveLength(2);
    // La emitida ausente sobrevive y conserva su marcador.
    const survived = merged.find((i) => i.cae === "70000000000001");
    expect(survived).toBeDefined();
    expect((survived as { emittedByGarca?: boolean }).emittedByGarca).toBe(true);
  });

  it("el row autoritativo (CAE real) reemplaza al placeholder sin duplicar", () => {
    // Placeholder de GARCA: cuitEmisor vacío, importeIVA 0, CAE ya asignado.
    const placeholder = {
      ...inv({ cae: "70000000000001", cuitEmisor: "", importeIVA: 0 }),
      emittedByGarca: true,
    } as AFIPInvoice;
    // Row scrapeado de AFIP: mismo CAE, datos reales.
    const autoritativo = inv({
      cae: "70000000000001",
      cuitEmisor: "20354104076",
      importeIVA: 12345,
    });
    const merged = mergeFetchedInvoices([placeholder], [autoritativo]);
    expect(merged).toHaveLength(1);
    // Gana el dato autoritativo...
    expect(merged[0].cuitEmisor).toBe("20354104076");
    expect(merged[0].importeIVA).toBe(12345);
    // ...pero conserva el marcador para la pestaña "Emitidas".
    expect((merged[0] as { emittedByGarca?: boolean }).emittedByGarca).toBe(true);
  });

  it("reconcilia el placeholder CAE-pendiente (cae '', numero 0) vía fallback sin duplicar", () => {
    // Placeholder emitido: sin CAE resuelto, numero 0, PV con padding.
    const pendiente = {
      ...inv({ cae: "", numero: 0, numeroCompleto: "", puntoVenta: 3 }),
      emittedByGarca: true,
    } as AFIPInvoice;
    // Row real posterior: mismo tipo/pv/importe/fecha, ahora con CAE y numero.
    const real = inv({
      cae: "70000000000009",
      numero: 88,
      numeroCompleto: "00003-00000088",
      puntoVenta: 3,
    });
    const merged = mergeFetchedInvoices([pendiente], [real]);
    expect(merged).toHaveLength(1);
    expect(merged[0].cae).toBe("70000000000009");
    expect(merged[0].numero).toBe(88);
    expect((merged[0] as { emittedByGarca?: boolean }).emittedByGarca).toBe(true);
  });

  it("matchea por fallback aunque el PV venga con padding distinto", () => {
    const pendiente = {
      ...inv({ cae: "", numero: 0 }),
      puntoVenta: "00003" as unknown as number,
      emittedByGarca: true,
    } as AFIPInvoice;
    const real = inv({ cae: "70000000000010", numero: 88, puntoVenta: 3 });
    const merged = mergeFetchedInvoices([pendiente], [real]);
    expect(merged).toHaveLength(1);
    expect(merged[0].cae).toBe("70000000000010");
  });

  it("no colapsa facturas realmente distintas", () => {
    const emitida = { ...inv({ cae: "70000000000001" }), emittedByGarca: true } as AFIPInvoice;
    const distinta = inv({
      numero: 89,
      numeroCompleto: "00003-00000089",
      cae: "70000000000002",
      importeTotal: 999,
    });
    const merged = mergeFetchedInvoices([emitida], [distinta]);
    expect(merged).toHaveLength(2);
  });
});
