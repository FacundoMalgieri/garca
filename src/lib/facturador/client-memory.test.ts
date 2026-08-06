import { beforeEach, describe, expect, it } from "vitest";

import { CLIENTES_STORAGE_KEY, loadClientMemory, sanitizeClientMemory,saveClientHint } from "@/lib/facturador/client-memory";

describe("client-memory", () => {
  beforeEach(() => localStorage.clear());

  it("save + load round-trip por doc", () => {
    saveClientHint("30707915281", { razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["6"] });
    expect(loadClientMemory()["30707915281"]).toEqual({ razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["6"] });
  });

  it("merge: no pisa campos previos con undefined", () => {
    saveClientHint("30707915281", { razonSocial: "GSA SA", condicionIVA: "1" });
    saveClientHint("30707915281", { condicionVenta: ["1"] });
    expect(loadClientMemory()["30707915281"]).toEqual({ razonSocial: "GSA SA", condicionIVA: "1", condicionVenta: ["1"] });
  });

  it("doc vacío = no-op", () => {
    saveClientHint("", { razonSocial: "X" });
    expect(loadClientMemory()).toEqual({});
  });

  it("localStorage corrupto → {} sin tirar", () => {
    localStorage.setItem(CLIENTES_STORAGE_KEY, "{not json");
    expect(loadClientMemory()).toEqual({});
  });
});

describe("sanitizeClientMemory", () => {
  it("deja pasar hints bien formados", () => {
    const memory = { "30707915281": { razonSocial: "X", condicionIVA: "1", condicionVenta: ["6"] } };
    expect(sanitizeClientMemory(memory)).toEqual(memory);
  });

  it("devuelve {} cuando lo guardado no es un objeto", () => {
    expect(sanitizeClientMemory(null)).toEqual({});
    expect(sanitizeClientMemory([])).toEqual({});
    expect(sanitizeClientMemory("x")).toEqual({});
  });

  it("conserva los campos sanos y tira sólo los roto", () => {
    // Un condicionIVA con tipo raro no tiene por qué hacer perder la razón social.
    const result = sanitizeClientMemory({
      "30707915281": { razonSocial: "X", condicionIVA: 5, condicionVenta: ["6"] },
    });
    expect(result["30707915281"]).toEqual({ razonSocial: "X", condicionVenta: ["6"] });
  });

  it("descarta condicionVenta que no es array de strings", () => {
    // Se escribe derecho en el form y de ahí sale al plan de llenado de RCEL.
    expect(sanitizeClientMemory({ a: { condicionVenta: "6" } })).toEqual({});
    expect(sanitizeClientMemory({ a: { condicionVenta: [6, null] } })).toEqual({});
  });

  it("descarta entradas sin ningún campo usable", () => {
    expect(sanitizeClientMemory({ a: {}, b: null, c: "x" })).toEqual({});
  });
});
