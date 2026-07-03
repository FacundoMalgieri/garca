import { TIPO_OFICIAL } from "@/lib/facturador/codes";
import type { AFIPInvoice } from "@/types/afip-scraper";

function parseARNumber(s: string): number {
  const clean = s.trim().replace(/\./g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

/** "Factura C" → 11, "Nota de Crédito C" → 13, etc. */
function tipoTextToCode(t: string): number {
  const s = t.toLowerCase();
  if (s.includes("crédito") || s.includes("credito")) return TIPO_OFICIAL.notaCreditoC;
  if (s.includes("débito") || s.includes("debito")) return TIPO_OFICIAL.notaDebitoC;
  return TIPO_OFICIAL.facturaC;
}

/** Parsea la tabla de "Consulta de comprobantes" de RCEL a AFIPInvoice[]. */
export function parseConsulta(html: string): AFIPInvoice[] {
  const tbody = /<table id="tablaComprobantes">([\s\S]*?)<\/table>/i.exec(html)?.[1] ?? "";
  const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].slice(1);
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
