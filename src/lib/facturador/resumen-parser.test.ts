import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect,it } from "vitest";

import { parseResumen } from "@/lib/facturador/resumen-parser";

const html = readFileSync(join(__dirname, "__fixtures__/resumen.html"), "utf8");

describe("parseResumen", () => {
  it("extrae importe total, receptor y líneas", () => {
    const preview = parseResumen(html, { puntoVenta: "3", tipoComprobante: 11 });
    expect(preview.importeTotal).toBe(3500000);
    expect(preview.razonSocialReceptor).toBe("GSA COLLECTIONS ARGENTINA SA");
    expect(preview.lineas).toHaveLength(1);
    expect(preview.lineas[0].descripcion).toContain("120 horas");
    expect(preview.lineas[0].subtotal).toBe(3500000);
    expect(preview.puntoVenta).toBe("3");
  });
});
