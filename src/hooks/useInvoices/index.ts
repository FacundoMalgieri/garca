"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { sanitizeErrorCode, trackUmamiEvent, UMAMI_EVENTS } from "@/lib/analytics/umami";
import { encryptCredentials } from "@/lib/crypto";
import { dedupeInvoices, mergeFetchedInvoices } from "@/lib/facturador/dedupe";
import type { AFIPCompany, AFIPInvoice, MonotributoAFIPInfo, PuntoDeVenta } from "@/types/afip-scraper";

const STORAGE_KEY = "garca_invoices";
const COMPANY_STORAGE_KEY = "garca_company";
const PDV_STORAGE_KEY = "garca_pdv";
const MONOTRIBUTO_STORAGE_KEY = "garca_monotributo";
const STORAGE_TTL_KEY = "garca_invoices_ts";
const MANUAL_FX_STORAGE_KEY = "garca_manual_fx_rates";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Company information extracted from invoices.
 */
export interface CompanyInfo {
  cuit: string;
  razonSocial: string;
  index: number;
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
  // Puntos de venta habilitados (con su universo de comprobantes), scrapeados
  // best-effort junto con las facturas. null = no disponibles (sesión vieja o
  // demo) → el facturador cae al input de texto libre para el PV.
  puntosDeVenta: PuntoDeVenta[] | null;
  progress: ScraperProgress | null;
  // True once loadFromStorage has run on mount. Consumers (e.g. /panel and
  // /ingresar) must gate their "empty invoices → redirect" effects on this
  // flag, otherwise the first render (pre-hydration) would see invoices=[]
  // and bounce to /ingresar → /panel → /ingresar in an infinite loop when
  // data is actually present in localStorage.
  isHydrated: boolean;
  // True once a fetch has completed successfully, even when it returned zero
  // invoices (e.g. a Monotributista with no billing in the period). Distinct
  // from `invoices.length > 0`: a legitimate empty period must still route to
  // /panel and survive a refresh, so navigation guards key on this flag rather
  // than the invoice count to avoid the silent bounce back to /ingresar.
  hasQueried: boolean;
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
  manualExchangeRates: Record<string, number>;
  setManualExchangeRate: (currency: string, rate: number) => void;
  fetchCompanies: (cuit: string, password: string, turnstileToken?: string) => Promise<boolean>;
  fetchInvoicesWithCompany: (
    cuit: string,
    password: string,
    companyIndex: number,
    dateRange?: DateRange,
    rol?: "EMISOR" | "RECEPTOR",
    turnstileToken?: string
  ) => Promise<boolean>;
  clearInvoices: () => void;
  clearCompanies: () => void;
  loadFromStorage: () => void;
  loadDemoData: (
    invoices: AFIPInvoice[],
    company: CompanyInfo | null,
    monotributoInfo: MonotributoAFIPInfo | null
  ) => void;
  cancelOperation: () => void;
  isOperationInProgress: boolean;
  addEmittedInvoice: (inv: AFIPInvoice) => void;
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
    puntosDeVenta: null,
    progress: null,
    isHydrated: false,
    hasQueried: false,
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

  // Manual exchange rates for FX invoices without XML rate
  const [manualExchangeRates, setManualExchangeRates] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(MANUAL_FX_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const setManualExchangeRate = useCallback((currency: string, rate: number) => {
    setManualExchangeRates(prev => {
      const next = { ...prev };
      if (rate > 0) {
        next[currency] = rate;
      } else {
        delete next[currency];
      }
      try { localStorage.setItem(MANUAL_FX_STORAGE_KEY, JSON.stringify(next)); } catch { /* quota */ }
      return next;
    });
  }, []);

  // AbortController refs for cancellable requests
  const companiesAbortRef = useRef<AbortController | null>(null);
  const invoicesAbortRef = useRef<AbortController | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  // Track the latest invoices/company so the flush-on-unmount cleanup can
  // write the most recent values synchronously without re-running the effect.
  const pendingSaveRef = useRef<{ invoices: AFIPInvoice[]; company: CompanyInfo | null } | null>(null);

  // Turnstile tokens are single-use. If the SAME token is submitted more than
  // once (a retry after a failed fetch), Cloudflare rejects the reuse as
  // `timeout-or-duplicate`. We can't tell a stale-token *timeout* apart from a
  // reused-token *duplicate* from Cloudflare's bundled error code, but the
  // client CAN: a token it has already sent is, by definition, a duplicate.
  // We remember every submitted token (in memory only, never persisted) and tag
  // the fail metric with `reused`, so analytics can split the two root causes.
  const submittedTokensRef = useRef<Set<string>>(new Set());
  const markTokenReuse = (token?: string): boolean => {
    if (!token) return false;
    const reused = submittedTokensRef.current.has(token);
    submittedTokensRef.current.add(token);
    return reused;
  };

  useEffect(() => {
    // Gate on hasQueried, not invoice count: a successful empty query must be
    // persisted (as "[]") so a refresh of /panel keeps showing the empty state.
    // The initial pre-query state (hasQueried=false) is never written, so a
    // fresh visit isn't mistaken for a completed query.
    if (!state.hasQueried) return;
    pendingSaveRef.current = { invoices: state.invoices, company: state.company };
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const pending = pendingSaveRef.current;
      if (pending) {
        saveToStorage(pending.invoices, pending.company);
        pendingSaveRef.current = null;
      }
    }, 300);
    return () => {
      clearTimeout(saveTimeoutRef.current);
    };
  }, [state.invoices, state.company, state.hasQueried]);

  // Defensive: if the provider unmounts while a debounced save is pending
  // (e.g. during a fast route change), flush it synchronously so data isn't
  // lost. Runs only on final unmount thanks to the empty deps array.
  useEffect(() => {
    return () => {
      const pending = pendingSaveRef.current;
      if (pending) {
        saveToStorage(pending.invoices, pending.company);
        pendingSaveRef.current = null;
      }
    };
  }, []);

  /**
   * Loads invoices, company info, and monotributo info from localStorage.
   */
  const loadFromStorage = useCallback(() => {
    try {
      const storedTs = localStorage.getItem(STORAGE_TTL_KEY);
      if (storedTs && Date.now() - Number.parseInt(storedTs, 10) > TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(COMPANY_STORAGE_KEY);
        localStorage.removeItem(PDV_STORAGE_KEY);
        localStorage.removeItem(MONOTRIBUTO_STORAGE_KEY);
        localStorage.removeItem(STORAGE_TTL_KEY);
        localStorage.removeItem(MANUAL_FX_STORAGE_KEY);
        setManualExchangeRates({});
        setState((prev) => ({ ...prev, isHydrated: true }));
        return;
      }

      const storedInvoices = localStorage.getItem(STORAGE_KEY);
      const storedCompany = localStorage.getItem(COMPANY_STORAGE_KEY);
      const storedPdv = localStorage.getItem(PDV_STORAGE_KEY);
      const storedMonotributo = localStorage.getItem(MONOTRIBUTO_STORAGE_KEY);

      if (storedInvoices !== null) {
        // Presence of the key means a query completed and was persisted, even
        // when it returned zero invoices. Parsing "[]" yields an empty array
        // but still marks the session as queried so /panel renders the empty
        // state instead of bouncing back to /ingresar.
        const invoices = JSON.parse(storedInvoices);
        const parsedCompany = storedCompany ? JSON.parse(storedCompany) : null;
        const company: CompanyInfo | null = parsedCompany
          ? { ...parsedCompany, index: parsedCompany.index ?? 0 }
          : extractCompanyInfo(invoices);
        // PDV va en su propio try/catch: si el JSON está corrupto no debe tirar
        // toda la hidratación (que dejaría al usuario deslogueado). Default null.
        let puntosDeVenta: PuntoDeVenta[] | null = null;
        try {
          puntosDeVenta = storedPdv ? JSON.parse(storedPdv) : null;
        } catch {
          puntosDeVenta = null;
        }
        setState((prev) => ({ ...prev, invoices, company, puntosDeVenta, isHydrated: true, hasQueried: true }));
      } else {
        setState((prev) => ({ ...prev, isHydrated: true }));
      }

      if (storedMonotributo) {
        const monotributo = JSON.parse(storedMonotributo);
        setMonotributoInfo(monotributo);
      }
    } catch {
      // Silently fail - localStorage might not be available
      setState((prev) => ({ ...prev, isHydrated: true }));
    }
  }, []);

  /**
   * Saves invoices and company info to localStorage.
   */
  const saveToStorage = (invoices: AFIPInvoice[], company: CompanyInfo | null) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_TTL_KEY, String(Date.now()));
      if (company) {
        localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(company));
      }
    } catch {
      // Silently fail - localStorage might be full or unavailable
    }
  };

  /**
   * Persiste (o limpia) los puntos de venta scrapeados. Se guardan aparte de
   * saveToStorage porque solo cambian al hacer un fetch, no en cada flush.
   */
  const persistPuntosDeVenta = (puntosDeVenta: PuntoDeVenta[] | null) => {
    try {
      if (puntosDeVenta && puntosDeVenta.length > 0) {
        localStorage.setItem(PDV_STORAGE_KEY, JSON.stringify(puntosDeVenta));
      } else {
        localStorage.removeItem(PDV_STORAGE_KEY);
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
  const fetchCompanies = useCallback(async (cuit: string, password: string, turnstileToken?: string): Promise<boolean> => {
    const tokenReused = markTokenReuse(turnstileToken);
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
                  if (companiesAbortRef.current?.signal.aborted) continue;
                  setCompaniesState((prev) => ({
                    ...prev,
                    progress: { message: event.message, progress: 0, type: "error" },
                  }));
                } else {
                  if (companiesAbortRef.current?.signal.aborted) continue;
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

        if (buffer.trim()) {
          if (buffer.startsWith("data: ")) {
            try {
              const event = JSON.parse(buffer.slice(6));
              if (event.type === "result") {
                finalResult = event.data;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }

        // Process final result
        if (finalResult) {
          if (!finalResult.success) {
            const failCode = (finalResult as { errorCode?: string }).errorCode;
            trackUmamiEvent(UMAMI_EVENTS.ArcCompaniesFail, { code: sanitizeErrorCode(failCode), reused: tokenReused });
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

          const companyCount = (finalResult.companies || []).length;
          trackUmamiEvent(UMAMI_EVENTS.ArcCompaniesOk, { count: companyCount });
          return true;
        } else {
          throw new Error("No se recibió resultado del servidor");
        }
      } else {
        // Fallback to JSON response (for errors)
        const data = await response.json();

        if (!data.success) {
          trackUmamiEvent(UMAMI_EVENTS.ArcCompaniesFail, { code: sanitizeErrorCode(data.errorCode), reused: tokenReused });
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

        const companyCountJson = (data.companies || []).length;
        trackUmamiEvent(UMAMI_EVENTS.ArcCompaniesOk, { count: companyCountJson });
        return true;
      }
    } catch (error) {
      // Don't update state if request was aborted
      if (error instanceof Error && error.name === "AbortError") {
        return false;
      }

      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      const clientCode =
        error instanceof TypeError && /fetch|network|load failed/i.test(errorMessage)
          ? "NETWORK"
          : "CLIENT";
      trackUmamiEvent(UMAMI_EVENTS.ArcCompaniesFail, { code: clientCode, reused: tokenReused });
      setCompaniesState({
        companies: [],
        isLoading: false,
        error: errorMessage,
        progress: null,
        monotributoInfo: null,
      });
      return false;
    }
  }, []);

  /**
   * Step 2 of two-step flow: Fetches invoices for selected company.
   * Uses Server-Sent Events for real-time progress updates.
   */
  const fetchInvoicesWithCompany = useCallback(async (
    cuit: string,
    password: string,
    companyIndex: number,
    dateRange?: DateRange,
    rol: "EMISOR" | "RECEPTOR" = "EMISOR",
    turnstileToken?: string
  ): Promise<boolean> => {
    const tokenReused = markTokenReuse(turnstileToken);
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
      hasQueried: false,
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
        let finalResult: { success: boolean; invoices?: AFIPInvoice[]; company?: { cuit: string; razonSocial: string }; puntosDeVenta?: PuntoDeVenta[]; error?: string; errorCode?: string } | null = null;

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
                  if (invoicesAbortRef.current?.signal.aborted) continue;
                  setState((prev) => ({
                    ...prev,
                    progress: { message: event.message, progress: 0, type: "error" },
                  }));
                } else {
                  if (invoicesAbortRef.current?.signal.aborted) continue;
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

        if (buffer.trim()) {
          if (buffer.startsWith("data: ")) {
            try {
              const event = JSON.parse(buffer.slice(6));
              if (event.type === "result") {
                finalResult = event.data;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }

        // Process final result
        if (finalResult) {
          if (!finalResult.success) {
            trackUmamiEvent(UMAMI_EVENTS.ArcInvoicesFail, {
              code: sanitizeErrorCode(finalResult.errorCode),
              reused: tokenReused,
            });
            setState((prev) => ({
              ...prev,
              invoices: [],
              isLoading: false,
              error: finalResult?.error || "Error al consultar facturas",
              errorCode: finalResult?.errorCode || null,
              company: null,
              progress: null,
            }));
            return false;
          }

          const invoices = finalResult.invoices || [];
          let company: CompanyInfo | null = null;
          
          if (finalResult.company && finalResult.company.razonSocial) {
            company = {
              cuit: finalResult.company.cuit || cuit,
              razonSocial: finalResult.company.razonSocial,
              index: companyIndex,
            };
          } else {
            company = extractCompanyInfo(invoices, cuit, companyIndex);
          }

          const puntosDeVenta = finalResult.puntosDeVenta ?? null;
          persistPuntosDeVenta(puntosDeVenta);

          setState((prev) => {
            // Conservar las emitidas por GARCA a través del re-fetch: el row
            // autoritativo de AFIP reemplaza al placeholder (sin duplicar) y las
            // emitidas que AFIP todavía no indexó se mantienen. Ver mergeFetchedInvoices.
            const emittedByGarca = prev.invoices.filter(
              (i) => (i as { emittedByGarca?: boolean }).emittedByGarca
            );
            return {
              ...prev,
              invoices: mergeFetchedInvoices(emittedByGarca, invoices),
              isLoading: false,
              error: null,
              errorCode: null,
              company,
              puntosDeVenta,
              progress: null,
              isHydrated: true,
              hasQueried: true,
            };
          });

          trackUmamiEvent(UMAMI_EVENTS.ArcInvoicesOk, { count: invoices.length });
          clearCompanies();
          return true;
        } else {
          throw new Error("No se recibió resultado del servidor");
        }
      } else {
        // Fallback to JSON response (for errors)
        const data = await response.json();

        if (!data.success) {
          trackUmamiEvent(UMAMI_EVENTS.ArcInvoicesFail, { code: sanitizeErrorCode(data.errorCode), reused: tokenReused });
          setState((prev) => ({
            ...prev,
            invoices: [],
            isLoading: false,
            error: data.error || "Error al consultar facturas",
            errorCode: data.errorCode || null,
            company: null,
            progress: null,
          }));
          return false;
        }

        const invoices = data.invoices || [];
        let company: CompanyInfo | null = null;
        
        if (data.company && data.company.razonSocial) {
          company = {
            cuit: data.company.cuit || cuit,
            razonSocial: data.company.razonSocial,
            index: companyIndex,
          };
        } else {
          company = extractCompanyInfo(invoices, cuit, companyIndex);
        }

        const puntosDeVenta = (data.puntosDeVenta as PuntoDeVenta[] | undefined) ?? null;
        persistPuntosDeVenta(puntosDeVenta);

        setState((prev) => {
          // Ver comentario en el success path del SSE (mergeFetchedInvoices).
          const emittedByGarca = prev.invoices.filter(
            (i) => (i as { emittedByGarca?: boolean }).emittedByGarca
          );
          return {
            ...prev,
            invoices: mergeFetchedInvoices(emittedByGarca, invoices),
            isLoading: false,
            error: null,
            errorCode: null,
            company,
            puntosDeVenta,
            progress: null,
            isHydrated: true,
            hasQueried: true,
          };
        });

        trackUmamiEvent(UMAMI_EVENTS.ArcInvoicesOk, { count: invoices.length });
        clearCompanies();
        return true;
      }
    } catch (error) {
      // Don't update state if request was aborted
      if (error instanceof Error && error.name === "AbortError") {
        return false;
      }

      const errorMessage = error instanceof Error ? error.message : "Error desconocido al consultar facturas";
      const clientCode =
        error instanceof TypeError && /fetch|network|load failed/i.test(errorMessage)
          ? "NETWORK"
          : "CLIENT";
      trackUmamiEvent(UMAMI_EVENTS.ArcInvoicesFail, { code: clientCode, reused: tokenReused });

      setState({
        invoices: [],
        isLoading: false,
        error: errorMessage,
        errorCode: "UNKNOWN",
        company: null,
        puntosDeVenta: null,
        progress: null,
        isHydrated: true,
        hasQueried: false,
      });
    }
    return false;
    // clearCompanies is a stable useCallback([]) declared below; referenced at
    // call time (not render time), so no dep needed and no TDZ on the deps array.
  }, []);

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
  const clearInvoices = useCallback(() => {
    // Drop any pending debounced save so we don't resurrect just-cleared data.
    clearTimeout(saveTimeoutRef.current);
    pendingSaveRef.current = null;

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMPANY_STORAGE_KEY);
      localStorage.removeItem(PDV_STORAGE_KEY);
      localStorage.removeItem(MONOTRIBUTO_STORAGE_KEY);
      localStorage.removeItem(STORAGE_TTL_KEY);
      localStorage.removeItem(MANUAL_FX_STORAGE_KEY);
    } catch {
      // Silently fail
    }
    setManualExchangeRates({});
    setMonotributoInfo(null);

    setState({
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
  }, []);

  /**
   * Loads pre-baked demo data into state + persists it. Used by the landing
   * page's "Ver demo" button so it goes through the provider instead of
   * writing to localStorage behind the hook's back.
   */
  const loadDemoData = useCallback((
    invoices: AFIPInvoice[],
    company: CompanyInfo | null,
    info: MonotributoAFIPInfo | null
  ) => {
    setState({
      invoices,
      isLoading: false,
      error: null,
      errorCode: null,
      company,
      puntosDeVenta: null,
      progress: null,
      isHydrated: true,
      hasQueried: true,
    });
    setMonotributoInfo(info);
    saveMonotributoToStorage(info);
    trackUmamiEvent(UMAMI_EVENTS.LandingDemoOpen, { count: invoices.length });
  }, []);

  /**
   * Prepends an emitted invoice to the invoice list, deduplicating against the
   * current list (emitted invoice wins on key collision). Persists via the same
   * debounced saveToStorage path used after a successful fetch.
   */
  const addEmittedInvoice = useCallback((inv: AFIPInvoice) => {
    setState((prev) => {
      const merged = dedupeInvoices([inv], prev.invoices);
      return { ...prev, invoices: merged, hasQueried: true };
    });
  }, []);

  /**
   * Clears companies state (used after selecting a company).
   * Note: Does NOT clear monotributoInfo as it should persist.
   */
  const clearCompanies = useCallback(() => {
    setCompaniesState({
      companies: [],
      isLoading: false,
      error: null,
      progress: null,
      monotributoInfo: null,
    });
  }, []);

  // Memoize the hook's return so the context value keeps a stable identity
  // across unrelated re-renders. Every callback above is a stable useCallback,
  // so this object's identity changes only when the actual data
  // (state/companiesState/monotributoInfo/manualExchangeRates) or the derived
  // isOperationInProgress flag changes — not on every provider render tick.
  return useMemo(
    () => ({
      state,
      companiesState,
      monotributoInfo,
      manualExchangeRates,
      setManualExchangeRate,
      fetchCompanies,
      fetchInvoicesWithCompany,
      clearInvoices,
      clearCompanies,
      loadFromStorage,
      loadDemoData,
      cancelOperation,
      isOperationInProgress,
      addEmittedInvoice,
    }),
    [
      state,
      companiesState,
      monotributoInfo,
      manualExchangeRates,
      setManualExchangeRate,
      fetchCompanies,
      fetchInvoicesWithCompany,
      clearInvoices,
      clearCompanies,
      loadFromStorage,
      loadDemoData,
      cancelOperation,
      isOperationInProgress,
      addEmittedInvoice,
    ]
  );
}

/**
 * Extracts company info from invoices.
 * Tries multiple sources since table structure may vary.
 */
function extractCompanyInfo(invoices: AFIPInvoice[], loginCuit?: string, index = 0): CompanyInfo | null {
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
    index,
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
