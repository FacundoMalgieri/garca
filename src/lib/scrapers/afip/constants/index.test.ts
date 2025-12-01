import { describe, expect, it } from "vitest";

import { DEFAULT_HEADLESS, DEFAULT_TIMEOUT, ELEMENT_TIMEOUT, MAX_RETRIES, NEW_TAB_TIMEOUT, SELECTORS, TIMING, URLS } from "./index";

describe("AFIP Scraper Constants", () => {
  describe("Configuration", () => {
    it("should have reasonable default timeout", () => {
      expect(DEFAULT_TIMEOUT).toBeGreaterThanOrEqual(60000); // At least 1 minute
      expect(DEFAULT_TIMEOUT).toBeLessThanOrEqual(300000); // At most 5 minutes
    });

    it("should have element timeout of at least 60 seconds", () => {
      expect(ELEMENT_TIMEOUT).toBeGreaterThanOrEqual(60000); // At least 1 minute
    });

    it("should have new tab timeout of at least 60 seconds", () => {
      expect(NEW_TAB_TIMEOUT).toBeGreaterThanOrEqual(60000); // At least 1 minute
    });

    it("should default to headless mode", () => {
      expect(DEFAULT_HEADLESS).toBe(true);
    });

    it("should have retry count", () => {
      expect(MAX_RETRIES).toBeGreaterThanOrEqual(1);
    });
  });

  describe("URLs", () => {
    it("should have valid AFIP login URL", () => {
      expect(URLS.LOGIN).toContain("afip.gob.ar");
      expect(URLS.LOGIN).toContain("login");
    });

    it("should have valid RCEL URL", () => {
      expect(URLS.RCEL).toContain("rcel");
    });
  });

  describe("Selectors", () => {
    it("should have login selectors defined", () => {
      expect(SELECTORS.LOGIN.CUIT_INPUT).toBeDefined();
      expect(SELECTORS.LOGIN.PASSWORD_INPUT).toBeDefined();
      expect(SELECTORS.LOGIN.SIGUIENTE_BUTTON).toBeDefined();
      expect(SELECTORS.LOGIN.INGRESAR_BUTTON).toBeDefined();
    });

    it("should have navigation selectors defined", () => {
      expect(SELECTORS.NAVIGATION.COMPROBANTES_LINK).toBeDefined();
      expect(SELECTORS.NAVIGATION.COMPANY_BUTTON).toBeDefined();
      expect(SELECTORS.NAVIGATION.CONSULTAS_BUTTON).toBeDefined();
    });

    it("should have filter selectors defined", () => {
      expect(SELECTORS.FILTERS.DATE_FROM).toBeDefined();
      expect(SELECTORS.FILTERS.DATE_TO).toBeDefined();
      expect(SELECTORS.FILTERS.BUSCAR_BUTTON).toBeDefined();
    });

    it("should have table selectors defined", () => {
      expect(SELECTORS.TABLE.CONTAINER).toBeDefined();
      expect(SELECTORS.TABLE.DATA_ROWS).toBeDefined();
    });

    it("should generate XML selector with invoice number", () => {
      const selector = SELECTORS.XML.DOWNLOAD_BUTTON("0001-00000001");
      expect(selector).toContain("0001-00000001");
      expect(selector).toContain("XML");
    });
  });

  describe("Timing", () => {
    it("should have all timing values as positive numbers", () => {
      Object.values(TIMING).forEach((value) => {
        expect(value).toBeGreaterThan(0);
      });
    });
  });
});

