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
  lastUpdated?: string; // ISO date, e.g. "2026-01-20"
}

/**
 * Ingresos de una ventana de recategorización de 12 meses.
 *
 * `completa: false` significa que la ventana está en curso: `ingresos` es un
 * acumulado parcial y NO puede leerse como categoría. Para estimar se usa
 * `ingresosAnualizados` (extrapolación de los meses cerrados a 12).
 */
export interface VentanaRecategorizacion {
  /** Recategorización que evalúa esta ventana, ej. "Enero 2027" */
  label: string;
  /** Primer mes de la ventana (YYYY-MM) */
  desde: string;
  /** Último mes de la ventana (YYYY-MM) */
  hasta: string;
  /** Ingresos en pesos acumulados en los meses ya cerrados de la ventana */
  ingresos: number;
  /** Meses de la ventana ya cerrados (anteriores al mes actual) */
  mesesCerrados: number;
  /** Largo total de la ventana (12) */
  totalMeses: number;
  /** true cuando la ventana ya cerró por completo */
  completa: boolean;
  /** `ingresos` extrapolados a 12 meses; null si no hay meses cerrados */
  ingresosAnualizados: number | null;
  /** Hubo comprobantes del período consultado dentro de esta ventana */
  tieneDatos: boolean;
  /**
   * ¿La consulta a ARCA trajo todos los meses de esta ventana? Con cobertura
   * parcial `ingresos` está subestimado y no se puede derivar la categoría.
   */
  cobertura: CoberturaVentana;
}

/**
 * Estado de cobertura de una ventana: ¿la consulta a ARCA trajo TODOS los meses
 * de la ventana, o el rango consultado dejó meses afuera?
 *
 * Es distinto de `VentanaRecategorizacion.completa`, que es sobre el calendario
 * (¿ya pasaron los 12 meses?). Acá se pregunta por los datos: un mes que nunca
 * se consultó suma $0 y es indistinguible de un mes sin facturación, así que una
 * ventana con cobertura parcial subestima los ingresos y baja la categoría.
 *
 * `desconocida`: no se sabe qué rango se consultó (sesión guardada por una
 * versión que no lo persistía). No se puede afirmar ni negar la cobertura.
 */
export type EstadoCobertura = "completa" | "parcial" | "desconocida"

export interface CoberturaVentana {
  estado: EstadoCobertura
  /** Meses ya cerrados de la ventana que la consulta cubrió por completo */
  mesesCubiertos: number
  /** Meses de la ventana que ya cerraron (los que pueden tener facturación) */
  mesesCerrados: number
  /** Meses cerrados que la consulta NO cubrió, en orden (YYYY-MM) */
  faltantes: string[]
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

