import { beforeEach, describe, expect, it, vi } from "vitest";

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
        progress: null,
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
      const mockCompany = { cuit: "20345678901", razonSocial: "Mi Empresa SA" };

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
      localStorage.setItem("garca_company", JSON.stringify({ cuit: "123", razonSocial: "Test" }));

      const { result } = renderHook(() => useInvoices());

      act(() => {
        result.current.clearInvoices();
      });

      expect(result.current.state.invoices).toEqual([]);
      expect(result.current.state.company).toBeNull();
      expect(localStorage.getItem("garca_invoices")).toBeNull();
      expect(localStorage.getItem("garca_company")).toBeNull();
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
      localStorage.setItem("garca_company", JSON.stringify({ cuit: "20345678901", razonSocial: "Mi Empresa SA" }));

      // Call loadFromStorage
      act(() => {
        result.current.loadFromStorage();
      });

      expect(result.current.state.invoices).toHaveLength(1);
      expect(result.current.state.company).toEqual({ cuit: "20345678901", razonSocial: "Mi Empresa SA" });
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
      expect(result.current.state.company).toEqual({ cuit: "20345678901", razonSocial: "Mi Empresa SA" });
    });

    it("should handle invalid JSON in localStorage gracefully", () => {
      localStorage.setItem("garca_invoices", "invalid json");

      const { result } = renderHook(() => useInvoices());

      // Should not throw, should have empty state
      expect(result.current.state.invoices).toEqual([]);
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

      expect(localStorage.getItem("garca_invoices")).not.toBeNull();
      expect(localStorage.getItem("garca_company")).not.toBeNull();
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

});
