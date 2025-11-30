"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { useInvoiceContext } from "@/contexts/InvoiceContext";

import { FilterBar } from "./components/FilterBar";
import { InvoiceCard } from "./components/InvoiceCard";
import { InvoiceRow } from "./components/InvoiceRow";
import { TableHeader } from "./components/TableHeader";
import { EmptyState, ErrorState, LoadingState } from "./components/TableStates";
import { TableToolbar } from "./components/TableToolbar";
import { useInvoiceFilters } from "./hooks/useInvoiceFilters";

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "all", label: "Todos" },
];

/**
 * Component that displays the invoice/receipt table.
 *
 * Presents invoice information in responsive tabular format with filters and sorting.
 */
export function InvoiceTable() {
  const { state } = useInvoiceContext();
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState<string>("20");
  const [visibleCount, setVisibleCount] = useState(20);

  const {
    filters,
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
  } = useInvoiceFilters(state.invoices);

  // Calculate visible invoices based on pagination
  const visibleInvoices = useMemo(() => {
    // If filters are active, show all results
    if (activeFiltersCount > 0) {
      return filteredAndSortedInvoices;
    }
    // If "all" is selected, show everything
    if (pageSize === "all") {
      return filteredAndSortedInvoices;
    }
    // Otherwise, show up to visibleCount
    return filteredAndSortedInvoices.slice(0, visibleCount);
  }, [filteredAndSortedInvoices, visibleCount, pageSize, activeFiltersCount]);

  const hasMoreToShow = visibleInvoices.length < filteredAndSortedInvoices.length;
  const remainingCount = filteredAndSortedInvoices.length - visibleInvoices.length;

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    if (value === "all") {
      setVisibleCount(filteredAndSortedInvoices.length);
    } else {
      const newSize = parseInt(value);
      setVisibleCount(newSize);
    }
  };

  const handleShowMore = () => {
    if (pageSize === "all") {
      setVisibleCount(filteredAndSortedInvoices.length);
    } else {
      const increment = parseInt(pageSize);
      setVisibleCount((prev) => Math.min(prev + increment, filteredAndSortedInvoices.length));
    }
  };

  const handleShowAll = () => {
    setVisibleCount(filteredAndSortedInvoices.length);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Facturas
            </CardTitle>
            <CardDescription>
              {filteredAndSortedInvoices.length > 0
                ? `${filteredAndSortedInvoices.length} de ${state.invoices.length} comprobante(s)`
                : "Lista de facturas y comprobantes obtenidos de ARCA"}
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""} activo
                  {activeFiltersCount > 1 ? "s" : ""}
                </span>
              )}
            </CardDescription>
          </div>
          <TableToolbar
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            hasInvoices={state.invoices.length > 0}
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Filter Bar */}
        {showFilters && state.invoices.length > 0 && (
          <FilterBar
            filters={filters}
            uniqueTypes={uniqueTypes}
            activeFiltersCount={activeFiltersCount}
            onSearchTextChange={setSearchText}
            onFilterTipoChange={setFilterTipo}
            onFilterMonedaChange={setFilterMoneda}
            onMinMontoChange={setMinMonto}
            onMaxMontoChange={setMaxMonto}
            onClearFilters={clearFilters}
          />
        )}

        {/* Loading State */}
        {state.isLoading && <LoadingState />}

        {/* Error State */}
        {state.error && !state.isLoading && <ErrorState error={state.error} errorCode={state.errorCode} />}

        {/* Empty State */}
        {!state.isLoading && !state.error && state.invoices.length === 0 && <EmptyState />}

        {/* Desktop Table */}
        {!state.isLoading && state.invoices.length > 0 && (
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <TableHeader sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <tbody>
                  {visibleInvoices.map((invoice, index) => (
                    <InvoiceRow key={index} invoice={invoice} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Cards */}
        {!state.isLoading && state.invoices.length > 0 && (
          <div className="space-y-4 md:hidden">
            {visibleInvoices.map((invoice, index) => (
              <InvoiceCard key={index} invoice={invoice} />
            ))}
          </div>
        )}

        {/* Show More / Pagination Footer */}
        {state.invoices.length > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            {/* Show More Button */}
            {hasMoreToShow && activeFiltersCount === 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleShowMore}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Mostrar {Math.min(remainingCount, parseInt(pageSize) || remainingCount)} más
                </button>
                {remainingCount > parseInt(pageSize || "0") && (
                  <button
                    onClick={handleShowAll}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Mostrar todos ({remainingCount} restantes)
                  </button>
                )}
              </div>
            )}

            {/* Footer info */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                {activeFiltersCount > 0 ? (
                  <>
                    Mostrando {filteredAndSortedInvoices.length} resultado
                    {filteredAndSortedInvoices.length !== 1 ? "s" : ""} (filtrado de {state.invoices.length})
                  </>
                ) : (
                  <>
                    Mostrando {visibleInvoices.length} de {filteredAndSortedInvoices.length} comprobante
                    {filteredAndSortedInvoices.length !== 1 ? "s" : ""}
                  </>
                )}
              </div>

              {/* Page Size Dropdown */}
              {activeFiltersCount === 0 && filteredAndSortedInvoices.length > 10 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Mostrar:</span>
                  <Dropdown value={pageSize} onChange={handlePageSizeChange} options={PAGE_SIZE_OPTIONS} className="w-24" />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
