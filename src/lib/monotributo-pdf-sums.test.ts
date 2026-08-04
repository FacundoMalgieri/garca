import { describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import {
  computeMonotributoPdfSums,
  formatRecategorizacionLine,
  formatVentanaVigenteLine,
} from "./monotributo-pdf-sums";

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

  it("expone la ventana cerrada y marca la ventana en curso como parcial", () => {
    const today = new Date(2026, 7, 4); // 04/08/2026

    const factura = (fecha: string, importeTotal: number): AFIPInvoice =>
      ({
        fecha,
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
        importeTotal,
        moneda: "ARS",
        cae: "1",
      }) as AFIPInvoice;

    const sums = computeMonotributoPdfSums(
      [
        factura("10/08/2025", 10_000_000), // sólo ventana cerrada (Jul 25 - Jun 26)
        factura("10/03/2026", 5_000_000), // ambas ventanas
        factura("10/07/2026", 2_000_000), // sólo ventana en curso (Ene - Dic 26)
      ],
      {},
      today
    );

    expect(sums.totalVentanaCerrada).toBe(15_000_000);
    expect(sums.hasFacturasEnVentanaCerrada).toBe(true);
    expect(sums.ventanaCerradaDesde).toBe("2025-07");
    expect(sums.ventanaCerradaHasta).toBe("2026-06");

    expect(sums.totalVentanaRecategorizacion).toBe(7_000_000);
    expect(sums.mesesCerrados).toBe(7);
    expect(sums.ventanaCompleta).toBe(false);
    expect(sums.totalVentanaAnualizado).toBeCloseTo(12_000_000, 2);

    expect(formatRecategorizacionLine(sums)).toContain("(7 de 12 meses facturados)");
    expect(formatVentanaVigenteLine(sums)).toContain("Jul 2025 a Jun 2026");
  });
});
