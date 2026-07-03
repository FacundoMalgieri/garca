import type { EmissionPreview, PreviewLinea } from "@/types/facturador";

/** Convierte "3.500.000,00" (formato AR) a number. */
function parseARNumber(s: string): number {
  const clean = s.trim().replace(/\./g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

function extractText(html: string, id: string): string {
  const m = new RegExp(`id="${id}"[^>]*>([^<]*)<`, "i").exec(html);
  return m ? m[1].trim() : "";
}

/** Parsea el HTML del Resumen de RCEL a un EmissionPreview. */
export function parseResumen(
  html: string,
  meta: { puntoVenta: string; tipoComprobante: number },
): EmissionPreview {
  const importeTotal = parseARNumber(extractText(html, "importeTotal"));
  const razonSocialReceptor = extractText(html, "razonSocialReceptor");

  const lineas: PreviewLinea[] = [];
  const tbody = /<table id="detalle">([\s\S]*?)<\/table>/i.exec(html)?.[1] ?? "";
  const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].slice(1);
  for (const r of rows) {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1].replace(/<[^>]*>/g, "").trim());
    if (cells.length < 6) continue;
    lineas.push({
      descripcion: cells[1],
      cantidad: parseARNumber(cells[2]),
      precioUnitario: parseARNumber(cells[4]),
      subtotal: parseARNumber(cells[5]),
    });
  }

  return { ...meta, importeTotal, razonSocialReceptor, lineas, html };
}
