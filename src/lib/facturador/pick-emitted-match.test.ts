import { describe, expect, it } from "vitest";

import { pickEmittedMatch } from "@/lib/facturador/pick-emitted-match";
import type { AFIPInvoice } from "@/types/afip-scraper";

function inv(partial: Partial<AFIPInvoice>): AFIPInvoice {
  return {
    fecha: "18/07/2026",
    tipo: "FACTURA C",
    tipoComprobante: 11,
    puntoVenta: 3,
    numero: 1,
    numeroCompleto: "00003-00000001",
    cuitEmisor: "",
    razonSocialEmisor: "",
    cuitReceptor: "",
    razonSocialReceptor: "",
    importeNeto: 0,
    importeIVA: 0,
    importeTotal: 1000,
    moneda: "PES",
    ...partial,
  };
}

describe("pickEmittedMatch", () => {
  it("matchea por tipo + PV aunque el padding del PV difiera", () => {
    // target.puntoVenta = "3" (sin padding), invoice.puntoVenta = 3.
    const emitidas = [inv({ puntoVenta: 3, numero: 5, numeroCompleto: "00003-00000005" })];

    const match = pickEmittedMatch(emitidas, { oficial: 11, puntoVenta: "3" });

    expect(match?.numeroCompleto).toBe("00003-00000005");
  });

  it("elige el comprobante de mayor numero (el recién emitido)", () => {
    const emitidas = [
      inv({ numero: 7, numeroCompleto: "00003-00000007" }),
      inv({ numero: 9, numeroCompleto: "00003-00000009" }),
      inv({ numero: 8, numeroCompleto: "00003-00000008" }),
    ];

    const match = pickEmittedMatch(emitidas, { oficial: 11, puntoVenta: "3" });

    expect(match?.numero).toBe(9);
  });

  it("descarta comprobantes de otro tipo o de otro PV", () => {
    const emitidas = [
      inv({ tipoComprobante: 13, numero: 20 }), // NC, no matchea el tipo 11
      inv({ puntoVenta: 4, numero: 21 }), // otro PV
      inv({ puntoVenta: 3, numero: 6, numeroCompleto: "00003-00000006" }),
    ];

    const match = pickEmittedMatch(emitidas, { oficial: 11, puntoVenta: "3" });

    expect(match?.numero).toBe(6);
  });

  it("devuelve undefined cuando no hay match", () => {
    const emitidas = [inv({ tipoComprobante: 13 })];

    expect(pickEmittedMatch(emitidas, { oficial: 11, puntoVenta: "3" })).toBeUndefined();
    expect(pickEmittedMatch([], { oficial: 11, puntoVenta: "3" })).toBeUndefined();
  });

  it("normaliza el PV numérico del target también con padding", () => {
    const emitidas = [inv({ puntoVenta: 3, numero: 4, numeroCompleto: "00003-00000004" })];

    const match = pickEmittedMatch(emitidas, { oficial: 11, puntoVenta: "00003" });

    expect(match?.numero).toBe(4);
  });
});
