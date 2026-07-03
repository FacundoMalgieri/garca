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
});
