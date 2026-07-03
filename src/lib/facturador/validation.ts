import { validateCuit } from "@/lib/facturador/cuit";
import { addDays } from "@/lib/facturador/dates";
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

/** Suma total de las líneas (precio × cantidad − bonificación). */
export function totalImporte(p: Plantilla): number {
  return p.lineas.reduce((acc, l) => {
    const bruto = l.precioUnitario * l.cantidad;
    const bonif = bruto * ((l.bonificacion ?? 0) / 100);
    return acc + (bruto - bonif);
  }, 0);
}

/** Valida el input antes de emitir. `today` inyectable para tests. */
export function validateEmissionInput(p: Plantilla, today: Date): ValidationResult {
  const errors: string[] = [];

  // CUIT: solo si el tipo de documento es CUIT ("80")
  if (p.cliente.tipoDoc === "80" && !validateCuit(p.cliente.nroDoc)) {
    errors.push("CUIT del receptor inválido");
  }

  if (totalImporte(p) <= 0) {
    errors.push("El importe total debe ser mayor a 0");
  }

  const vto = p.periodo?.vtoPago;
  if (vto) {
    const vtoDate = parseDMY(vto);
    const max = addDays(today, 10);
    const vtoDay = vtoDate ? new Date(vtoDate.getFullYear(), vtoDate.getMonth(), vtoDate.getDate()) : null;
    const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    if (!vtoDay || vtoDay.getTime() > maxDay.getTime()) {
      errors.push("El vencimiento de pago no puede superar los 10 días desde hoy");
    }
  }

  return { ok: errors.length === 0, errors };
}
