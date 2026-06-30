/**
 * Datos deterministas para el mockup del panel en el hero de la landing.
 * NO es la fixture del demo (esa pesa ~36 KB y se carga sólo al clickear "Ver demo").
 * Estos son números chicos, on-brand, pensados para verse bien en el mockup.
 */

export interface MockChartPoint {
  mes: string;
  total: number; // acumulado anual en ARS
}

export interface MockInvoiceRow {
  fecha: string; // dd/mm
  detalle: string;
  moneda: "ARS" | "USD";
  monto: number; // en ARS equivalente
}

export interface MockPanel {
  categoria: string; // A..K
  topeAnual: number;
  acumuladoAnual: number;
  progresoTope: number; // 0..100
  acumulado: readonly MockChartPoint[];
  comprobantes: readonly MockInvoiceRow[];
}

const TOPE_G = 44_000_000;
const ACUMULADO = 38_720_000;

export const MOCK_PANEL: MockPanel = {
  categoria: "G",
  topeAnual: TOPE_G,
  acumuladoAnual: ACUMULADO,
  progresoTope: Math.round((ACUMULADO / TOPE_G) * 100),
  acumulado: [
    { mes: "Ene", total: 4_600_000 },
    { mes: "Feb", total: 9_800_000 },
    { mes: "Mar", total: 15_200_000 },
    { mes: "Abr", total: 21_000_000 },
    { mes: "May", total: 27_500_000 },
    { mes: "Jun", total: 33_400_000 },
    { mes: "Jul", total: 38_720_000 },
  ],
  comprobantes: [
    { fecha: "08/07", detalle: "Factura E · Servicios", moneda: "USD", monto: 1_240_000 },
    { fecha: "03/07", detalle: "Factura C · Consultoría", moneda: "ARS", monto: 680_000 },
    { fecha: "28/06", detalle: "Factura E · Desarrollo", moneda: "USD", monto: 2_010_000 },
  ],
};
