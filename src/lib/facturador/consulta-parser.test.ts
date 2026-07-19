import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect,it } from "vitest";

import { parseConsulta } from "@/lib/facturador/consulta-parser";

const html = readFileSync(join(__dirname, "__fixtures__/consulta.html"), "utf8");

describe("parseConsulta", () => {
  it("mapea las filas de datos (jig_par/jig_impar) salteando el header", () => {
    const invoices = parseConsulta(html);
    expect(invoices).toHaveLength(2);
    const inv = invoices[0];
    expect(inv.puntoVenta).toBe(3);
    expect(inv.numero).toBe(88);
    expect(inv.numeroCompleto).toBe("0003-00000088");
    expect(inv.tipoComprobante).toBe(11);
    expect(inv.cae).toBe("86272300559273");
    expect(inv.importeTotal).toBe(1000000);
    expect(inv.cuitReceptor).toBe("30707915281");
  });

  it("parsea la segunda fila (jig_impar) con su importe", () => {
    const invoices = parseConsulta(html);
    expect(invoices[1].numeroCompleto).toBe("0003-00000087");
    expect(invoices[1].importeTotal).toBe(3500000);
    expect(invoices[1].cae).toBe("86272300200799");
  });

  // Regresión [WS4]: la columna importe de Consultas puede llegar con miles separados
  // por punto ("1.234.567"). El parseARNumber robusto NO debe colapsarlos a NaN.
  it("[regresión] importe con miles separados por punto no colapsa a NaN", () => {
    const row = (numeroCompleto: string, importe: string) =>
      `<tr class="jig_par">` +
      `<td>03/07/2026</td>` +
      `<td>Factura C</td>` +
      `<td>${numeroCompleto}</td>` +
      `<td>CUIT</td>` +
      `<td>30707915281</td>` +
      `<td>86272300559273</td>` +
      `<td>${importe}</td>` +
      `</tr>`;
    const htmlInline = row("0003-00000090", "1.234.567") + row("0003-00000091", "1.000.000");
    const invoices = parseConsulta(htmlInline);
    expect(invoices).toHaveLength(2);
    expect(invoices[0].importeTotal).toBe(1234567);
    expect(invoices[0].importeNeto).toBe(1234567);
    expect(invoices[1].importeTotal).toBe(1000000);
  });

  it("[regresión] importe con miles y decimal AR ('3.500.000,00')", () => {
    const htmlInline =
      `<tr class="jig_impar">` +
      `<td>03/07/2026</td>` +
      `<td>Factura C</td>` +
      `<td>0003-00000092</td>` +
      `<td>CUIT</td>` +
      `<td>30707915281</td>` +
      `<td>86272300200799</td>` +
      `<td>3.500.000,00</td>` +
      `</tr>`;
    const invoices = parseConsulta(htmlInline);
    expect(invoices[0].importeTotal).toBe(3500000);
  });
});
