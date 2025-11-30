"use client";

import { useEffect, useState } from "react";

import type { MonotributoData, MonotributoStatus, TipoActividad } from "@/types/monotributo";

const STORAGE_KEY = "monotributo-tipo-actividad";
const CACHE_KEY = "monotributo-data-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Cached data structure.
 */
interface CachedData {
  data: MonotributoData;
  timestamp: number;
}

/**
 * Return type for useMonotributo hook.
 */
export interface UseMonotributoReturn {
  data: MonotributoData | null;
  isLoading: boolean;
  error: string | null;
  tipoActividad: TipoActividad;
  updateTipoActividad: (tipo: TipoActividad) => void;
  fetchMonotributoData: () => Promise<void>;
  status: MonotributoStatus | null;
}

/**
 * Hook to manage Monotributo data and calculations.
 *
 * Fetches category data from the API, caches it locally,
 * and calculates the user's current status based on annual income.
 *
 * @param ingresosAnuales - Total annual income in pesos
 */
export function useMonotributo(ingresosAnuales: number): UseMonotributoReturn {
  const [data, setData] = useState<MonotributoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipoActividad, setTipoActividad] = useState<TipoActividad>("servicios");

  // Load activity type and cached data on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  /**
   * Loads activity type and cached data from localStorage.
   */
  const loadFromStorage = () => {
    // Load activity type
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "servicios" || saved === "venta") {
      setTipoActividad(saved);
    }

    // Load cached data if still valid
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data: cachedData, timestamp }: CachedData = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setData(cachedData);
          return;
        }
      } catch {
        // Silently fail - corrupted cache
      }
    }

    // If no valid cache, fetch from API
    fetchMonotributoData();
  };

  /**
   * Fetches Monotributo categories from the API.
   */
  const fetchMonotributoData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/monotributo");

      if (!response.ok) {
        throw new Error("Failed to fetch monotributo data");
      }

      const monotributoData: MonotributoData = await response.json();
      setData(monotributoData);

      // Save to cache
      const cacheData: CachedData = {
        data: monotributoData,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      setError("No se pudieron cargar las categorías de monotributo");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!data || !data.categorias.length) return null;

    const categorias = [...data.categorias].sort((a, b) => a.ingresosBrutos - b.ingresosBrutos);

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
    data,
    isLoading,
    error,
    tipoActividad,
    updateTipoActividad,
    fetchMonotributoData,
    status: calcularStatus(),
  };
}
