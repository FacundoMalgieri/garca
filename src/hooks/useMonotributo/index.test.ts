import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MonotributoData } from "@/types/monotributo";

import { useMonotributo } from "./index";

import { act, renderHook, waitFor } from "@testing-library/react";

const mockMonotributoData: MonotributoData = {
  categorias: [
    {
      categoria: "A",
      ingresosBrutos: 6450000,
      superficieAfectada: "30 m²",
      energiaElectrica: "3.330 KW",
      alquileres: 0,
      precioUnitarioMax: 0,
      impuestoIntegrado: { servicios: 5000, venta: 4000 },
      aportesSIPA: 5000,
      aportesObraSocial: 5000,
      total: { servicios: 15000, venta: 14000 },
    },
    {
      categoria: "B",
      ingresosBrutos: 9450000,
      superficieAfectada: "45 m²",
      energiaElectrica: "5.000 KW",
      alquileres: 0,
      precioUnitarioMax: 0,
      impuestoIntegrado: { servicios: 6800, venta: 5800 },
      aportesSIPA: 5000,
      aportesObraSocial: 5000,
      total: { servicios: 16800, venta: 15800 },
    },
    {
      categoria: "C",
      ingresosBrutos: 13250000,
      superficieAfectada: "60 m²",
      energiaElectrica: "6.700 KW",
      alquileres: 0,
      precioUnitarioMax: 0,
      impuestoIntegrado: { servicios: 9200, venta: 8200 },
      aportesSIPA: 5000,
      aportesObraSocial: 5000,
      total: { servicios: 19200, venta: 18200 },
    },
  ],
  fechaVigencia: "01/01/2025",
};

describe("useMonotributo", () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
        }),
      },
      writable: true,
    });

    // Mock fetch
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMonotributoData),
      })
    );
  });

  afterEach(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  });

  it("should return initial state without auto-fetching", () => {
    const { result } = renderHook(() => useMonotributo(0));

    expect(result.current.tipoActividad).toBe("servicios");
    expect(result.current.isLoading).toBe(false); // No auto-fetch without cache
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull(); // No data until manual fetch
  });

  it("should fetch data from API when called with token", async () => {
    const { result } = renderHook(() => useMonotributo(5000000));

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    expect(result.current.data).toEqual(mockMonotributoData);
    expect(fetch).toHaveBeenCalledWith("/api/monotributo", {
      headers: { "x-turnstile-token": "test-token" },
    });
  });

  it("should calculate status for category A after fetching", async () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    expect(result.current.status?.categoriaActual?.categoria).toBe("A");
    expect(result.current.status?.pagoMensual).toBe(15000);
  });

  it("should calculate status for category B after fetching", async () => {
    const { result } = renderHook(() => useMonotributo(7000000));

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    expect(result.current.status?.categoriaActual?.categoria).toBe("B");
  });

  it("should update tipo actividad", async () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    act(() => {
      result.current.updateTipoActividad("venta");
    });

    expect(result.current.tipoActividad).toBe("venta");
    expect(localStorage.setItem).toHaveBeenCalledWith("monotributo-tipo-actividad", "venta");
  });

  it("should use venta payment when tipo is venta", async () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    act(() => {
      result.current.updateTipoActividad("venta");
    });

    expect(result.current.status?.pagoMensual).toBe(14000); // venta price for category A
  });

  it("should calculate percentage used", async () => {
    const { result } = renderHook(() => useMonotributo(3225000)); // 50% of 6450000

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    expect(result.current.status?.porcentajeUtilizado).toBe(50);
  });

  it("should calculate margin available", async () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    expect(result.current.status?.margenDisponible).toBe(6450000 - 3000000);
  });

  it("should identify next category", async () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    expect(result.current.status?.categoriaSiguiente?.categoria).toBe("B");
  });

  it("should handle API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Failed to fetch" }),
      })
    );

    const { result } = renderHook(() => useMonotributo(3000000));

    await act(async () => {
      await result.current.fetchMonotributoData("test-token");
    });

    expect(result.current.error).toBe("Failed to fetch");
  });

  it("should load from cache if valid", async () => {
    const cacheData = {
      data: mockMonotributoData,
      timestamp: Date.now(), // Fresh cache
    };
    mockLocalStorage["monotributo-data-cache"] = JSON.stringify(cacheData);

    const { result } = renderHook(() => useMonotributo(3000000));

    // Should load from cache without fetching
    await waitFor(() => {
      expect(result.current.data).toEqual(mockMonotributoData);
    });

    // Fetch should not be called when cache is valid
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should load saved activity type from storage", () => {
    mockLocalStorage["monotributo-tipo-actividad"] = "venta";

    const { result } = renderHook(() => useMonotributo(3000000));

    expect(result.current.tipoActividad).toBe("venta");
  });
});
