"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import type { MonotributoStatus, TipoActividad } from "@/types/monotributo";

const STORAGE_KEY = "monotributo-tipo-actividad";

const SORTED_CATEGORIAS = [...MONOTRIBUTO_DATA.categorias].sort(
  (a, b) => a.ingresosBrutos - b.ingresosBrutos
);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "servicios" || saved === "venta") {
      setTipoActividad(saved);
    }
  }, []);

  const updateTipoActividad = useCallback((tipo: TipoActividad) => {
    setTipoActividad(tipo);
    localStorage.setItem(STORAGE_KEY, tipo);
  }, []);

  const status = useMemo((): MonotributoStatus | null => {
    if (!SORTED_CATEGORIAS.length) return null;

    const categoriaActual =
      SORTED_CATEGORIAS.find((cat) => ingresosAnuales <= cat.ingresosBrutos) ||
      SORTED_CATEGORIAS[SORTED_CATEGORIAS.length - 1];

    const index = SORTED_CATEGORIAS.indexOf(categoriaActual);
    const categoriaSiguiente = index < SORTED_CATEGORIAS.length - 1 ? SORTED_CATEGORIAS[index + 1] : null;

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
  }, [ingresosAnuales, tipoActividad]);

  return {
    data: MONOTRIBUTO_DATA,
    tipoActividad,
    updateTipoActividad,
    status,
  };
}
