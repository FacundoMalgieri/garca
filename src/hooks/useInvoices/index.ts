"use client";

import { useEffect, useState } from "react";

import { encryptCredentials } from "@/lib/crypto";
import type { AFIPCompany, AFIPInvoice } from "@/types/afip-scraper";

const STORAGE_KEY = "garca_invoices";
const COMPANY_STORAGE_KEY = "garca_company";

/**
 * Company information extracted from invoices.
 */
export interface CompanyInfo {
  cuit: string;
  razonSocial: string;
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
}

/**
 * Companies state for two-step flow.
 */
export interface CompaniesState {
  companies: AFIPCompany[];
  isLoading: boolean;
  error: string | null;
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
  });

  const [companiesState, setCompaniesState] = useState<CompaniesState>({
    companies: [],
    isLoading: false,
    error: null,
  });

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
   * Loads invoices and company info from localStorage.
   */
  const loadFromStorage = () => {
    try {
      const storedInvoices = localStorage.getItem(STORAGE_KEY);
      const storedCompany = localStorage.getItem(COMPANY_STORAGE_KEY);

      if (storedInvoices) {
        const invoices = JSON.parse(storedInvoices);
        const company = storedCompany ? JSON.parse(storedCompany) : extractCompanyInfo(invoices);
        setState((prev) => ({ ...prev, invoices, company }));
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
   * Step 1 of two-step flow: Fetches available companies.
   * Returns true if successful, false otherwise.
   */
  const fetchCompanies = async (cuit: string, password: string, turnstileToken?: string): Promise<boolean> => {
    setCompaniesState({
      companies: [],
      isLoading: true,
      error: null,
    });

    try {
      const encryptedCredentials = encryptCredentials(cuit, password);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (turnstileToken) {
        headers["x-turnstile-token"] = turnstileToken;
      }

      const response = await fetch("/api/arca/companies", {
        method: "POST",
        headers,
        body: JSON.stringify(encryptedCredentials),
      });

      const data = await response.json();

      if (!data.success) {
        setCompaniesState({
          companies: [],
          isLoading: false,
          error: data.error || "Error al obtener empresas",
        });
        return false;
      }

      setCompaniesState({
        companies: data.companies || [],
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setCompaniesState({
        companies: [],
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  };

  /**
   * Step 2 of two-step flow: Fetches invoices for selected company.
   */
  const fetchInvoicesWithCompany = async (
    cuit: string,
    password: string,
    companyIndex: number,
    dateRange?: DateRange,
    rol: "EMISOR" | "RECEPTOR" = "EMISOR",
    turnstileToken?: string
  ) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      errorCode: null,
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

      const response = await fetch("/api/arca/invoices", {
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
      });

      const data = await response.json();

      if (!data.success) {
        setState((prev) => ({
          ...prev,
          invoices: [],
          isLoading: false,
          error: data.error || "Error al consultar facturas",
          errorCode: data.errorCode || null,
          company: null,
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
      });

      // Clear companies state after successful fetch
      clearCompanies();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al consultar facturas";

      setState({
        invoices: [],
        isLoading: false,
        error: errorMessage,
        errorCode: "UNKNOWN",
        company: null,
      });
    }
  };

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
    });
  };

  /**
   * Clears companies state (used after selecting a company).
   */
  const clearCompanies = () => {
    setCompaniesState({
      companies: [],
      isLoading: false,
      error: null,
    });
  };

  return {
    state,
    companiesState,
    fetchCompanies,
    fetchInvoicesWithCompany,
    clearInvoices,
    clearCompanies,
    loadFromStorage,
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
 * Gets the default date range (January 1st of current year to today).
 */
function getDefaultDateRange(): DateRange {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  return {
    from: formatDateToISO(startOfYear),
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
