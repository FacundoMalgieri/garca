import { useCallback, useMemo, useState } from "react";

import type { AFIPInvoice } from "@/types/afip-scraper";

import type { FilterState, SortDirection, SortField } from "../../types";

interface UseInvoiceFiltersReturn {
  filters: FilterState;
  setSearchText: (value: string) => void;
  setFilterTipo: (value: string) => void;
  setFilterMoneda: (value: string) => void;
  setMinMonto: (value: string) => void;
  setMaxMonto: (value: string) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  filteredAndSortedInvoices: AFIPInvoice[];
  uniqueTypes: string[];
}

export function useInvoiceFilters(invoices: AFIPInvoice[]): UseInvoiceFiltersReturn {
  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterMoneda, setFilterMoneda] = useState<string>("all");
  const [minMonto, setMinMonto] = useState<string>("");
  const [maxMonto, setMaxMonto] = useState<string>("");

  // Sort states
  const [sortField, setSortField] = useState<SortField>("fecha");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get unique invoice types for filter dropdown
  const uniqueTypes = useMemo(() => {
    const types = new Set(invoices.map((inv) => inv.tipo));
    return Array.from(types).sort();
  }, [invoices]);

  // Handle sort
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Apply filters
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.numeroCompleto.toLowerCase().includes(search) ||
          inv.razonSocialReceptor.toLowerCase().includes(search)
      );
    }

    if (filterTipo !== "all") {
      filtered = filtered.filter((inv) => inv.tipo === filterTipo);
    }

    if (filterMoneda !== "all") {
      filtered = filtered.filter((inv) => inv.moneda === filterMoneda);
    }

    if (minMonto) {
      const min = parseFloat(minMonto);
      filtered = filtered.filter((inv) => inv.importeTotal >= min);
    }

    if (maxMonto) {
      const max = parseFloat(maxMonto);
      filtered = filtered.filter((inv) => inv.importeTotal <= max);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "fecha": {
          const [dayA, monthA, yearA] = a.fecha.split("/");
          const [dayB, monthB, yearB] = b.fecha.split("/");
          const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
          const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
          comparison = dateA.getTime() - dateB.getTime();
          break;
        }
        case "tipo":
          comparison = a.tipo.localeCompare(b.tipo);
          break;
        case "numero":
          comparison = a.numeroCompleto.localeCompare(b.numeroCompleto);
          break;
        case "receptor":
          comparison = a.razonSocialReceptor.localeCompare(b.razonSocialReceptor);
          break;
        case "total":
          comparison = a.importeTotal - b.importeTotal;
          break;
        case "moneda":
          comparison = a.moneda.localeCompare(b.moneda);
          break;
        case "totalPesos": {
          // Handle all foreign currencies (USD, EUR, etc.)
          const aTotalPesos =
            a.moneda !== "ARS" && a.xmlData?.exchangeRate
              ? a.importeTotal * a.xmlData.exchangeRate
              : a.importeTotal;
          const bTotalPesos =
            b.moneda !== "ARS" && b.xmlData?.exchangeRate
              ? b.importeTotal * b.xmlData.exchangeRate
              : b.importeTotal;
          comparison = aTotalPesos - bTotalPesos;
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [invoices, searchText, filterTipo, filterMoneda, minMonto, maxMonto, sortField, sortDirection]);

  // Count active filters
  const activeFiltersCount = [searchText, filterTipo !== "all", filterMoneda !== "all", minMonto, maxMonto].filter(
    Boolean
  ).length;

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchText("");
    setFilterTipo("all");
    setFilterMoneda("all");
    setMinMonto("");
    setMaxMonto("");
  }, []);

  return {
    filters: {
      searchText,
      filterTipo,
      filterMoneda,
      minMonto,
      maxMonto,
    },
    setSearchText,
    setFilterTipo,
    setFilterMoneda,
    setMinMonto,
    setMaxMonto,
    clearFilters,
    activeFiltersCount,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedInvoices,
    uniqueTypes,
  };
}

