"use client";

import type { SortDirection, SortField } from "../../types";
import { SortIcon } from "../SortIcon";

interface TableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

interface ColumnConfig {
  field: SortField;
  label: string;
  align?: "left" | "right";
}

const columns: ColumnConfig[] = [
  { field: "fecha", label: "Fecha" },
  { field: "tipo", label: "Tipo" },
  { field: "numero", label: "Número" },
  { field: "moneda", label: "Moneda" },
  { field: "total", label: "Total (Extranjera/ARS)", align: "right" },
  { field: "totalPesos", label: "Total en Pesos", align: "right" },
];

export function TableHeader({ sortField, sortDirection, onSort }: TableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-t border-border text-left text-xs h-[61px]">
        {columns.map((column) => {
          const isActive = sortField === column.field;
          const ariaSort = isActive
            ? sortDirection === "asc"
              ? "ascending"
              : "descending"
            : "none";
          return (
            <th
              key={column.field}
              scope="col"
              aria-sort={ariaSort}
              className={`py-3 px-4 font-semibold ${column.align === "right" ? "text-right" : ""}`}
            >
              <button
                type="button"
                onClick={() => onSort(column.field)}
                className={`w-full flex items-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors ${
                  column.align === "right" ? "justify-end" : ""
                }`}
              >
                {column.label}
                <SortIcon field={column.field} currentField={sortField} direction={sortDirection} />
              </button>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

