"use client";

import { Dropdown } from "@/components/ui/Dropdown";

import type { FilterState } from "../../types";
import { formatInvoiceType } from "../../utils/formatters";

interface FilterBarProps {
  filters: FilterState;
  uniqueTypes: string[];
  activeFiltersCount: number;
  onSearchTextChange: (value: string) => void;
  onFilterTipoChange: (value: string) => void;
  onFilterMonedaChange: (value: string) => void;
  onMinMontoChange: (value: string) => void;
  onMaxMontoChange: (value: string) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  filters,
  uniqueTypes,
  activeFiltersCount,
  onSearchTextChange,
  onFilterTipoChange,
  onFilterMonedaChange,
  onMinMontoChange,
  onMaxMontoChange,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border space-y-4">
      {/* Row 1: Search and Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Buscar</label>
          <input
            type="text"
            placeholder="Número o receptor..."
            value={filters.searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            className="w-full px-3 py-2 text-base rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo de Factura</label>
          <Dropdown
            options={[
              { value: "all", label: "Todas" },
              ...uniqueTypes.map((tipo) => ({
                value: tipo,
                label: formatInvoiceType(tipo),
              })),
            ]}
            value={filters.filterTipo}
            onChange={onFilterTipoChange}
            placeholder="Seleccionar tipo..."
          />
        </div>
      </div>

      {/* Row 2: Currency and Amount */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Moneda</label>
          <Dropdown
            options={[
              { value: "all", label: "Todas" },
              { value: "ARS", label: "ARS" },
              { value: "USD", label: "USD" },
            ]}
            value={filters.filterMoneda}
            onChange={onFilterMonedaChange}
            placeholder="Seleccionar moneda..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Monto Mínimo</label>
          <input
            type="number"
            placeholder="0"
            value={filters.minMonto}
            onChange={(e) => onMinMontoChange(e.target.value)}
            className="w-full px-3 py-2 text-base rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Monto Máximo</label>
          <input
            type="number"
            placeholder="∞"
            value={filters.maxMonto}
            onChange={(e) => onMaxMontoChange(e.target.value)}
            className="w-full px-3 py-2 text-base rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

