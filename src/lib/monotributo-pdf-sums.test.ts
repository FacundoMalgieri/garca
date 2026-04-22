import { describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { computeMonotributoPdfSums, formatRecategorizacionLine } from "./monotributo-pdf-sums";

describe("computeMonotributoPdfSums", () => {
  it("separa total del período de ingresos de la ventana de 12 meses", () => {
    const fixed = new Date(2026, 0, 15);
    vi.setSystemTime(fixed);

    const inWindow1: AFIPInvoice = {
      fecha: "15/07/2025",
      tipo: "Factura C",
      tipoComprobante: 11,
      puntoVenta: 1,
      numero: 1,
      numeroCompleto: "0001-00000001",
      cuitEmisor: "1",
      razonSocialEmisor: "A",
      cuitReceptor: "2",
      razonSocialReceptor: "B",
      importeNeto: 0,
      importeIVA: 0,
      importeTotal: 1_000_000,
      moneda: "ARS",
      cae: "1",
    };

    const outOfWindow: AFIPInvoice = {
      ...inWindow1,
      fecha: "15/01/2020",
      importeTotal: 50_000_000,
    };

    const sums = computeMonotributoPdfSums([inWindow1, outOfWindow], {}, fixed);
    expect(sums.totalPeriodoConsultado).toBe(51_000_000);
    expect(sums.totalVentanaRecategorizacion).toBe(1_000_000);
    expect(sums.hasFacturasEnVentana).toBe(true);
    expect(formatRecategorizacionLine(sums)).toMatch(/ventana/);

    vi.useRealTimers();
  });
});
