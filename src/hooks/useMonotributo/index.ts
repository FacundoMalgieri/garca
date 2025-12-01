"use client";

import { useEffect, useState } from "react";

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import type { MonotributoStatus, TipoActividad } from "@/types/monotributo";

const STORAGE_KEY = "monotributo-tipo-actividad";

/**
 * Return type for useMonotributo hook.
 */
export interface UseMonotributoReturn {
  data: typeof MONOTRIBUTO_DATA;
  tipoActividad: TipoActividad;
  updateTipoActividad: (tipo: TipoActividad) => void;
  status: MonotributoStatus | null;
}

/**
 * Hook to manage Monotributo data and calculations.
 *
 * Uses static data that's updated twice a year via GitHub Actions.
 * No API calls needed - data is bundled with the app.
 *
 * @param ingresosAnuales - Total annual income in pesos
 */
export function useMonotributo(ingresosAnuales: number): UseMonotributoReturn {
  const [tipoActividad, setTipoActividad] = useState<TipoActividad>("servicios");

  // Load activity type on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "servicios" || saved === "venta") {
      setTipoActividad(saved);
    }
  }, []);

  /**
   * Updates the activity type and persists to localStorage.
   */
  const updateTipoActividad = (tipo: TipoActividad) => {
    setTipoActividad(tipo);
    localStorage.setItem(STORAGE_KEY, tipo);
  };

  /**
   * Calculates the current Monotributo status based on annual income.
   */
  const calcularStatus = (): MonotributoStatus | null => {
    if (!MONOTRIBUTO_DATA.categorias.length) return null;

    const categorias = [...MONOTRIBUTO_DATA.categorias].sort((a, b) => a.ingresosBrutos - b.ingresosBrutos);

    // Find current category
    const categoriaActual =
      categorias.find((cat) => ingresosAnuales <= cat.ingresosBrutos) || categorias[categorias.length - 1];

    const index = categorias.indexOf(categoriaActual);
    const categoriaSiguiente = index < categorias.length - 1 ? categorias[index + 1] : null;

    const porcentajeUtilizado = (ingresosAnuales / categoriaActual.ingresosBrutos) * 100;
    const margenDisponible = categoriaActual.ingresosBrutos - ingresosAnuales;
    const pagoMensual = tipoActividad === "servicios" ? categoriaActual.total.servicios : categoriaActual.total.venta;

    return {
      categoriaActual,
      categoriaSiguiente,
      ingresosAcumulados: ingresosAnuales,
      porcentajeUtilizado,
      margenDisponible,
      tipoActividad,
      pagoMensual,
    };
  };

  return {
    data: MONOTRIBUTO_DATA,
    tipoActividad,
    updateTipoActividad,
    status: calcularStatus(),
  };
}
