import { beforeEach, describe, expect, it } from "vitest";

import { useTemplates } from "@/hooks/useTemplates";

import { act, renderHook } from "@testing-library/react";

describe("useTemplates", () => {
  beforeEach(() => localStorage.clear());

  it("arranca vacío y agrega una plantilla", () => {
    const { result } = renderHook(() => useTemplates());
    expect(result.current.templates).toEqual([]);
    act(() => {
      result.current.save({
        nombre: "GSA", puntoDeVenta: "3", concepto: "servicios",
        cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "GSA", condicionVenta: ["6"] },
        lineas: [{ descripcion: "Serv", cantidad: 1, unidad: "7", precioUnitario: 1000 }],
      });
    });
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].id).toBeTruthy();
  });

  it("elimina una plantilla", () => {
    const { result } = renderHook(() => useTemplates());
    let id = "";
    act(() => {
      id = result.current.save({
        nombre: "X", puntoDeVenta: "3", concepto: "servicios",
        cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "30707915281", razonSocial: "X", condicionVenta: ["6"] },
        lineas: [{ descripcion: "s", cantidad: 1, unidad: "7", precioUnitario: 1 }],
      }).id;
    });
    act(() => { result.current.remove(id); });
    expect(result.current.templates).toEqual([]);
  });
});
