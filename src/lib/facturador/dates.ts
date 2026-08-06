/** Formatea una fecha a DD/MM/YYYY (formato de RCEL). */
export function formatDMY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Suma días a una fecha (no muta el original). */
export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** Devuelve el período (desde/hasta) del mes anterior completo, en DD/MM/YYYY. */
export function previousMonthPeriod(today: Date): { desde: string; hasta: string } {
  const desde = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const hasta = new Date(today.getFullYear(), today.getMonth(), 0);
  return { desde: formatDMY(desde), hasta: formatDMY(hasta) };
}

/** Vencimiento de pago por defecto: hoy + 10 días (tope máximo de AFIP). */
export function defaultVtoPago(today: Date): string {
  return formatDMY(addDays(today, 10));
}

/**
 * DD/MM/YYYY -> YYYY-MM-DD, el formato que habla `<input type="date">`.
 *
 * La Plantilla guarda DD/MM/YYYY porque es lo que espera RCEL, así que la
 * conversión vive sólo en el borde de la UI.
 *
 * @returns "" si no parsea (el input nativo lo interpreta como vacío).
 */
export function dmyToISO(dmy: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy.trim());
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/**
 * YYYY-MM-DD -> DD/MM/YYYY, de vuelta al formato de RCEL.
 *
 * @returns "" si no parsea (pasa cuando el usuario limpia el input).
 */
export function isoToDMY(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}
