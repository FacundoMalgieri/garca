import { beforeEach, describe, expect, it, vi } from "vitest";

import { trackUmamiEvent } from "@/lib/analytics/umami";
import type { AFIPInvoice } from "@/types/afip-scraper";

import { useInvoices } from "./index";

import { act, renderHook } from "@testing-library/react";

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock crypto
vi.mock("@/lib/crypto", () => ({
  encryptCredentials: vi.fn().mockResolvedValue({
    encryptedCuit: "encrypted-cuit",
    encryptedPassword: "encrypted-password",
    key: "mock-key",
    iv: "mock-iv",
  }),
}));

vi.mock("@/lib/analytics/umami", () => ({
  trackUmamiEvent: vi.fn(),
  sanitizeErrorCode: (c: string | null | undefined) => c || "UNKNOWN",
  UMAMI_EVENTS: {
    ArcCompaniesOk: "funnel_arc_companies_ok",
    ArcInvoicesOk: "funnel_arc_invoices_ok",
    LandingDemoOpen: "funnel_landing_demo_open",
    PanelExport: "funnel_panel_export",
    ArcCompaniesFail: "funnel_arc_companies_fail",
    ArcInvoicesFail: "funnel_arc_invoices_fail",
    LandingCta: "funnel_landing_cta",
  },
}));

describe("useInvoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockReset();
  });

  describe("initialization", () => {
    it("should be defined", () => {
      expect(useInvoices).toBeDefined();
    });

    it("should return initial state", () => {
      const { result } = renderHook(() => useInvoices());

      expect(result.current.state).toEqual({
        invoices: [],
        isLoading: false,
        error: null,
        errorCode: null,
        company: null,
        puntosDeVenta: null,
        progress: null,
        isHydrated: true,
        hasQueried: false,
      });
    });

    it("should return companies state", () => {
      const { result } = renderHook(() => useInvoices());

      expect(result.current.companiesState).toEqual({
        companies: [],
        isLoading: false,
        error: null,
        progress: null,
        monotributoInfo: null,
      });
    });

    it("should load invoices from localStorage on mount", () => {
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Mi Empresa SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
      ];
      const mockCompany = { cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 0 };

      localStorage.setItem("garca_invoices", JSON.stringify(mockInvoices));
      localStorage.setItem("garca_company", JSON.stringify(mockCompany));

      const { result } = renderHook(() => useInvoices());

      expect(result.current.state.invoices).toHaveLength(1);
      expect(result.current.state.company).toEqual(mockCompany);
    });
  });

  describe("clearInvoices", () => {
    it("should clear invoices and company from state and localStorage", () => {
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Mi Empresa SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
      ];
      localStorage.setItem("garca_invoices", JSON.stringify(mockInvoices));
      localStorage.setItem("garca_company", JSON.stringify({ cuit: "123", razonSocial: "Test", index: 0 }));

      const { result } = renderHook(() => useInvoices());

      act(() => {
        result.current.clearInvoices();
      });

      expect(result.current.state.invoices).toEqual([]);
      expect(result.current.state.company).toBeNull();
      expect(localStorage.getItem("garca_invoices")).toBeNull();
      expect(localStorage.getItem("garca_company")).toBeNull();
    });

    it("should also clear monotributo info from state and localStorage", () => {
      const mockMonotributo = {
        categoria: "G",
        tipoActividad: "servicios",
        actividadDescripcion: "LOCACIONES DE SERVICIOS",
        proximaRecategorizacion: "Julio 2026",
        nombreCompleto: "Mi Empresa SA",
        cuit: "20345678901",
      };
      localStorage.setItem("garca_monotributo", JSON.stringify(mockMonotributo));

      const { result } = renderHook(() => useInvoices());
      expect(result.current.monotributoInfo).not.toBeNull();

      act(() => {
        result.current.clearInvoices();
      });

      expect(result.current.monotributoInfo).toBeNull();
      expect(localStorage.getItem("garca_monotributo")).toBeNull();
      expect(localStorage.getItem("garca_invoices_ts")).toBeNull();
      expect(localStorage.getItem("garca_manual_fx_rates")).toBeNull();
    });
  });

  describe("loadDemoData", () => {
    it("should populate state and persist monotributo info", () => {
      const demoInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Demo SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente",
          importeNeto: 1000,
          importeIVA: 210,
          importeTotal: 1210,
          moneda: "ARS",
          cae: "111",
        },
      ];
      const demoCompany = { cuit: "20345678901", razonSocial: "Demo SA", index: 0 };
      const demoMonotributo = {
        categoria: "G",
        tipoActividad: "servicios" as const,
        actividadDescripcion: "LOCACIONES DE SERVICIOS",
        proximaRecategorizacion: "Julio 2026",
        nombreCompleto: "Demo SA",
        cuit: "20345678901",
      };

      const { result } = renderHook(() => useInvoices());

      act(() => {
        result.current.loadDemoData(demoInvoices, demoCompany, demoMonotributo);
      });

      expect(result.current.state.invoices).toHaveLength(1);
      expect(result.current.state.company).toEqual(demoCompany);
      expect(result.current.monotributoInfo).toEqual(demoMonotributo);
      expect(localStorage.getItem("garca_monotributo")).toEqual(
        JSON.stringify(demoMonotributo)
      );
    });
  });

  describe("clearCompanies", () => {
    it("should clear companies state", () => {
      const { result } = renderHook(() => useInvoices());

      act(() => {
        result.current.clearCompanies();
      });

      expect(result.current.companiesState.companies).toEqual([]);
      expect(result.current.companiesState.error).toBeNull();
    });
  });

  describe("loadFromStorage", () => {
    it("should reload data from localStorage", () => {
      const { result } = renderHook(() => useInvoices());

      // Initially empty
      expect(result.current.state.invoices).toEqual([]);

      // Add data to localStorage
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Mi Empresa SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
      ];
      localStorage.setItem("garca_invoices", JSON.stringify(mockInvoices));
      localStorage.setItem("garca_company", JSON.stringify({ cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 0 }));

      // Call loadFromStorage
      act(() => {
        result.current.loadFromStorage();
      });

      expect(result.current.state.invoices).toHaveLength(1);
      expect(result.current.state.company).toEqual({ cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 0 });
    });

    it("should extract company info from invoices if not stored separately", () => {
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Mi Empresa SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
      ];
      localStorage.setItem("garca_invoices", JSON.stringify(mockInvoices));
      // No company stored

      const { result } = renderHook(() => useInvoices());

      // Company should be extracted from invoice
      expect(result.current.state.company).toEqual({ cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 0 });
    });

    it("should handle invalid JSON in localStorage gracefully", () => {
      localStorage.setItem("garca_invoices", "invalid json");

      const { result } = renderHook(() => useInvoices());

      // Should not throw, should have empty state
      expect(result.current.state.invoices).toEqual([]);
    });

    it("hidrata invoices y company aunque garca_pdv esté corrupto", () => {
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Mi Empresa SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
      ];
      localStorage.setItem("garca_invoices", JSON.stringify(mockInvoices));
      localStorage.setItem("garca_company", JSON.stringify({ cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 0 }));
      // PDV corrupto: NO debe tumbar toda la hidratación.
      localStorage.setItem("garca_pdv", "{ esto no es json valido");

      const { result } = renderHook(() => useInvoices());

      // invoices y company hidratan igual; PDV cae a null.
      expect(result.current.state.invoices).toHaveLength(1);
      expect(result.current.state.company).toEqual({ cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 0 });
      expect(result.current.state.puntosDeVenta).toBeNull();
      expect(result.current.state.hasQueried).toBe(true);
    });
  });

  describe("fetchCompanies", () => {
    // Helper to create a mock SSE response for companies
    const createMockCompaniesSSEResponse = (events: Array<{ type: string; message: string; data?: unknown }>) => {
      const encoder = new TextEncoder();
      const eventStrings = events.map((e) => `data: ${JSON.stringify(e)}\n\n`);
      const chunks = eventStrings.map((s) => encoder.encode(s));
      let chunkIndex = 0;

      return {
        ok: true,
        headers: {
          get: (name: string) => (name === "content-type" ? "text/event-stream" : null),
        },
        body: {
          getReader: () => ({
            read: async () => {
              if (chunkIndex < chunks.length) {
                return { done: false, value: chunks[chunkIndex++] };
              }
              return { done: true, value: undefined };
            },
          }),
        },
      };
    };

    it("should call SSE stream endpoint", async () => {
      const mockResponse = createMockCompaniesSSEResponse([
        { type: "start", message: "Iniciando..." },
        {
          type: "result",
          message: "Empresas obtenidas",
          data: { success: true, companies: [] },
        },
      ]);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchCompanies("20345678901", "password");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/arca/companies/stream",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should return true on success", async () => {
      const mockResponse = createMockCompaniesSSEResponse([
        { type: "start", message: "Iniciando..." },
        {
          type: "result",
          message: "Empresas obtenidas",
          data: { success: true, companies: [{ cuit: "123", razonSocial: "Test", index: 0 }] },
        },
      ]);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.fetchCompanies("20345678901", "password");
      });

      expect(success).toBe(true);
      expect(result.current.companiesState.companies).toHaveLength(1);
    });

    it("should return false on API error from SSE", async () => {
      const mockResponse = createMockCompaniesSSEResponse([
        { type: "start", message: "Iniciando..." },
        {
          type: "result",
          message: "Error",
          data: { success: false, error: "Credenciales inválidas" },
        },
      ]);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.fetchCompanies("20345678901", "wrong");
      });

      expect(success).toBe(false);
      expect(result.current.companiesState.error).toBe("Credenciales inválidas");
    });

    it("should handle network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useInvoices());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.fetchCompanies("20345678901", "password");
      });

      expect(success).toBe(false);
      expect(result.current.companiesState.error).toBeTruthy();
    });

    it("should fallback to JSON response for non-SSE errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: () =>
          Promise.resolve({
            success: false,
            error: "Error de validación",
          }),
      });

      const { result } = renderHook(() => useInvoices());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.fetchCompanies("20345678901", "password");
      });

      expect(success).toBe(false);
      expect(result.current.companiesState.error).toBe("Error de validación");
    });
  });

  describe("fetchInvoicesWithCompany", () => {
    // Helper to create a mock SSE response
    const createMockSSEResponse = (events: Array<{ type: string; message: string; data?: unknown }>) => {
      const encoder = new TextEncoder();
      const eventStrings = events.map((e) => `data: ${JSON.stringify(e)}\n\n`);
      const chunks = eventStrings.map((s) => encoder.encode(s));
      let chunkIndex = 0;

      return {
        ok: true,
        headers: {
          get: (name: string) => (name === "content-type" ? "text/event-stream" : null),
        },
        body: {
          getReader: () => ({
            read: async () => {
              if (chunkIndex < chunks.length) {
                return { done: false, value: chunks[chunkIndex++] };
              }
              return { done: true, value: undefined };
            },
          }),
        },
      };
    };

    const successSSE = () =>
      createMockSSEResponse([
        {
          type: "result",
          message: "ok",
          data: { success: true, invoices: [], company: { cuit: "123", razonSocial: "Test" } },
        },
      ]);
    const failSSE = (errorCode = "FETCH_ERROR") =>
      createMockSSEResponse([
        { type: "result", message: "e", data: { success: false, error: "x", errorCode } },
      ]);

    it("returns true when the fetch succeeds", async () => {
      mockFetch.mockResolvedValueOnce(successSSE());
      const { result } = renderHook(() => useInvoices());
      let ret: unknown;
      await act(async () => {
        ret = await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });
      expect(ret).toBe(true);
    });

    it("returns false when the fetch fails (so the caller can re-arm Turnstile)", async () => {
      mockFetch.mockResolvedValueOnce(failSSE());
      const { result } = renderHook(() => useInvoices());
      let ret: unknown;
      await act(async () => {
        ret = await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });
      expect(ret).toBe(false);
    });

    it("tags the fail event reused=false on first submit, reused=true on a retry with the same token", async () => {
      const { result } = renderHook(() => useInvoices());

      mockFetch.mockResolvedValueOnce(failSSE("TURNSTILE_FAILED_timeout_or_duplicate"));
      await act(async () => {
        await result.current.fetchInvoicesWithCompany(
          "20345678901", "password", 0, { from: "2025-01-01", to: "2025-11-29" }, "EMISOR", "tok-abc"
        );
      });
      expect(trackUmamiEvent).toHaveBeenLastCalledWith(
        "funnel_arc_invoices_fail",
        expect.objectContaining({ reused: false })
      );

      mockFetch.mockResolvedValueOnce(failSSE("TURNSTILE_FAILED_timeout_or_duplicate"));
      await act(async () => {
        await result.current.fetchInvoicesWithCompany(
          "20345678901", "password", 0, { from: "2025-01-01", to: "2025-11-29" }, "EMISOR", "tok-abc"
        );
      });
      expect(trackUmamiEvent).toHaveBeenLastCalledWith(
        "funnel_arc_invoices_fail",
        expect.objectContaining({ reused: true })
      );
    });

    it("should call SSE stream endpoint", async () => {
      const mockResponse = createMockSSEResponse([
        { type: "start", message: "Iniciando..." },
        {
          type: "result",
          message: "Proceso completado",
          data: { success: true, invoices: [], company: { cuit: "123", razonSocial: "Test" } },
        },
      ]);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/arca/invoices/stream",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should save invoices to localStorage on success", async () => {
      vi.useFakeTimers();
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Mi Empresa SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
      ];

      const mockResponse = createMockSSEResponse([
        { type: "start", message: "Iniciando..." },
        {
          type: "result",
          message: "Proceso completado",
          data: { success: true, invoices: mockInvoices, company: { cuit: "20345678901", razonSocial: "Mi Empresa SA" } },
        },
      ]);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      // Save is debounced (300ms), advance timers to trigger it
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(localStorage.getItem("garca_invoices")).not.toBeNull();
      expect(localStorage.getItem("garca_company")).not.toBeNull();
      vi.useRealTimers();
    });

    it("should handle error response from SSE", async () => {
      const mockResponse = createMockSSEResponse([
        { type: "start", message: "Iniciando..." },
        {
          type: "result",
          message: "Error en el proceso",
          data: { success: false, error: "Error al obtener facturas", errorCode: "FETCH_ERROR" },
        },
      ]);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.error).toBe("Error al obtener facturas");
      expect(result.current.state.errorCode).toBe("FETCH_ERROR");
    });

    it("should fallback to JSON response for non-SSE responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: () =>
          Promise.resolve({
            success: false,
            error: "Error de validación",
            errorCode: "VALIDATION_ERROR",
          }),
      });

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.error).toBe("Error de validación");
    });

    it("should handle JSON success with company from response", async () => {
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Mi Empresa SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: () =>
          Promise.resolve({
            success: true,
            invoices: mockInvoices,
            company: { cuit: "20345678901", razonSocial: "From JSON Co" },
          }),
      });

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.company).toEqual({
        cuit: "20345678901",
        razonSocial: "From JSON Co",
        index: 0,
      });
      expect(result.current.state.invoices).toHaveLength(1);
      expect(result.current.companiesState.companies).toEqual([]);
    });

    it("should use login CUIT when JSON invoices omit valid emisor CUIT", async () => {
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "not-a-cuit",
          razonSocialEmisor: "Empresa",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: () =>
          Promise.resolve({
            success: true,
            invoices: mockInvoices,
          }),
      });

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20987654321", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.company).toEqual({
        cuit: "20987654321",
        razonSocial: "Empresa",
        index: 0,
      });
    });

    it("should pick razon social from a later invoice when first is too short", async () => {
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "A",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "111",
        },
        {
          fecha: "16/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 151,
          numeroCompleto: "0002-00000151",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Nombre Largo SA",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 1000,
          importeIVA: 210,
          importeTotal: 1210,
          moneda: "ARS",
          cae: "222",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: () =>
          Promise.resolve({
            success: true,
            invoices: mockInvoices,
          }),
      });

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.company?.razonSocial).toBe("Nombre Largo SA");
    });

    it("should use default date range when dateRange is omitted", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 3, 8));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: () =>
          Promise.resolve({
            success: true,
            invoices: [],
            company: { cuit: "20345678901", razonSocial: "Test Co" },
          }),
      });

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0);
      });

      const [, init] = mockFetch.mock.calls[0];
      const body = JSON.parse(String((init as { body?: string }).body));
      expect(body.fechaDesde).toBe("08/04/2025");
      expect(body.fechaHasta).toBe("08/04/2026");

      vi.useRealTimers();
    });

    it("should not set error state when fetch is aborted (AbortError)", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      mockFetch.mockRejectedValueOnce(abortError);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.error).toBeNull();
      expect(result.current.state.isLoading).toBe(true);
    });

    it("should store companyIndex in state.company.index after successful fetch", async () => {
      const mockResponse = createMockSSEResponse([
        { type: "start", message: "Iniciando..." },
        {
          type: "result",
          message: "Proceso completado",
          data: { success: true, invoices: [], company: { cuit: "20345678901", razonSocial: "Empresa Test" } },
        },
      ]);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 3, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.company).toMatchObject({ index: 3 });
    });

    it("should set UNKNOWN error code on unexpected failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Unexpected failure"));

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.error).toBe("Unexpected failure");
      expect(result.current.state.errorCode).toBe("UNKNOWN");
      expect(result.current.state.invoices).toEqual([]);
    });
  });

  describe("hasQueried flag (empty-but-successful fetch)", () => {
    const createMockSSEResponse = (events: Array<{ type: string; message: string; data?: unknown }>) => {
      const encoder = new TextEncoder();
      const eventStrings = events.map((e) => `data: ${JSON.stringify(e)}\n\n`);
      const chunks = eventStrings.map((s) => encoder.encode(s));
      let chunkIndex = 0;
      return {
        ok: true,
        headers: { get: (name: string) => (name === "content-type" ? "text/event-stream" : null) },
        body: {
          getReader: () => ({
            read: async () => {
              if (chunkIndex < chunks.length) return { done: false, value: chunks[chunkIndex++] };
              return { done: true, value: undefined };
            },
          }),
        },
      };
    };

    it("should set hasQueried true on a successful fetch that returns zero invoices", async () => {
      const mockResponse = createMockSSEResponse([
        { type: "start", message: "Iniciando..." },
        { type: "result", message: "Proceso completado", data: { success: true, invoices: [] } },
      ]);
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.invoices).toEqual([]);
      expect(result.current.state.hasQueried).toBe(true);
      expect(result.current.state.error).toBeNull();
    });

    it("should persist an empty-but-queried result to localStorage", async () => {
      vi.useFakeTimers();
      const mockResponse = createMockSSEResponse([
        { type: "result", message: "Proceso completado", data: { success: true, invoices: [] } },
      ]);
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(localStorage.getItem("garca_invoices")).toBe("[]");
      vi.useRealTimers();
    });

    it("should hydrate hasQueried true when an empty invoices array is stored", () => {
      localStorage.setItem("garca_invoices", "[]");

      const { result } = renderHook(() => useInvoices());

      expect(result.current.state.invoices).toEqual([]);
      expect(result.current.state.hasQueried).toBe(true);
      expect(result.current.state.isHydrated).toBe(true);
    });

    it("should keep hasQueried false when nothing is stored", () => {
      const { result } = renderHook(() => useInvoices());
      expect(result.current.state.hasQueried).toBe(false);
    });

    it("should keep hasQueried false on a failed fetch", async () => {
      const mockResponse = createMockSSEResponse([
        { type: "result", message: "Error", data: { success: false, error: "Boom", errorCode: "X" } },
      ]);
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20345678901", "password", 0, {
          from: "2025-01-01",
          to: "2025-11-29",
        });
      });

      expect(result.current.state.hasQueried).toBe(false);
    });

    it("should reset hasQueried to false on clearInvoices", () => {
      localStorage.setItem("garca_invoices", "[]");
      const { result } = renderHook(() => useInvoices());
      expect(result.current.state.hasQueried).toBe(true);

      act(() => {
        result.current.clearInvoices();
      });

      expect(result.current.state.hasQueried).toBe(false);
    });
  });

  describe("cancelOperation", () => {
    it("should abort requests and clear loading and progress", async () => {
      mockFetch.mockImplementationOnce((_url, init) => {
        const signal = (
          init as
            | {
                signal?: {
                  addEventListener(
                    type: string,
                    listener: () => void,
                    options?: { once?: boolean }
                  ): void;
                };
              }
            | undefined
        )?.signal;
        return new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener(
            "abort",
            () => {
              const err = new Error("Aborted");
              err.name = "AbortError";
              reject(err);
            },
            { once: true }
          );
        });
      });

      const { result } = renderHook(() => useInvoices());

      await act(async () => {
        const p = result.current.fetchCompanies("20345678901", "password");
        await Promise.resolve();
        result.current.cancelOperation();
        await p;
      });

      expect(result.current.companiesState.isLoading).toBe(false);
      expect(result.current.companiesState.progress).toBeNull();
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.progress).toBeNull();
    });
  });

  describe("loadFromStorage extractCompanyInfo edge cases", () => {
    it("should fall back to scanning invoices for razon social when first is empty", () => {
      const mockInvoices = [
        {
          fecha: "15/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 150,
          numeroCompleto: "0002-00000150",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 80000,
          importeIVA: 20000,
          importeTotal: 100000,
          moneda: "ARS",
          cae: "12345678901234",
        },
        {
          fecha: "16/11/2025",
          tipo: "Factura C",
          tipoComprobante: 11,
          puntoVenta: 2,
          numero: 151,
          numeroCompleto: "0002-00000151",
          cuitEmisor: "20345678901",
          razonSocialEmisor: "Recovered From Second",
          cuitReceptor: "30709876543",
          razonSocialReceptor: "Cliente SA",
          importeNeto: 1000,
          importeIVA: 210,
          importeTotal: 1210,
          moneda: "ARS",
          cae: "222",
        },
      ];
      localStorage.setItem("garca_invoices", JSON.stringify(mockInvoices));

      const { result } = renderHook(() => useInvoices());

      expect(result.current.state.company?.razonSocial).toBe("Recovered From Second");
    });
  });

  describe("merge de emitidas en re-fetch", () => {
    const createMockSSEResponse = (events: Array<{ type: string; message: string; data?: unknown }>) => {
      const encoder = new TextEncoder();
      const chunks = events.map((e) => encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      let i = 0;
      return {
        ok: true,
        headers: { get: (n: string) => (n === "content-type" ? "text/event-stream" : null) },
        body: {
          getReader: () => ({
            read: async () => (i < chunks.length ? { done: false, value: chunks[i++] } : { done: true, value: undefined }),
          }),
        },
      };
    };

    const baseEmitted = {
      fecha: "03/07/2026",
      tipo: "Factura C",
      tipoComprobante: 11,
      puntoVenta: 3,
      numero: 88,
      numeroCompleto: "00003-00000088",
      cuitEmisor: "",
      razonSocialEmisor: "YO",
      cuitReceptor: "30707915281",
      razonSocialReceptor: "GSA",
      importeNeto: 3500000,
      importeIVA: 0,
      importeTotal: 3500000,
      moneda: "PES",
      cae: "70000000000001",
      emittedByGarca: true,
    } as AFIPInvoice;

    it("una emitida por GARCA sobrevive a un re-fetch que NO la incluye", async () => {
      const { result } = renderHook(() => useInvoices());
      act(() => result.current.addEmittedInvoice(baseEmitted));
      expect(result.current.state.invoices).toHaveLength(1);

      // Re-fetch trae otra factura, no la emitida.
      const otra = { ...baseEmitted, numero: 89, numeroCompleto: "00003-00000089", cae: "70000000000002", emittedByGarca: undefined };
      mockFetch.mockResolvedValueOnce(
        createMockSSEResponse([
          { type: "result", message: "ok", data: { success: true, invoices: [otra], company: { cuit: "20301234563", razonSocial: "YO" } } },
        ])
      );

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20301234563", "pw", 0, { from: "2026-01-01", to: "2026-07-31" });
      });

      // La emitida persiste + la nueva scrapeada = 2, sin perder el marcador.
      expect(result.current.state.invoices).toHaveLength(2);
      const survived = result.current.state.invoices.find((i) => i.cae === "70000000000001");
      expect((survived as { emittedByGarca?: boolean } | undefined)?.emittedByGarca).toBe(true);
    });

    it("el row autoritativo de AFIP reemplaza al placeholder sin duplicar", async () => {
      const { result } = renderHook(() => useInvoices());
      act(() => result.current.addEmittedInvoice(baseEmitted));

      // AFIP devuelve la MISMA factura (mismo CAE) con datos reales.
      const autoritativo = { ...baseEmitted, cuitEmisor: "20301234563", importeIVA: 12345, emittedByGarca: undefined };
      mockFetch.mockResolvedValueOnce(
        createMockSSEResponse([
          { type: "result", message: "ok", data: { success: true, invoices: [autoritativo], company: { cuit: "20301234563", razonSocial: "YO" } } },
        ])
      );

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20301234563", "pw", 0, { from: "2026-01-01", to: "2026-07-31" });
      });

      expect(result.current.state.invoices).toHaveLength(1);
      expect(result.current.state.invoices[0].cuitEmisor).toBe("20301234563");
      expect(result.current.state.invoices[0].importeIVA).toBe(12345);
      expect((result.current.state.invoices[0] as { emittedByGarca?: boolean }).emittedByGarca).toBe(true);
    });

    it("el placeholder CAE-pendiente se reconcilia con el row real vía fallback sin duplicar", async () => {
      const { result } = renderHook(() => useInvoices());
      const pendiente = { ...baseEmitted, cae: "", numero: 0, numeroCompleto: "" } as AFIPInvoice;
      act(() => result.current.addEmittedInvoice(pendiente));

      const real = { ...baseEmitted, cae: "70000000000009", emittedByGarca: undefined };
      mockFetch.mockResolvedValueOnce(
        createMockSSEResponse([
          { type: "result", message: "ok", data: { success: true, invoices: [real], company: { cuit: "20301234563", razonSocial: "YO" } } },
        ])
      );

      await act(async () => {
        await result.current.fetchInvoicesWithCompany("20301234563", "pw", 0, { from: "2026-01-01", to: "2026-07-31" });
      });

      expect(result.current.state.invoices).toHaveLength(1);
      expect(result.current.state.invoices[0].cae).toBe("70000000000009");
      expect(result.current.state.invoices[0].numero).toBe(88);
    });
  });

});
