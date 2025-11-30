export type SortField = "fecha" | "tipo" | "numero" | "receptor" | "total" | "moneda" | "totalPesos";
export type SortDirection = "asc" | "desc";

export interface FilterState {
  searchText: string;
  filterTipo: string;
  filterMoneda: string;
  minMonto: string;
  maxMonto: string;
}

