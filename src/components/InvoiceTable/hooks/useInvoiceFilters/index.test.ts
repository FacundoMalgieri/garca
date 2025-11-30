import { describe, expect, it } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { useInvoiceFilters } from "./index";

import { act, renderHook } from "@testing-library/react";

const mockInvoices: AFIPInvoice[] = [
  {
    fecha: "15/01/2025",
    tipo: "Factura C",
    tipoComprobante: 11,
    puntoVenta: 1,
    numero: 100,
    numeroCompleto: "00001-00000100",
    cuitEmisor: "20123456789",
    razonSocialEmisor: "Test Emisor",
    cuitReceptor: "30123456789",
    razonSocialReceptor: "Cliente ABC",
    importeNeto: 1000,
    importeIVA: 210,
    importeTotal: 1210,
    moneda: "ARS",
  },
  {
    fecha: "20/02/2025",
    tipo: "Factura E",
    tipoComprobante: 19,
    puntoVenta: 1,
    numero: 101,
    numeroCompleto: "00001-00000101",
    cuitEmisor: "20123456789",
    razonSocialEmisor: "Test Emisor",
    cuitReceptor: "30999888777",
    razonSocialReceptor: "Cliente XYZ",
    importeNeto: 2000,
    importeIVA: 0,
    importeTotal: 2000,
    moneda: "USD",
    xmlData: { exchangeRate: 1000 },
  },
  {
    fecha: "10/01/2025",
    tipo: "Factura C",
    tipoComprobante: 11,
    puntoVenta: 1,
    numero: 99,
    numeroCompleto: "00001-00000099",
    cuitEmisor: "20123456789",
    razonSocialEmisor: "Test Emisor",
    cuitReceptor: "30555666777",
    razonSocialReceptor: "Cliente DEF",
    importeNeto: 500,
    importeIVA: 105,
    importeTotal: 605,
    moneda: "ARS",
  },
];

describe("useInvoiceFilters", () => {
  describe("initial state", () => {
    it("should return all invoices initially", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));
      expect(result.current.filteredAndSortedInvoices).toHaveLength(3);
    });

    it("should have default sort by fecha desc", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));
      expect(result.current.sortField).toBe("fecha");
      expect(result.current.sortDirection).toBe("desc");
    });

    it("should have no active filters initially", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));
      expect(result.current.activeFiltersCount).toBe(0);
    });

    it("should extract unique types", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));
      expect(result.current.uniqueTypes).toEqual(["Factura C", "Factura E"]);
    });
  });

  describe("filtering", () => {
    it("should filter by search text (numero)", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.setSearchText("00000100");
      });

      expect(result.current.filteredAndSortedInvoices).toHaveLength(1);
      expect(result.current.filteredAndSortedInvoices[0].numeroCompleto).toBe("00001-00000100");
    });

    it("should filter by search text (receptor)", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.setSearchText("ABC");
      });

      expect(result.current.filteredAndSortedInvoices).toHaveLength(1);
      expect(result.current.filteredAndSortedInvoices[0].razonSocialReceptor).toBe("Cliente ABC");
    });

    it("should filter by tipo", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.setFilterTipo("Factura E");
      });

      expect(result.current.filteredAndSortedInvoices).toHaveLength(1);
      expect(result.current.filteredAndSortedInvoices[0].tipo).toBe("Factura E");
    });

    it("should filter by moneda", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.setFilterMoneda("USD");
      });

      expect(result.current.filteredAndSortedInvoices).toHaveLength(1);
      expect(result.current.filteredAndSortedInvoices[0].moneda).toBe("USD");
    });

    it("should filter by minMonto", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.setMinMonto("1000");
      });

      expect(result.current.filteredAndSortedInvoices).toHaveLength(2);
    });

    it("should filter by maxMonto", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.setMaxMonto("1000");
      });

      expect(result.current.filteredAndSortedInvoices).toHaveLength(1);
      expect(result.current.filteredAndSortedInvoices[0].importeTotal).toBe(605);
    });

    it("should count active filters", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.setSearchText("test");
        result.current.setFilterTipo("Factura C");
        result.current.setMinMonto("100");
      });

      expect(result.current.activeFiltersCount).toBe(3);
    });

    it("should clear all filters", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.setSearchText("test");
        result.current.setFilterTipo("Factura C");
        result.current.setFilterMoneda("ARS");
        result.current.setMinMonto("100");
        result.current.setMaxMonto("5000");
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.activeFiltersCount).toBe(0);
      expect(result.current.filters.searchText).toBe("");
      expect(result.current.filters.filterTipo).toBe("all");
      expect(result.current.filters.filterMoneda).toBe("all");
      expect(result.current.filters.minMonto).toBe("");
      expect(result.current.filters.maxMonto).toBe("");
    });
  });

  describe("sorting", () => {
    it("should sort by fecha desc by default", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));
      const dates = result.current.filteredAndSortedInvoices.map((i) => i.fecha);
      expect(dates).toEqual(["20/02/2025", "15/01/2025", "10/01/2025"]);
    });

    it("should toggle sort direction when clicking same field", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.handleSort("fecha");
      });

      expect(result.current.sortDirection).toBe("asc");
      const dates = result.current.filteredAndSortedInvoices.map((i) => i.fecha);
      expect(dates).toEqual(["10/01/2025", "15/01/2025", "20/02/2025"]);
    });

    it("should change field and set asc when clicking different field", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.handleSort("total");
      });

      expect(result.current.sortField).toBe("total");
      expect(result.current.sortDirection).toBe("asc");
    });

    it("should sort by tipo", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.handleSort("tipo");
      });

      const tipos = result.current.filteredAndSortedInvoices.map((i) => i.tipo);
      expect(tipos[0]).toBe("Factura C");
    });

    it("should sort by totalPesos (with exchange rate)", () => {
      const { result } = renderHook(() => useInvoiceFilters(mockInvoices));

      act(() => {
        result.current.handleSort("totalPesos");
      });

      // ARS 605, ARS 1210, USD 2000 * 1000 = 2000000
      const totals = result.current.filteredAndSortedInvoices.map((i) => i.importeTotal);
      expect(totals).toEqual([605, 1210, 2000]);
    });
  });
});
