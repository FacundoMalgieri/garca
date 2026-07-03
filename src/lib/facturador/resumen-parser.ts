import { parseARNumber } from "@/lib/facturador/money";
import type { EmissionPreview, PreviewLinea } from "@/types/facturador";

/**
 * Devuelve el valor de la fila `<tr><th>label</th><td>valor</td></tr>` dentro de
 * un fragmento HTML (tolera atributos y anidado). `label` se matchea flexible.
 */
function rowValue(fragment: string, label: RegExp): string {
  const re = new RegExp(`<th[^>]*>\\s*${label.source}[\\s\\S]*?</th>\\s*<td[^>]*>([\\s\\S]*?)</td>`, "i");
  const m = re.exec(fragment);
  return m ? m[1].replace(/<[^>]*>/g, "").trim() : "";
}

/** Extrae la sección "Datos del Receptor" (hasta el próximo subtítulo de sección). */
function receptorSection(html: string): string {
  const start = html.search(/Datos del Receptor/i);
  if (start < 0) return "";
  const rest = html.slice(start + "Datos del Receptor".length);
  const nextSection = rest.search(/jig_subtitulo_seccion|Detalle de la Operaci/i);
  return nextSection < 0 ? rest : rest.slice(0, nextSection);
}

/** Ubica la tabla de detalle (la jig_table cuyo header incluye "Producto/Servicio"). */
function detalleTable(html: string): string {
  const tables = [...html.matchAll(/<table[^>]*class="[^"]*jig_table[^"]*"[^>]*>([\s\S]*?)<\/table>/gi)];
  const match = tables.find((t) => /Producto\/Servicio/i.test(t[1]));
  return match ? match[1] : "";
}

/**
 * Parsea el HTML del Resumen de RCEL (Paso 4) a un EmissionPreview.
 * RCEL v4.9.7: sin ids en los valores; "Razón Social" aparece en Emisor y Receptor
 * (scopeamos al Receptor); el detalle tiene 8 columnas (Código, Producto/Servicio,
 * Cant., U. Medida, Prec. Unitario, % Bon., Importe Bon., Subtotal) con filas
 * class jig_par/jig_impar; el Importe Total va como <th>label</th><td><b>valor</b></td>.
 */
export function parseResumen(
  html: string,
  meta: { puntoVenta: string; tipoComprobante: number },
): EmissionPreview {
  // Importe Total: primer número tras el label "Importe Total:" (distinto de "Otros Tributos").
  const totalMatch = /Importe Total:[\s\S]*?<td[^>]*>\s*(?:<b>)?\s*([\d.,]+)/i.exec(html);
  const importeTotal = parseARNumber(totalMatch ? totalMatch[1] : "");

  const razonSocialReceptor = rowValue(receptorSection(html), /Raz[oó]n Social/);

  const lineas: PreviewLinea[] = [];
  const rows = [...detalleTable(html).matchAll(/<tr[^>]*class="jig_(?:par|impar)"[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const r of rows) {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1].replace(/<[^>]*>/g, "").trim());
    if (cells.length < 8) continue;
    lineas.push({
      descripcion: cells[1],
      cantidad: parseARNumber(cells[2]),
      precioUnitario: parseARNumber(cells[4]),
      subtotal: parseARNumber(cells[7]),
    });
  }

  return { ...meta, importeTotal, razonSocialReceptor, lineas, html };
}
