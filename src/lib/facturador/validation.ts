import { validateCuit } from "@/lib/facturador/cuit";
import { addDays } from "@/lib/facturador/dates";
import { lineSubtotal, round2 } from "@/lib/facturador/money";
import type { Plantilla } from "@/types/facturador";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Convierte DD/MM/YYYY a Date (local). Devuelve null si no parsea. */
function parseDMY(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

/** Medianoche local: acá se comparan días, no instantes. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Días que AFIP admite entre hoy y el vencimiento para el pago. */
export const VTO_PAGO_MAX_DIAS = 10;

/**
 * Valida el vencimiento de pago contra la ventana que acepta RCEL: [hoy, hoy+10].
 *
 * El techo ya estaba; el piso faltaba, y esa era la mitad que rompía. Una plantilla
 * guardada conserva el `vtoPago` tal cual se guardó, así que al mes siguiente queda
 * en el pasado: pasaba la validación, RCEL rechazaba la pantalla 1 con un alert
 * nativo —que Playwright descarta solo, sin handler de `dialog`— y la emisión moría
 * 30s más tarde esperando `#idivareceptor`, un selector de la pantalla 2 a la que
 * nunca había llegado. Caso real del 03/09/2026.
 *
 * @param vto   - Fecha en DD/MM/YYYY (el formato que guarda la Plantilla).
 * @param today - Hoy, inyectable para tests.
 * @returns El mensaje de error, o null si la fecha sirve.
 */
export function vtoPagoError(vto: string, today: Date): string | null {
  const vtoDay = parseDMY(vto);
  if (!vtoDay) return "El vencimiento de pago no es una fecha válida";

  if (vtoDay.getTime() < startOfDay(today).getTime()) {
    return "El vencimiento de pago no puede ser anterior a hoy";
  }
  if (vtoDay.getTime() > startOfDay(addDays(today, VTO_PAGO_MAX_DIAS)).getTime()) {
    return `El vencimiento de pago no puede superar los ${VTO_PAGO_MAX_DIAS} días desde hoy`;
  }
  return null;
}

/** Suma total de las líneas, cada una redondeada a 2 decimales. */
export function totalImporte(p: Plantilla): number {
  return round2(p.lineas.reduce((acc, l) => acc + lineSubtotal(l), 0));
}

/** Valida el input antes de emitir. `today` inyectable para tests. */
export function validateEmissionInput(p: Plantilla, today: Date): ValidationResult {
  const errors: string[] = [];

  // CUIT: solo si el tipo de documento es CUIT ("80")
  if (p.cliente.tipoDoc === "80" && !validateCuit(p.cliente.nroDoc)) {
    errors.push("CUIT del receptor inválido");
  }

  if (p.lineas.length === 0) {
    errors.push("El comprobante debe tener al menos una línea");
  } else if (p.lineas.some((l) => l.descripcion.trim() === "")) {
    errors.push("Todas las líneas deben tener descripción");
  }

  if (totalImporte(p) <= 0) {
    errors.push("El importe total debe ser mayor a 0");
  }

  // El vencimiento sólo viaja a RCEL fuera de "productos" (ver buildFillPlan), así
  // que ahí un valor viejo tiene que frenar la emisión acá en vez de llegar a la
  // pantalla 1 y volver como un timeout sin explicación. Que falte no se valida:
  // no hay evidencia de que RCEL lo exija, y bloquear por las dudas rompería un
  // camino que hoy funciona.
  const vto = p.concepto !== "productos" ? p.periodo?.vtoPago : undefined;
  if (vto) {
    const err = vtoPagoError(vto, today);
    if (err) errors.push(err);
  }

  return { ok: errors.length === 0, errors };
}
