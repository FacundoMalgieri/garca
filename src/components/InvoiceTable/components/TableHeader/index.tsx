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
        {columns.map((column) => (
          <th
            key={column.field}
            className={`py-3 px-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors ${
              column.align === "right" ? "text-right" : ""
            }`}
            onClick={() => onSort(column.field)}
          >
            <div className={`flex items-center gap-1 ${column.align === "right" ? "justify-end" : ""}`}>
              {column.label}
              <SortIcon field={column.field} currentField={sortField} direction={sortDirection} />
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

