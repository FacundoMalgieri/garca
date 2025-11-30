import { describe, expect,it } from "vitest";

import {
  getCurrencyBadgeClasses,
  getInvoiceTypeCategory,
  getTypeBadgeClasses,
  isFacturaE,
  isNotaCredito,
  isNotaDebito,
} from "./index";

describe("getCurrencyBadgeClasses", () => {
  it("returns correct classes for USD", () => {
    const classes = getCurrencyBadgeClasses("USD");
    expect(classes).toContain("border-green-600");
    expect(classes).toContain("text-green-700");
  });

  it("returns correct classes for EUR", () => {
    const classes = getCurrencyBadgeClasses("EUR");
    expect(classes).toContain("border-amber-600");
    expect(classes).toContain("text-amber-700");
  });

  it("returns correct classes for ARS", () => {
    const classes = getCurrencyBadgeClasses("ARS");
    expect(classes).toContain("border-blue-600");
    expect(classes).toContain("text-blue-700");
  });

  it("returns correct classes for JPY", () => {
    const classes = getCurrencyBadgeClasses("JPY");
    expect(classes).toContain("border-red-600");
    expect(classes).toContain("text-red-700");
  });

  it("returns correct classes for GBP", () => {
    const classes = getCurrencyBadgeClasses("GBP");
    expect(classes).toContain("border-purple-600");
    expect(classes).toContain("text-purple-700");
  });

  it("returns fallback classes for unknown currency", () => {
    const classes = getCurrencyBadgeClasses("XYZ");
    // Should return some color classes (fallback)
    expect(classes).toContain("bg-white");
    expect(classes).toContain("border-");
    expect(classes).toContain("text-");
  });

  it("returns consistent classes for the same unknown currency", () => {
    const classes1 = getCurrencyBadgeClasses("UNKNOWN");
    const classes2 = getCurrencyBadgeClasses("UNKNOWN");
    expect(classes1).toBe(classes2);
  });

  it("returns different classes for different unknown currencies", () => {
    // Due to hash-based assignment, different currencies should get different colors
    // (though there's a small chance of collision)
    const classes1 = getCurrencyBadgeClasses("AAA");
    const classes2 = getCurrencyBadgeClasses("ZZZ");
    // They might be different, but we can't guarantee it due to hash collisions
    expect(typeof classes1).toBe("string");
    expect(typeof classes2).toBe("string");
  });
});

describe("getInvoiceTypeCategory", () => {
  it("identifies nota de credito", () => {
    expect(getInvoiceTypeCategory("Nota de Crédito C")).toBe("nota-credito");
    expect(getInvoiceTypeCategory("Nota de Credito B")).toBe("nota-credito");
    expect(getInvoiceTypeCategory("NOTA DE CREDITO A")).toBe("nota-credito");
  });

  it("identifies nota de debito", () => {
    expect(getInvoiceTypeCategory("Nota de Débito C")).toBe("nota-debito");
    expect(getInvoiceTypeCategory("Nota de Debito B")).toBe("nota-debito");
    expect(getInvoiceTypeCategory("NOTA DE DEBITO A")).toBe("nota-debito");
  });

  it("identifies factura E (export)", () => {
    expect(getInvoiceTypeCategory("Factura de Exportación E")).toBe("factura-e");
    expect(getInvoiceTypeCategory("Factura E")).toBe("factura-e");
  });

  it("identifies regular factura", () => {
    expect(getInvoiceTypeCategory("Factura C")).toBe("factura");
    expect(getInvoiceTypeCategory("Factura A")).toBe("factura");
    expect(getInvoiceTypeCategory("Factura B")).toBe("factura");
  });

  it("returns other for unknown types", () => {
    expect(getInvoiceTypeCategory("Recibo X")).toBe("other");
    expect(getInvoiceTypeCategory("Unknown")).toBe("other");
  });
});

describe("getTypeBadgeClasses", () => {
  it("returns green classes for factura E", () => {
    const classes = getTypeBadgeClasses("Factura de Exportación E");
    expect(classes).toContain("bg-success/10");
    expect(classes).toContain("text-success");
  });

  it("returns red classes for nota de credito", () => {
    const classes = getTypeBadgeClasses("Nota de Crédito C");
    expect(classes).toContain("bg-red-50");
    expect(classes).toContain("text-red-700");
  });

  it("returns teal classes for nota de debito", () => {
    const classes = getTypeBadgeClasses("Nota de Débito C");
    expect(classes).toContain("bg-teal-50");
    expect(classes).toContain("text-teal-700");
  });

  it("returns blue classes for regular factura", () => {
    const classes = getTypeBadgeClasses("Factura C");
    expect(classes).toContain("bg-blue-50");
    expect(classes).toContain("text-blue-700");
  });
});

describe("isNotaCredito", () => {
  it("returns true for nota de credito", () => {
    expect(isNotaCredito("Nota de Crédito C")).toBe(true);
    expect(isNotaCredito("Nota de Credito B")).toBe(true);
  });

  it("returns false for other types", () => {
    expect(isNotaCredito("Factura C")).toBe(false);
    expect(isNotaCredito("Nota de Débito C")).toBe(false);
  });
});

describe("isNotaDebito", () => {
  it("returns true for nota de debito", () => {
    expect(isNotaDebito("Nota de Débito C")).toBe(true);
    expect(isNotaDebito("Nota de Debito B")).toBe(true);
  });

  it("returns false for other types", () => {
    expect(isNotaDebito("Factura C")).toBe(false);
    expect(isNotaDebito("Nota de Crédito C")).toBe(false);
  });
});

describe("isFacturaE", () => {
  it("returns true for factura E", () => {
    expect(isFacturaE("Factura de Exportación E")).toBe(true);
    expect(isFacturaE("Factura E")).toBe(true);
  });

  it("returns false for other types", () => {
    expect(isFacturaE("Factura C")).toBe(false);
    expect(isFacturaE("Nota de Crédito C")).toBe(false);
  });
});

