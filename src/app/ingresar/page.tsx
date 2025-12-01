"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LoadingSplash } from "@/components/LoadingSplash";
import { LoginForm } from "@/components/LoginForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export default function IngresoPage() {
  const router = useRouter();
  const { 
    fetchCompanies, 
    fetchInvoicesWithCompany, 
    state, 
    companiesState,
    cancelOperation,
    isOperationInProgress,
  } = useInvoiceContext();

  // State for the confirmation dialog
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Navigation guard to prevent accidental exit during operations
  const { isPending, confirmNavigation, cancelNavigation } = useNavigationGuard({
    enabled: isOperationInProgress,
    message: "¿Estás seguro que querés salir? Se cancelará el proceso en curso.",
    onNavigationAttempt: () => setShowExitDialog(true),
  });

  // Show dialog when navigation is pending
  useEffect(() => {
    if (isPending) {
      setShowExitDialog(true);
    }
  }, [isPending]);

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

  // Handle exit confirmation
  const handleConfirmExit = useCallback(() => {
    cancelOperation();
    setShowExitDialog(false);
    confirmNavigation();
  }, [cancelOperation, confirmNavigation]);

  const handleCancelExit = useCallback(() => {
    setShowExitDialog(false);
    cancelNavigation();
  }, [cancelNavigation]);

  // Show loading splash when fetching companies OR invoices
  const showSplash = companiesState.isLoading || state.isLoading;
  
  // Use progress from whichever is loading
  const currentProgress = companiesState.isLoading ? companiesState.progress : state.progress;

  // Combine errors from both states
  const error = state.error || companiesState.error;

  return (
    <>
      <LoadingSplash isLoading={showSplash} progress={currentProgress} />
      
      {/* Exit confirmation dialog */}
      <ConfirmDialog
        isOpen={showExitDialog}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        title="¿Cancelar proceso?"
        description="Se está ejecutando una consulta a ARCA. Si salís ahora, se cancelará el proceso y perderás el progreso."
        confirmText="Sí, salir"
        cancelText="Continuar"
        variant="destructive"
      />

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

