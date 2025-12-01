/**
 * Context provider for invoice state management.
 *
 * Provides global access to invoice data across all components.
 */

"use client";

import { createContext, ReactNode, useContext } from "react";

import type { CompaniesState, CompanyInfo, DateRange, ScraperProgress } from "@/hooks/useInvoices";
import { useInvoices as useInvoicesHook } from "@/hooks/useInvoices";
import type { AFIPInvoice, MonotributoAFIPInfo } from "@/types/afip-scraper";

interface InvoiceState {
  invoices: AFIPInvoice[];
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  company: CompanyInfo | null;
  progress: ScraperProgress | null;
}

interface InvoiceContextType {
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

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const invoices = useInvoicesHook();

  return <InvoiceContext.Provider value={invoices}>{children}</InvoiceContext.Provider>;
}

export function useInvoiceContext() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoiceContext must be used within InvoiceProvider");
  }
  return context;
}
