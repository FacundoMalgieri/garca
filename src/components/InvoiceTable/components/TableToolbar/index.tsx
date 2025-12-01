"use client";

import type { SortDirection, SortField } from "../../types";

interface TableToolbarProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  hasInvoices: boolean;
  showSortMenu: boolean;
  onToggleSortMenu: () => void;
}

export function TableToolbar({ 
  showFilters, 
  onToggleFilters, 
  hasInvoices,
  showSortMenu,
  onToggleSortMenu,
}: TableToolbarProps) {
  if (!hasInvoices) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Filters Button */}
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg border border-foreground/20 hover:border-foreground/30 hover:bg-muted cursor-pointer"
      >
        <FilterIcon />
        {showFilters ? "Ocultar" : "Filtros"}
      </button>

      {/* Sort Button - Mobile Only */}
      <button
        onClick={onToggleSortMenu}
        className="flex md:hidden items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg border border-foreground/20 hover:border-foreground/30 hover:bg-muted cursor-pointer"
      >
        <SortIcon />
        {showSortMenu ? "Cerrar" : "Ordenar"}
      </button>
    </div>
  );
}

// Separate component for the sort panel (rendered in CardContent)
const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "fecha", label: "Fecha" },
  { value: "tipo", label: "Tipo" },
  { value: "numero", label: "Número" },
  { value: "moneda", label: "Moneda" },
  { value: "total", label: "Total extranjera" },
  { value: "totalPesos", label: "Total ARS" },
];

interface MobileSortPanelProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onDirectionChange: (direction: SortDirection) => void;
}

export function MobileSortPanel({
  sortField,
  sortDirection,
  onSort,
  onDirectionChange,
}: MobileSortPanelProps) {
  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sortField)?.label || "Fecha";

  return (
    <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border md:hidden">
      <div className="mb-3">
        <span className="text-xs font-medium text-muted-foreground">Ordenar por</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSort(option.value)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm text-left cursor-pointer transition-colors rounded-lg border ${
              sortField === option.value
                ? "bg-primary/20 border-primary text-foreground font-medium"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              sortField === option.value 
                ? "border-primary bg-primary" 
                : "border-muted-foreground/40"
            }`}>
              {sortField === option.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            {option.label}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <span className="text-xs font-medium text-muted-foreground">Dirección</span>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onDirectionChange("asc")}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
            sortDirection === "asc"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          ↑ Ascendente
        </button>
        <button
          onClick={() => onDirectionChange("desc")}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
            sortDirection === "desc"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          ↓ Descendente
        </button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Ordenando por: <strong className="text-foreground">{currentSortLabel}</strong> ({sortDirection === "asc" ? "A→Z" : "Z→A"})
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
      />
    </svg>
  );
}
