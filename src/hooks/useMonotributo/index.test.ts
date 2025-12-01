import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMonotributo } from "./index";

import { act, renderHook } from "@testing-library/react";

// Mock the static data module
vi.mock("@/data/monotributo-categorias", () => ({
  MONOTRIBUTO_DATA: {
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
  },
}));

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
  });

  afterEach(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  });

  it("should return static data immediately", () => {
    const { result } = renderHook(() => useMonotributo(0));

    expect(result.current.data).toBeDefined();
    expect(result.current.data.categorias).toHaveLength(3);
    expect(result.current.tipoActividad).toBe("servicios");
  });

  it("should calculate status for category A", () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    expect(result.current.status?.categoriaActual?.categoria).toBe("A");
    expect(result.current.status?.pagoMensual).toBe(15000);
  });

  it("should calculate status for category B", () => {
    const { result } = renderHook(() => useMonotributo(7000000));

    expect(result.current.status?.categoriaActual?.categoria).toBe("B");
  });

  it("should calculate status for category C", () => {
    const { result } = renderHook(() => useMonotributo(10000000));

    expect(result.current.status?.categoriaActual?.categoria).toBe("C");
  });

  it("should update tipo actividad", () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    act(() => {
      result.current.updateTipoActividad("venta");
    });

    expect(result.current.tipoActividad).toBe("venta");
    expect(localStorage.setItem).toHaveBeenCalledWith("monotributo-tipo-actividad", "venta");
  });

  it("should use venta payment when tipo is venta", () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    act(() => {
      result.current.updateTipoActividad("venta");
    });

    expect(result.current.status?.pagoMensual).toBe(14000); // venta price for category A
  });

  it("should calculate percentage used", () => {
    const { result } = renderHook(() => useMonotributo(3225000)); // 50% of 6450000

    expect(result.current.status?.porcentajeUtilizado).toBe(50);
  });

  it("should calculate margin available", () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    expect(result.current.status?.margenDisponible).toBe(6450000 - 3000000);
  });

  it("should identify next category", () => {
    const { result } = renderHook(() => useMonotributo(3000000));

    expect(result.current.status?.categoriaSiguiente?.categoria).toBe("B");
  });

  it("should return null for next category when at highest", () => {
    const { result } = renderHook(() => useMonotributo(15000000));

    expect(result.current.status?.categoriaActual?.categoria).toBe("C");
    expect(result.current.status?.categoriaSiguiente).toBeNull();
  });

  it("should load saved activity type from storage", () => {
    mockLocalStorage["monotributo-tipo-actividad"] = "venta";

    const { result } = renderHook(() => useMonotributo(3000000));

    expect(result.current.tipoActividad).toBe("venta");
  });

  it("should include fechaVigencia in data", () => {
    const { result } = renderHook(() => useMonotributo(0));

    expect(result.current.data.fechaVigencia).toBe("01/01/2025");
  });
});
