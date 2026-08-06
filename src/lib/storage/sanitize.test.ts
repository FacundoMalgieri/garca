import { describe, expect, it } from "vitest";

import {
  asFiniteNumber,
  asString,
  asStringArray,
  isRecord,
  sanitizeCompanyInfo,
  sanitizeInvoices,
  sanitizeManualFxRates,
  sanitizeMonotributoInfo,
  sanitizeProjectionData,
} from "@/lib/storage/sanitize";

describe("primitivas", () => {
  it("isRecord distingue objetos planos de arrays y null", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord("x")).toBe(false);
  });

  it("asFiniteNumber filtra NaN, Infinity y basura", () => {
    expect(asFiniteNumber(5)).toBe(5);
    expect(asFiniteNumber("5.5")).toBe(5.5);
    expect(asFiniteNumber(NaN)).toBe(0);
    expect(asFiniteNumber(Infinity)).toBe(0);
    expect(asFiniteNumber(undefined, 7)).toBe(7);
    expect(asFiniteNumber("abc", 7)).toBe(7);
    expect(asFiniteNumber(null, 7)).toBe(7);
  });

  it("asString no coerciona no-strings", () => {
    expect(asString("x")).toBe("x");
    expect(asString(5)).toBe("");
    expect(asString(null, "def")).toBe("def");
  });

  it("asStringArray descarta elementos que no son string", () => {
    expect(asStringArray(["a", 1, null, "b"])).toEqual(["a", "b"]);
    expect(asStringArray("a")).toEqual([]);
  });
});

/** Primer comprobante saneado. Falla el test si la lista salió inservible. */
function firstInvoice(raw: unknown): Record<string, unknown> {
  const invoices = sanitizeInvoices(raw);
  expect(invoices).not.toBeNull();
  return (invoices ?? [])[0] as unknown as Record<string, unknown>;
}

describe("sanitizeInvoices", () => {
  const INVOICE = {
    fecha: "01/07/2026",
    tipo: "Factura C",
    tipoComprobante: 11,
    puntoVenta: 3,
    numero: 1,
    numeroCompleto: "00003-00000001",
    cuitEmisor: "20111111112",
    razonSocialEmisor: "EMISOR",
    cuitReceptor: "30707915281",
    razonSocialReceptor: "RECEPTOR",
    importeNeto: 100,
    importeIVA: 0,
    importeTotal: 100,
    moneda: "PES",
  };

  it("deja pasar una lista bien formada", () => {
    expect(sanitizeInvoices([INVOICE])).toEqual([INVOICE]);
  });

  it("devuelve null cuando lo guardado no es una lista", () => {
    // null = dato inservible → el caller lo trata como "no hay sesión".
    expect(sanitizeInvoices(null)).toBeNull();
    expect(sanitizeInvoices({})).toBeNull();
    expect(sanitizeInvoices("[]")).toBeNull();
  });

  it("distingue lista vacía de dato inservible", () => {
    // Una consulta que no devolvió comprobantes es un resultado legítimo.
    expect(sanitizeInvoices([])).toEqual([]);
  });

  it("coerciona importes que vinieron como string", () => {
    const inv = firstInvoice([{ ...INVOICE, importeTotal: "1500.50" }]);
    expect(inv.importeTotal).toBe(1500.5);
  });

  it("convierte importes basura en 0 en vez de propagar NaN", () => {
    // Un NaN acá se propaga al total del panel y se ve "$NaN".
    for (const bad of [undefined, null, "abc", NaN, {}]) {
      const inv = firstInvoice([{ ...INVOICE, importeTotal: bad }]);
      expect(inv.importeTotal).toBe(0);
    }
  });

  it("conserva campos desconocidos", () => {
    // Un campo agregado por una versión posterior tiene que sobrevivir.
    const inv = firstInvoice([{ ...INVOICE, campoNuevo: "x" }]);
    expect(inv.campoNuevo).toBe("x");
  });

  it("descarta elementos que no pueden ser comprobantes", () => {
    expect(sanitizeInvoices([INVOICE, null, "x", 3, []])).toEqual([INVOICE]);
  });

  it("rellena strings faltantes en vez de dejarlos undefined", () => {
    const inv = firstInvoice([{ importeTotal: 10 }]);
    expect(inv.fecha).toBe("");
    expect(inv.moneda).toBe("");
  });
});

describe("sanitizeCompanyInfo", () => {
  it("deja pasar una empresa bien formada", () => {
    expect(sanitizeCompanyInfo({ cuit: "20111111112", razonSocial: "X", index: 2 })).toEqual({
      cuit: "20111111112",
      razonSocial: "X",
      index: 2,
    });
  });

  it("default index 0 cuando falta o es basura", () => {
    expect(sanitizeCompanyInfo({ cuit: "20111111112", razonSocial: "X" })?.index).toBe(0);
    expect(sanitizeCompanyInfo({ cuit: "2", razonSocial: "X", index: "abc" })?.index).toBe(0);
  });

  it("devuelve null si no hay nada identificable", () => {
    expect(sanitizeCompanyInfo(null)).toBeNull();
    expect(sanitizeCompanyInfo({})).toBeNull();
    expect(sanitizeCompanyInfo({ index: 3 })).toBeNull();
    expect(sanitizeCompanyInfo([])).toBeNull();
  });
});

describe("sanitizeMonotributoInfo", () => {
  const INFO = {
    categoria: "H",
    tipoActividad: "servicios",
    actividadDescripcion: "LOCACIONES DE SERVICIOS",
    proximaRecategorizacion: "Enero 2027",
    nombreCompleto: "NOMBRE",
    cuit: "20111111112",
  };

  it("deja pasar info bien formada", () => {
    expect(sanitizeMonotributoInfo(INFO)).toEqual(INFO);
  });

  it("devuelve null sin categoría (es de lo que cuelga todo el panel)", () => {
    expect(sanitizeMonotributoInfo({ ...INFO, categoria: undefined })).toBeNull();
    expect(sanitizeMonotributoInfo({})).toBeNull();
    expect(sanitizeMonotributoInfo(null)).toBeNull();
  });

  it("normaliza un tipoActividad desconocido a null", () => {
    expect(sanitizeMonotributoInfo({ ...INFO, tipoActividad: "otra" })?.tipoActividad).toBeNull();
    expect(sanitizeMonotributoInfo({ ...INFO, tipoActividad: 5 })?.tipoActividad).toBeNull();
  });

  it("rellena los campos de texto que falten", () => {
    const info = sanitizeMonotributoInfo({ categoria: "A" });
    expect(info?.nombreCompleto).toBe("");
    expect(info?.proximaRecategorizacion).toBe("");
  });
});

describe("sanitizeManualFxRates", () => {
  it("deja pasar cotizaciones válidas", () => {
    expect(sanitizeManualFxRates({ USD: 1450, EUR: "1600" })).toEqual({ USD: 1450, EUR: 1600 });
  });

  it("descarta cotizaciones que no sirven como divisor", () => {
    // Se usan para convertir a pesos: 0 o negativo daría totales sin sentido.
    expect(sanitizeManualFxRates({ USD: 0, EUR: -5, JPY: "abc", GBP: null })).toEqual({});
  });

  it("devuelve {} cuando lo guardado no es un objeto", () => {
    expect(sanitizeManualFxRates(null)).toEqual({});
    expect(sanitizeManualFxRates([1, 2])).toEqual({});
  });
});

describe("sanitizeProjectionData", () => {
  const DATA = {
    targetRecategorizacion: "2026-07",
    targetCategoria: "H",
    margenSeguridad: 200000,
    monthlyProjections: { "2026-01": 100, "2026-02": 200 },
    updatedAt: "2026-08-06T00:00:00.000Z",
  };

  it("deja pasar una proyección bien formada", () => {
    expect(sanitizeProjectionData(DATA)).toEqual(DATA);
  });

  it("devuelve null sin mes objetivo válido", () => {
    expect(sanitizeProjectionData({ ...DATA, targetRecategorizacion: "2026-13" })).toBeNull();
    expect(sanitizeProjectionData({ ...DATA, targetRecategorizacion: "julio" })).toBeNull();
    expect(sanitizeProjectionData({ ...DATA, targetRecategorizacion: undefined })).toBeNull();
    expect(sanitizeProjectionData(null)).toBeNull();
  });

  it("descarta claves de mes que no son YYYY-MM", () => {
    // Una clave rara rompería la ventana de 12 meses.
    const result = sanitizeProjectionData({
      ...DATA,
      monthlyProjections: { "2026-01": 100, "no-es-mes": 50, "2026-99": 10 },
    });
    expect(result?.monthlyProjections).toEqual({ "2026-01": 100 });
  });

  it("coerciona montos basura a 0", () => {
    const result = sanitizeProjectionData({
      ...DATA,
      monthlyProjections: { "2026-01": "abc", "2026-02": null },
    });
    expect(result?.monthlyProjections).toEqual({ "2026-01": 0, "2026-02": 0 });
  });

  it("tolera monthlyProjections ausente o con forma inválida", () => {
    expect(sanitizeProjectionData({ ...DATA, monthlyProjections: undefined })?.monthlyProjections).toEqual({});
    expect(sanitizeProjectionData({ ...DATA, monthlyProjections: [] })?.monthlyProjections).toEqual({});
  });

  it("normaliza targetCategoria no-string a null", () => {
    expect(sanitizeProjectionData({ ...DATA, targetCategoria: 5 })?.targetCategoria).toBeNull();
  });
});
