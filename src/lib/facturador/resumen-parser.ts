import { parseARNumber } from "@/lib/facturador/money";
import type { EmissionPreview, PreviewLinea } from "@/types/facturador";

/** Quita tags/entidades y colapsa espacios. */
function stripTags(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

interface Row {
  label: string;
  value: string;
}

/**
 * Mapea pares adyacentes `<th>label</th><td>valor</td>`. Matchea la adyacencia
 * directa (no por `<tr>`) para ser robusto a tablas anidadas dentro de `<td>`
 * (RCEL envuelve los datos del emisor/receptor en una tabla dentro de una celda).
 */
function rowsToMap(fragment: string): Row[] {
  const out: Row[] = [];
  const re = /<th[^>]*>((?:(?!<\/th>)[\s\S])*?)<\/th>\s*<td[^>]*>((?:(?!<\/td>)[\s\S])*?)<\/td>/gi;
  for (const m of fragment.matchAll(re)) {
    out.push({ label: stripTags(m[1]), value: stripTags(m[2]) });
  }
  return out;
}

function findVal(rows: Row[], re: RegExp): string {
  return rows.find((r) => re.test(r.label))?.value ?? "";
}

/** Extrae la sección entre un subtítulo y el siguiente. */
function section(html: string, start: RegExp, end: RegExp): string {
  const s = html.search(start);
  if (s < 0) return "";
  const rest = html.slice(s + (start.exec(html.slice(s))?.[0].length ?? 0));
  const e = rest.search(end);
  return e < 0 ? rest : rest.slice(0, e);
}

/** Ubica la tabla de detalle (la jig_table cuyo header incluye "Producto/Servicio"). */
function detalleTable(html: string): string {
  const tables = [...html.matchAll(/<table[^>]*class="[^"]*jig_table[^"]*"[^>]*>([\s\S]*?)<\/table>/gi)];
  return tables.find((t) => /Producto\/Servicio/i.test(t[1]))?.[1] ?? "";
}

/**
 * Parsea el HTML del Resumen de RCEL (Paso 4) a un EmissionPreview COMPLETO.
 * RCEL v4.9.7: valores sin ids; "Razón Social" aparece en Emisor y Receptor
 * (scopeamos por sección); el detalle es una jig_table de 8 columnas con filas
 * jig_par/jig_impar; los totales van como `<th>label</th><td>valor</td>` (formato AR).
 */
export function parseResumen(
  html: string,
  meta: { puntoVenta: string; tipoComprobante: number },
): EmissionPreview {
  const emisorRows = rowsToMap(section(html, /Datos del Emisor/i, /Datos del Receptor/i));
  const receptorRows = rowsToMap(section(html, /Datos del Receptor/i, /Detalle de la Operaci/i));
  const totalRows = rowsToMap(html);

  const periodo = findVal(emisorRows, /Per[ií]odo Facturado/);
  const emisor = {
    razonSocial: findVal(emisorRows, /Raz[oó]n Social/),
    puntoVenta: findVal(emisorRows, /Punto de Venta/),
    domicilio: findVal(emisorRows, /Domicilio/),
    concepto: findVal(emisorRows, /Conceptos? a Inclu/),
    periodoDesde: /desde:\s*([\d/]+)/i.exec(periodo)?.[1],
    periodoHasta: /hasta:\s*([\d/]+)/i.exec(periodo)?.[1],
    vtoPago: findVal(emisorRows, /Vto\.? para el Pago/) || undefined,
  };

  const receptor = {
    cuit: findVal(receptorRows, /CUIT|Nro\.? Doc|Documento/),
    razonSocial: findVal(receptorRows, /Raz[oó]n Social/),
    domicilio: findVal(receptorRows, /Domicilio/),
    email: findVal(receptorRows, /Email/),
    condicionIVA: findVal(receptorRows, /Condici[oó]n frente al IVA/),
    condicionVenta: findVal(receptorRows, /Condiciones? de Venta/),
  };

  const lineas: PreviewLinea[] = [];
  for (const r of detalleTable(html).matchAll(/<tr[^>]*class="jig_(?:par|impar)"[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const c = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1]));
    if (c.length < 8) continue;
    lineas.push({
      codigo: c[0],
      descripcion: c[1],
      cantidad: parseARNumber(c[2]),
      unidad: c[3],
      precioUnitario: parseARNumber(c[4]),
      porcentajeBonificacion: parseARNumber(c[5]),
      importeBonificacion: parseARNumber(c[6]),
      subtotal: parseARNumber(c[7]),
    });
  }

  return {
    ...meta,
    emisor,
    receptor,
    lineas,
    subtotal: parseARNumber(findVal(totalRows, /^Subtotal:/)),
    importeOtrosTributos: parseARNumber(findVal(totalRows, /Importe Otros Tributos/)),
    importeTotal: parseARNumber(findVal(totalRows, /Importe Total/)),
    html,
  };
}
