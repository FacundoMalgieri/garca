import { TIPO_OFICIAL } from "@/lib/facturador/codes";
import { parseARNumber } from "@/lib/facturador/money";
import type { AFIPInvoice } from "@/types/afip-scraper";

/** "Factura C" → 11, "Nota de Crédito C" → 13, etc. */
function tipoTextToCode(t: string): number {
  const s = t.toLowerCase();
  if (s.includes("crédito") || s.includes("credito")) return TIPO_OFICIAL.notaCreditoC;
  if (s.includes("débito") || s.includes("debito")) return TIPO_OFICIAL.notaDebitoC;
  return TIPO_OFICIAL.facturaC;
}

/**
 * Parsea la tabla de "Consulta de comprobantes" de RCEL a AFIPInvoice[].
 * RCEL v4.9.7: la tabla no tiene id (es `table.jig_table`) y las filas de datos
 * usan class `jig_par`/`jig_impar` (el header es un `<tr>` sin clase). Localizamos
 * las filas por esas clases en vez de por id de tabla, y así se saltea el header.
 */
export function parseConsulta(html: string): AFIPInvoice[] {
  const rows = [...html.matchAll(/<tr[^>]*class="jig_(?:par|impar)"[^>]*>([\s\S]*?)<\/tr>/gi)];
  const out: AFIPInvoice[] = [];
  for (const r of rows) {
    const c = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1].replace(/<[^>]*>/g, "").trim());
    if (c.length < 7) continue;
    const numeroCompleto = c[2];
    const [pv, nro] = numeroCompleto.split("-");
    out.push({
      fecha: c[0],
      tipo: c[1],
      tipoComprobante: tipoTextToCode(c[1]),
      puntoVenta: Number(pv),
      numero: Number(nro),
      numeroCompleto,
      cuitEmisor: "",
      razonSocialEmisor: "",
      cuitReceptor: c[4],
      razonSocialReceptor: "",
      importeNeto: parseARNumber(c[6]),
      importeIVA: 0,
      importeTotal: parseARNumber(c[6]),
      moneda: "PES",
      cae: c[5],
    });
  }
  return out;
}
