"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingSplash } from "@/components/LoadingSplash";
import { LoginForm } from "@/components/LoginForm";
import { useInvoiceContext } from "@/contexts/InvoiceContext";

export default function IngresoPage() {
  const router = useRouter();
  const { fetchCompanies, fetchInvoicesWithCompany, state, companiesState } = useInvoiceContext();

  // Si ya hay facturas cargadas, redirigir al panel
  useEffect(() => {
    if (!state.isLoading && state.invoices.length > 0 && !state.error) {
      router.push("/panel");
    }
  }, [state.isLoading, state.invoices.length, state.error, router]);

  const handleFetchCompanies = async (cuit: string, password: string, turnstileToken?: string): Promise<boolean> => {
    return await fetchCompanies(cuit, password, turnstileToken);
  };

  const handleSelectCompany = async (
    cuit: string,
    password: string,
    companyIndex: number,
    dateRange: { from: string; to: string },
    turnstileToken?: string
  ) => {
    await fetchInvoicesWithCompany(cuit, password, companyIndex, dateRange, "EMISOR", turnstileToken);
  };

  // Show loading splash when fetching invoices (not when fetching companies)
  const showSplash = state.isLoading;

  // Combine errors from both states
  const error = state.error || companiesState.error;

  return (
    <>
      <LoadingSplash isLoading={showSplash} />
      <div className="w-full px-0 py-8 max-w-[1920px] mx-auto md:px-6">
        <section className="w-full max-w-xl mx-auto">
          <LoginForm
            onFetchCompanies={handleFetchCompanies}
            onSelectCompany={handleSelectCompany}
            isLoadingCompanies={companiesState.isLoading}
            isLoadingInvoices={state.isLoading}
            error={error}
            companies={companiesState.companies}
          />
        </section>
      </div>
    </>
  );
}

