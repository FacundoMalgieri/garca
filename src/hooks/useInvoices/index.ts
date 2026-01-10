"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { encryptCredentials } from "@/lib/crypto";
import type { AFIPCompany, AFIPInvoice, MonotributoAFIPInfo } from "@/types/afip-scraper";

const STORAGE_KEY = "garca_invoices";
const COMPANY_STORAGE_KEY = "garca_company";
const MONOTRIBUTO_STORAGE_KEY = "garca_monotributo";

/**
 * Company information extracted from invoices.
 */
export interface CompanyInfo {
  cuit: string;
  razonSocial: string;
}

/**
 * Progress state for streaming scraper.
 */
export interface ScraperProgress {
  message: string;
  progress: number; // 0-100
  type: string;
}

/**
 * Invoice state.
 */
export interface InvoiceState {
  invoices: AFIPInvoice[];
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  company: CompanyInfo | null;
  progress: ScraperProgress | null;
}

/**
 * Companies state for two-step flow.
 */
export interface CompaniesState {
  companies: AFIPCompany[];
  isLoading: boolean;
  error: string | null;
  progress: ScraperProgress | null;
  monotributoInfo: MonotributoAFIPInfo | null;
}

/**
 * Date range for queries.
 */
export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

/**
 * Return type for useInvoices hook.
 */
export interface UseInvoicesReturn {
  state: InvoiceState;
  companiesState: CompaniesState;
  monotributoInfo: MonotributoAFIPInfo | null;
  fetchCompanies: (cuit: string, password: string, turnstileToken?: string) => Promise<boolean>;
  fetchInvoicesWithCompany: (
    cuit: string,
    password: string,
    companyIndex: number,
    dateRange?: DateRange,
    rol?: "EMISOR" | "RECEPTOR",
    turnstileToken?: string
  ) => Promise<void>;
  clearInvoices: () => void;
  clearCompanies: () => void;
  loadFromStorage: () => void;
  cancelOperation: () => void;
  isOperationInProgress: boolean;
}

/**
 * Hook to manage invoice fetching from AFIP scraper.
 *
 * Flow: fetchCompanies → select company → fetchInvoicesWithCompany
 *
 * Uses the scraper-based API and stores invoices in localStorage for persistence.
 */
export function useInvoices(): UseInvoicesReturn {
  const [state, setState] = useState<InvoiceState>({
    invoices: [],
    isLoading: false,
    error: null,
    errorCode: null,
    company: null,
    progress: null,
  });

  const [companiesState, setCompaniesState] = useState<CompaniesState>({
    companies: [],
    isLoading: false,
    error: null,
    progress: null,
    monotributoInfo: null,
  });

  // Separate monotributoInfo state that persists across company selection
  const [monotributoInfo, setMonotributoInfo] = useState<MonotributoAFIPInfo | null>(null);

  // AbortController refs for cancellable requests
  const companiesAbortRef = useRef<AbortController | null>(null);
  const invoicesAbortRef = useRef<AbortController | null>(null);

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      companiesAbortRef.current?.abort();
      invoicesAbortRef.current?.abort();
    };
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save to localStorage whenever invoices change
  useEffect(() => {
    if (state.invoices.length > 0) {
      saveToStorage(state.invoices, state.company);
    }
  }, [state.invoices, state.company]);

  /**
   * Loads invoices, company info, and monotributo info from localStorage.
   */
  const loadFromStorage = () => {
    try {
      const storedInvoices = localStorage.getItem(STORAGE_KEY);
      const storedCompany = localStorage.getItem(COMPANY_STORAGE_KEY);
      const storedMonotributo = localStorage.getItem(MONOTRIBUTO_STORAGE_KEY);

      if (storedInvoices) {
        const invoices = JSON.parse(storedInvoices);
        const company = storedCompany ? JSON.parse(storedCompany) : extractCompanyInfo(invoices);
        setState((prev) => ({ ...prev, invoices, company }));
      }

      if (storedMonotributo) {
        const monotributo = JSON.parse(storedMonotributo);
        setMonotributoInfo(monotributo);
      }
    } catch {
      // Silently fail - localStorage might not be available
    }
  };

  /**
   * Saves invoices and company info to localStorage.
   */
  const saveToStorage = (invoices: AFIPInvoice[], company: CompanyInfo | null) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
      if (company) {
        localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(company));
      }
    } catch {
      // Silently fail - localStorage might be full or unavailable
    }
  };

  /**
   * Saves monotributo info to localStorage.
   */
  const saveMonotributoToStorage = (info: MonotributoAFIPInfo | null) => {
    try {
      if (info) {
        localStorage.setItem(MONOTRIBUTO_STORAGE_KEY, JSON.stringify(info));
      } else {
        localStorage.removeItem(MONOTRIBUTO_STORAGE_KEY);
      }
    } catch {
      // Silently fail
    }
  };

  /**
   * Step 1 of two-step flow: Fetches available companies.
   * Uses Server-Sent Events for real-time progress updates.
   * Returns true if successful, false otherwise.
   */
  const fetchCompanies = async (cuit: string, password: string, turnstileToken?: string): Promise<boolean> => {
    // Abort any existing request
    companiesAbortRef.current?.abort();
    companiesAbortRef.current = new AbortController();

    // Reset state progress to prevent stale progress showing
    setState((prev) => ({ ...prev, progress: null }));

    setCompaniesState({
      companies: [],
      isLoading: true,
      error: null,
      progress: { message: "Iniciando...", progress: 0, type: "start" },
      monotributoInfo: null,
    });

    try {
      const encryptedCredentials = encryptCredentials(cuit, password);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (turnstileToken) {
        headers["x-turnstile-token"] = turnstileToken;
      }

      // Use SSE streaming endpoint
      const response = await fetch("/api/arca/companies/stream", {
        method: "POST",
        headers,
        body: JSON.stringify(encryptedCredentials),
        signal: companiesAbortRef.current.signal,
      });

      // Check if response is SSE stream
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        // Process SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No se pudo leer la respuesta del servidor");
        }

        let buffer = "";
        let finalResult: { success: boolean; companies?: AFIPCompany[]; monotributoInfo?: MonotributoAFIPInfo | null; error?: string } | null = null;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));

                if (event.type === "result") {
                  finalResult = event.data;
                } else if (event.type === "error") {
                  setCompaniesState((prev) => ({
                    ...prev,
                    progress: { message: event.message, progress: 0, type: "error" },
                  }));
                } else {
                  setCompaniesState((prev) => ({
                    ...prev,
                    progress: {
                      message: event.message,
                      progress: event.progress ?? 0,
                      type: event.type,
                    },
                  }));
                }
              } catch {
                // Ignore JSON parse errors
              }
            }
          }
        }

        // Process final result
        if (finalResult) {
          if (!finalResult.success) {
            setCompaniesState({
              companies: [],
              isLoading: false,
              error: finalResult.error || "Error al obtener empresas",
              progress: null,
              monotributoInfo: null,
            });
            return false;
          }

          // Save monotributo info if available
          const monotributo = finalResult.monotributoInfo || null;
          if (monotributo) {
            setMonotributoInfo(monotributo);
            saveMonotributoToStorage(monotributo);
          }

          setCompaniesState({
            companies: finalResult.companies || [],
            isLoading: false,
            error: null,
            progress: null,
            monotributoInfo: monotributo,
          });

          return true;
        } else {
          throw new Error("No se recibió resultado del servidor");
        }
      } else {
        // Fallback to JSON response (for errors)
        const data = await response.json();

        if (!data.success) {
          setCompaniesState({
            companies: [],
            isLoading: false,
            error: data.error || "Error al obtener empresas",
            progress: null,
            monotributoInfo: null,
          });
          return false;
        }

        // Save monotributo info if available
        const monotributo = data.monotributoInfo || null;
        if (monotributo) {
          setMonotributoInfo(monotributo);
          saveMonotributoToStorage(monotributo);
        }

        setCompaniesState({
          companies: data.companies || [],
          isLoading: false,
          error: null,
          progress: null,
          monotributoInfo: monotributo,
        });

        return true;
      }
    } catch (error) {
      // Don't update state if request was aborted
      if (error instanceof Error && error.name === "AbortError") {
        return false;
      }

      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setCompaniesState({
        companies: [],
        isLoading: false,
        error: errorMessage,
        progress: null,
        monotributoInfo: null,
      });
      return false;
    }
  };

  /**
   * Step 2 of two-step flow: Fetches invoices for selected company.
   * Uses Server-Sent Events for real-time progress updates.
   */
  const fetchInvoicesWithCompany = async (
    cuit: string,
    password: string,
    companyIndex: number,
    dateRange?: DateRange,
    rol: "EMISOR" | "RECEPTOR" = "EMISOR",
    turnstileToken?: string
  ) => {
    // Abort any existing request
    invoicesAbortRef.current?.abort();
    invoicesAbortRef.current = new AbortController();

    // Reset companiesState progress to prevent stale progress showing
    setCompaniesState((prev) => ({ ...prev, progress: null }));

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      errorCode: null,
      progress: { message: "Iniciando...", progress: 0, type: "start" },
    }));

    try {
      const range = dateRange || getDefaultDateRange();
      const fechaDesde = convertToAFIPFormat(range.from);
      const fechaHasta = convertToAFIPFormat(range.to);
      const encryptedCredentials = encryptCredentials(cuit, password);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (turnstileToken) {
        headers["x-turnstile-token"] = turnstileToken;
      }

      // Use SSE streaming endpoint
      const response = await fetch("/api/arca/invoices/stream", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...encryptedCredentials,
          fechaDesde,
          fechaHasta,
          rol,
          headless: true,
          downloadXML: true,
          companyIndex,
        }),
        signal: invoicesAbortRef.current.signal,
      });

      // Check if response is SSE stream
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        // Process SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No se pudo leer la respuesta del servidor");
        }

        let buffer = "";
        let finalResult: { success: boolean; invoices?: AFIPInvoice[]; company?: { cuit: string; razonSocial: string }; error?: string; errorCode?: string } | null = null;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                
                if (event.type === "result") {
                  // Final result received
                  finalResult = event.data;
                } else if (event.type === "error") {
                  // Error event
                  setState((prev) => ({
                    ...prev,
                    progress: { message: event.message, progress: 0, type: "error" },
                  }));
                } else {
                  // Progress event
                  setState((prev) => ({
                    ...prev,
                    progress: {
                      message: event.message,
                      progress: event.progress ?? 0,
                      type: event.type,
                    },
                  }));
                }
              } catch {
                // Ignore JSON parse errors
              }
            }
          }
        }

        // Process final result
        if (finalResult) {
          if (!finalResult.success) {
            setState((prev) => ({
              ...prev,
              invoices: [],
              isLoading: false,
              error: finalResult?.error || "Error al consultar facturas",
              errorCode: finalResult?.errorCode || null,
              company: null,
              progress: null,
            }));
            return;
          }

          const invoices = finalResult.invoices || [];
          let company: CompanyInfo | null = null;
          
          if (finalResult.company && finalResult.company.razonSocial) {
            company = {
              cuit: finalResult.company.cuit || cuit,
              razonSocial: finalResult.company.razonSocial,
            };
          } else {
            company = extractCompanyInfo(invoices, cuit);
          }

          setState({
            invoices,
            isLoading: false,
            error: null,
            errorCode: null,
            company,
            progress: null,
          });

          clearCompanies();
        } else {
          throw new Error("No se recibió resultado del servidor");
        }
      } else {
        // Fallback to JSON response (for errors)
        const data = await response.json();

        if (!data.success) {
          setState((prev) => ({
            ...prev,
            invoices: [],
            isLoading: false,
            error: data.error || "Error al consultar facturas",
            errorCode: data.errorCode || null,
            company: null,
            progress: null,
          }));
          return;
        }

        const invoices = data.invoices || [];
        let company: CompanyInfo | null = null;
        
        if (data.company && data.company.razonSocial) {
          company = {
            cuit: data.company.cuit || cuit,
            razonSocial: data.company.razonSocial,
          };
        } else {
          company = extractCompanyInfo(invoices, cuit);
        }

        setState({
          invoices,
          isLoading: false,
          error: null,
          errorCode: null,
          company,
          progress: null,
        });

        clearCompanies();
      }
    } catch (error) {
      // Don't update state if request was aborted
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : "Error desconocido al consultar facturas";

      setState({
        invoices: [],
        isLoading: false,
        error: errorMessage,
        errorCode: "UNKNOWN",
        company: null,
        progress: null,
      });
    }
  };

  /**
   * Cancels any in-progress operation and resets loading states.
   */
  const cancelOperation = useCallback(() => {
    // Abort any ongoing requests
    companiesAbortRef.current?.abort();
    invoicesAbortRef.current?.abort();

    // Reset abort controllers
    companiesAbortRef.current = null;
    invoicesAbortRef.current = null;

    // Reset loading states
    setCompaniesState((prev) => ({
      ...prev,
      isLoading: false,
      progress: null,
    }));

    setState((prev) => ({
      ...prev,
      isLoading: false,
      progress: null,
    }));
  }, []);

  /**
   * Returns true if any operation is currently in progress.
   */
  const isOperationInProgress = state.isLoading || companiesState.isLoading;

  /**
   * Clears invoice data from state and localStorage.
   */
  const clearInvoices = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMPANY_STORAGE_KEY);
    } catch {
      // Silently fail
    }

    setState({
      invoices: [],
      isLoading: false,
      error: null,
      errorCode: null,
      company: null,
      progress: null,
    });
  };

  /**
   * Clears companies state (used after selecting a company).
   * Note: Does NOT clear monotributoInfo as it should persist.
   */
  const clearCompanies = () => {
    setCompaniesState({
      companies: [],
      isLoading: false,
      error: null,
      progress: null,
      monotributoInfo: null,
    });
  };

  return {
    state,
    companiesState,
    monotributoInfo,
    fetchCompanies,
    fetchInvoicesWithCompany,
    clearInvoices,
    clearCompanies,
    loadFromStorage,
    cancelOperation,
    isOperationInProgress,
  };
}

/**
 * Extracts company info from invoices.
 * Tries multiple sources since table structure may vary.
 */
function extractCompanyInfo(invoices: AFIPInvoice[], loginCuit?: string): CompanyInfo | null {
  if (invoices.length === 0) return null;

  const firstInvoice = invoices[0];

  // Try to get CUIT from invoice data, fall back to login CUIT
  let cuit = firstInvoice.cuitEmisor;

  // If cuitEmisor looks invalid (contains non-numeric or is a header text), use login CUIT
  if (!cuit || !/^\d{11}$/.test(cuit.replace(/\D/g, ""))) {
    cuit = loginCuit || "";
  }

  // Try to get razonSocial from invoice, if empty try xmlData
  let razonSocial = firstInvoice.razonSocialEmisor;

  // If razonSocial is empty or invalid, try to find it in other invoices
  if (!razonSocial || razonSocial.length < 2) {
    for (const inv of invoices) {
      if (inv.razonSocialEmisor && inv.razonSocialEmisor.length > 2) {
        razonSocial = inv.razonSocialEmisor;
        break;
      }
    }
  }

  // If still no razonSocial, return null (we need at least the CUIT)
  if (!cuit) return null;

  return {
    cuit: cuit.replace(/\D/g, ""), // Clean CUIT
    razonSocial: razonSocial || "Empresa", // Fallback name
  };
}

/**
 * Gets the default date range (last 12 months from today).
 */
function getDefaultDateRange(): DateRange {
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  return {
    from: formatDateToISO(oneYearAgo),
    to: formatDateToISO(today),
  };
}

/**
 * Formats a Date object to YYYY-MM-DD.
 */
function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts YYYY-MM-DD to DD/MM/YYYY (AFIP format).
 */
function convertToAFIPFormat(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
