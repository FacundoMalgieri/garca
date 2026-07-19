import type { AFIPInvoice } from "@/types/afip-scraper";

/**
 * Selecciona, de la lista de comprobantes emitidos leída de Consultas, el que
 * corresponde a una emisión recién hecha (resolución de CAE — H1 del plan).
 *
 * Match por tipo de comprobante oficial + punto de venta. El PV se compara
 * NUMÉRICAMENTE: RCEL/Consultas puede devolver el PV con padding ("00003") o
 * como número, y `plantilla.puntoDeVenta` es un string sin padding ("3");
 * `Number(...)` los normaliza (evita el bug del compare por string).
 *
 * De los candidatos elige el de mayor `numero` (el más reciente = el recién
 * emitido). Si no hay candidatos devuelve `undefined` — el caller mantiene
 * `cae:""` (Contrato B: "emitida, CAE pendiente"), NO throw.
 *
 * NOTA: no se matchea por id de comprobante — `consultarEmitidas`/`parseConsulta`
 * no capturan ningún id y `AFIPInvoice` no tiene ese campo (fuera de alcance).
 */
export function pickEmittedMatch(
  emitidas: AFIPInvoice[],
  target: { oficial: number; puntoVenta: string | number },
): AFIPInvoice | undefined {
  const pv = Number(target.puntoVenta);
  return emitidas
    .filter((i) => i.tipoComprobante === target.oficial && Number(i.puntoVenta) === pv)
    .sort((a, b) => b.numero - a.numero)[0];
}
