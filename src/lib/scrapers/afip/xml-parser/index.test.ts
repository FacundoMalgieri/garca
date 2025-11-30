import { describe, expect, it } from "vitest";

import { parseAfipXml } from "./index";

describe("AFIP XML Parser", () => {
  describe("parseAfipXml", () => {
    it("should extract exchange rate from Mon_ctz tag", () => {
      const xml = `<invoice><Mon_ctz>1445.50</Mon_ctz></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.exchangeRate).toBe(1445.5);
    });

    it("should extract exchange rate from MonCotiz tag", () => {
      const xml = `<invoice><MonCotiz>1333.00</MonCotiz></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.exchangeRate).toBe(1333);
    });

    it("should extract currency code", () => {
      const xml = `<invoice><MonId>DOL</MonId></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.moneda).toBe("DOL");
    });

    it("should extract total amount", () => {
      const xml = `<invoice><ImpTotal>6600.00</ImpTotal></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.importe).toBe("6600.00");
    });

    it("should extract CAE", () => {
      const xml = `<invoice><CodAutorizacion>75446328198602</CodAutorizacion></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.cae).toBe("75446328198602");
    });

    it("should extract and format date", () => {
      const xml = `<invoice><FchEmis>20251103</FchEmis></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.fecha).toBe("03/11/2025");
    });

    it("should extract punto de venta", () => {
      const xml = `<invoice><PtoVta>3</PtoVta></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.puntoVenta).toBe("3");
    });

    it("should extract invoice number", () => {
      const xml = `<invoice><Nro>79</Nro></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.numero).toBe("79");
    });

    it("should extract invoice type", () => {
      const xml = `<invoice><CbteTipo>19</CbteTipo></invoice>`;
      const result = parseAfipXml(xml);
      expect(result.tipo).toBe("19");
    });

    it("should parse complete XML", () => {
      const xml = `
        <comprobante>
          <CbteTipo>19</CbteTipo>
          <PtoVta>1</PtoVta>
          <Nro>11</Nro>
          <FchEmis>20251103</FchEmis>
          <ImpTotal>6600.00</ImpTotal>
          <MonId>DOL</MonId>
          <Mon_ctz>1445.00</Mon_ctz>
          <CodAutorizacion>75446327068969</CodAutorizacion>
        </comprobante>
      `;
      const result = parseAfipXml(xml);

      expect(result.tipo).toBe("19");
      expect(result.puntoVenta).toBe("1");
      expect(result.numero).toBe("11");
      expect(result.fecha).toBe("03/11/2025");
      expect(result.importe).toBe("6600.00");
      expect(result.moneda).toBe("DOL");
      expect(result.exchangeRate).toBe(1445);
      expect(result.cae).toBe("75446327068969");
    });

    it("should handle empty XML", () => {
      const result = parseAfipXml("");
      expect(result).toEqual({});
    });

    it("should handle malformed XML gracefully", () => {
      const xml = `<incomplete><Mon_ctz>1445`;
      const result = parseAfipXml(xml);
      // Should not throw, may or may not extract partial data
      expect(result).toBeDefined();
    });
  });
});

