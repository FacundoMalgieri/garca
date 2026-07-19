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
