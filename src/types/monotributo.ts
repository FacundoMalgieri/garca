/**
 * Tipos para el sistema de Monotributo
 */

export type TipoActividad = "servicios" | "venta";

export interface CategoriaMonotributo {
  categoria: string; // A, B, C, etc.
  ingresosBrutos: number;
  superficieAfectada: string;
  energiaElectrica: string;
  alquileres: number;
  precioUnitarioMax: number;
  impuestoIntegrado: {
    servicios: number;
    venta: number;
  };
  aportesSIPA: number;
  aportesObraSocial: number;
  total: {
    servicios: number;
    venta: number;
  };
}

export interface MonotributoData {
  categorias: CategoriaMonotributo[];
  fechaVigencia: string; // "01/08/2025"
}

export interface MonotributoStatus {
  categoriaActual: CategoriaMonotributo | null;
  categoriaSiguiente: CategoriaMonotributo | null;
  ingresosAcumulados: number;
  porcentajeUtilizado: number;
  margenDisponible: number;
  tipoActividad: TipoActividad;
  pagoMensual: number;
}

