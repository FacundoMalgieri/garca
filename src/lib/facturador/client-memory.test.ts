import { beforeEach, describe, expect, it } from "vitest";

import { CLIENTES_STORAGE_KEY, loadClientMemory, saveClientHint } from "@/lib/facturador/client-memory";

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
