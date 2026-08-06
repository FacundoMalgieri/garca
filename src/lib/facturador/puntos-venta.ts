/**
 * Saneado de los puntos de venta que vienen de localStorage.
 *
 * `garca_pdv` se persiste como JSON y se rehidrata en sesiones futuras, así que
 * su forma es la que tenía la versión que lo guardó — no la del tipo de hoy. El
 * `JSON.parse` sólo garantiza que sea JSON válido: un PV sin `tipos` pasaba
 * derecho y recién explotaba al usarse ("Cannot read properties of undefined
 * (reading 'some')"), dejando /facturar en pantalla de error.
 */

import type { PuntoDeVenta } from "@/types/afip-scraper";

type TipoComprobante = PuntoDeVenta["tipos"][number];

function sanitizeTipo(raw: unknown): TipoComprobante | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { value, label } = raw as Partial<TipoComprobante>;
  if (typeof value !== "string" || value === "") return null;
  return { value, label: typeof label === "string" ? label : value };
}

function sanitizePuntoDeVenta(raw: unknown): PuntoDeVenta | null {
  if (typeof raw !== "object" || raw === null) return null;

  const { value, label, tipos } = raw as Partial<PuntoDeVenta>;
  if (typeof value !== "string" || value === "") return null;

  // `tipos` vacío NO es lo mismo que desconocido. Si un PV sin universo se
  // dejara pasar con [], el form concluiría "no puede emitir Factura C" y
  // bloquearía la emisión de un PV que probablemente sí puede. Se descarta el PV
  // entero: con la lista en null el facturador cae al input de texto libre, que
  // es el comportamiento correcto para "no sabemos".
  if (!Array.isArray(tipos)) return null;
  const tiposLimpios = tipos.map(sanitizeTipo).filter((t): t is TipoComprobante => t !== null);
  if (tiposLimpios.length === 0) return null;

  return { value, label: typeof label === "string" ? label : value, tipos: tiposLimpios };
}

/**
 * Filtra los puntos de venta que no tienen forma usable.
 *
 * @returns Los PV sanos, o null si no quedó ninguno (el facturador lo interpreta
 *   como "no disponibles" y usa el input de texto libre para el PV).
 */
export function sanitizePuntosDeVenta(raw: unknown): PuntoDeVenta[] | null {
  if (!Array.isArray(raw)) return null;

  const limpios = raw
    .map(sanitizePuntoDeVenta)
    .filter((pv): pv is PuntoDeVenta => pv !== null);

  return limpios.length > 0 ? limpios : null;
}
