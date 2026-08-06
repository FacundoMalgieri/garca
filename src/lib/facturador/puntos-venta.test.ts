import { describe, expect, it } from "vitest";

import { sanitizePuntosDeVenta } from "@/lib/facturador/puntos-venta";

const PV_OK = {
  value: "3",
  label: " 00003-Domicilio",
  tipos: [{ value: "2", label: "Factura C" }],
};

describe("sanitizePuntosDeVenta", () => {
  it("deja pasar una lista bien formada", () => {
    expect(sanitizePuntosDeVenta([PV_OK])).toEqual([PV_OK]);
  });

  it("devuelve null cuando no hay nada usable", () => {
    // null = "no conocemos los PV" → el facturador cae al input de texto libre.
    expect(sanitizePuntosDeVenta(null)).toBeNull();
    expect(sanitizePuntosDeVenta(undefined)).toBeNull();
    expect(sanitizePuntosDeVenta("no es un array")).toBeNull();
    expect(sanitizePuntosDeVenta({})).toBeNull();
    expect(sanitizePuntosDeVenta([])).toBeNull();
  });

  describe("sesiones guardadas por versiones viejas", () => {
    // El bug real: `garca_pdv` se parsea de localStorage sin validar. Un PV sin
    // `tipos` pasaba el JSON.parse y después tiraba
    // "Cannot read properties of undefined (reading 'some')", rompiendo
    // /facturar entero.
    it("descarta un PV sin tipos", () => {
      expect(sanitizePuntosDeVenta([{ value: "3", label: "x" }])).toBeNull();
    });

    it("descarta un PV cuyo tipos no es un array", () => {
      expect(sanitizePuntosDeVenta([{ ...PV_OK, tipos: "Factura C" }])).toBeNull();
      expect(sanitizePuntosDeVenta([{ ...PV_OK, tipos: null }])).toBeNull();
    });

    it("descarta un PV con tipos vacío", () => {
      // Vacío no es lo mismo que desconocido: si se dejara pasar con [], el form
      // concluiría "este PV no puede emitir Factura C" y bloquearía la emisión
      // de un PV que en realidad sí puede.
      expect(sanitizePuntosDeVenta([{ ...PV_OK, tipos: [] }])).toBeNull();
    });

    it("filtra tipos malformados y descarta el PV si no queda ninguno", () => {
      expect(sanitizePuntosDeVenta([{ ...PV_OK, tipos: [{ value: 2 }, null, "x"] }])).toBeNull();
    });

    it("conserva los tipos válidos y descarta los que no", () => {
      const result = sanitizePuntosDeVenta([
        { ...PV_OK, tipos: [{ value: "2", label: "Factura C" }, { label: "sin value" }] },
      ]);
      expect(result).toEqual([PV_OK]);
    });

    it("conserva los PV sanos y tira solo los roto", () => {
      const result = sanitizePuntosDeVenta([PV_OK, { value: "4", label: "roto" }]);
      expect(result).toEqual([PV_OK]);
    });

    it("descarta entradas que no son objetos", () => {
      expect(sanitizePuntosDeVenta([PV_OK, null, "x", 3])).toEqual([PV_OK]);
    });

    it("descarta un PV sin value usable", () => {
      expect(sanitizePuntosDeVenta([{ value: "", label: "x", tipos: PV_OK.tipos }])).toBeNull();
      expect(sanitizePuntosDeVenta([{ value: 3, label: "x", tipos: PV_OK.tipos }])).toBeNull();
    });

    it("usa el value como label cuando falta", () => {
      const result = sanitizePuntosDeVenta([{ value: "3", tipos: PV_OK.tipos }]);
      expect(result).toEqual([{ value: "3", label: "3", tipos: PV_OK.tipos }]);
    });
  });
});
