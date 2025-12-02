"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CompanySelector } from "@/components/CompanySelector";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/TurnstileWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/icons";
import type { AFIPCompany } from "@/types/afip-scraper";

import { CuitInput } from "./components/CuitInput";
import { DateRangePicker } from "./components/DateRangePicker";
import { PasswordInput } from "./components/PasswordInput";
import { PrivacyBanner } from "./components/PrivacyBanner";
import { validateDateRange } from "./utils/validation";

type FlowStep = "credentials" | "company-select";

interface LoginFormProps {
  /** Called when user submits credentials (step 1) */
  onFetchCompanies: (cuit: string, password: string, turnstileToken?: string) => Promise<boolean>;
  /** Called when user selects a company (step 2) */
  onSelectCompany: (
    cuit: string,
    password: string,
    companyIndex: number,
    dateRange: { from: string; to: string },
    turnstileToken?: string
  ) => void;
  /** Loading state for step 1 (fetching companies) */
  isLoadingCompanies: boolean;
  /** Loading state for step 2 (fetching invoices) */
  isLoadingInvoices: boolean;
  /** Error message */
  error: string | null;
  /** Available companies (populated after step 1) */
  companies: AFIPCompany[];
}

/**
 * Login form for ARCA credentials with two-step company selection.
 *
 * Flow:
 * 1. User enters CUIT + password → fetches available companies
 * 2. User selects a company → fetches invoices for that company
 */
export function LoginForm({
  onFetchCompanies,
  onSelectCompany,
  isLoadingCompanies,
  isLoadingInvoices,
  error,
  companies,
}: LoginFormProps) {
  const [cuit, setCuit] = useState("");
  const [password, setPassword] = useState("");
  const [rememberCuit, setRememberCuit] = useState(false);
  const [step, setStep] = useState<FlowStep>("credentials");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  // Date range state - default to current year
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const [fechaDesde, setFechaDesde] = useState(startOfYear.toISOString().split("T")[0]);
  const [fechaHasta, setFechaHasta] = useState(today.toISOString().split("T")[0]);
  const [dateError, setDateError] = useState<string | null>(null);

  // Turnstile callback
  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  // Load CUIT from localStorage on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const savedCuit = localStorage.getItem("garca_afip_cuit");
      if (savedCuit) {
        setCuit(savedCuit);
        setRememberCuit(true);
      }
    }
  });

  const handleFechaDesdeChange = (value: string) => {
    setFechaDesde(value);
    setDateError(validateDateRange(value, fechaHasta));
  };

  const handleFechaHastaChange = (value: string) => {
    setFechaHasta(value);
    setDateError(validateDateRange(fechaDesde, value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cuit || !password) {
      return;
    }

    // Validate date range
    const validationError = validateDateRange(fechaDesde, fechaHasta);
    if (validationError) {
      setDateError(validationError);
      return;
    }

    // Save CUIT if remember is checked
    if (rememberCuit) {
      localStorage.setItem("garca_afip_cuit", cuit);
    } else {
      localStorage.removeItem("garca_afip_cuit");
    }

    // Step 1: Fetch companies
    const success = await onFetchCompanies(cuit, password, turnstileToken || undefined);
    if (success) {
      // Reset Turnstile to get a fresh token for the next request
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setStep("company-select");
    }
  };

  const handleCompanySelect = (company: AFIPCompany) => {
    onSelectCompany(cuit, password, company.index, { from: fechaDesde, to: fechaHasta }, turnstileToken || undefined);
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
  };

  const isLoading = isLoadingCompanies || isLoadingInvoices;
  const isReady = cuit && password && turnstileToken && !isLoading && !dateError;

  // Progressive loading messages
  const loadingMessages = [
    "Verificando seguridad...",
    "Conectando con ARCA...",
    "Verificando credenciales...",
    "Obteniendo empresas...",
  ];
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoadingCompanies) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => 
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoadingCompanies, loadingMessages.length]);

  // Step 2: Company selection
  if (step === "company-select" && companies.length > 0) {
    return (
      <div className="space-y-4">
        <CompanySelector companies={companies} onSelect={handleCompanySelect} disabled={!turnstileToken} />

        {/* Back button */}
        {!isLoadingInvoices && (
          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToCredentials}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              ← Volver a ingresar credenciales
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-3 max-w-md mx-auto">
            <p className="text-sm text-destructive flex items-start gap-2">
              <ErrorIcon />
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Turnstile widget for second request */}
        <TurnstileWidget ref={turnstileRef} onSuccess={handleTurnstileSuccess} />
      </div>
    );
  }

  // Step 1: Credentials form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acceso con Clave Fiscal</CardTitle>
        <CardDescription>
          Ingresá tus credenciales de ARCA para consultar tus comprobantes. Tus datos se procesan de forma segura y no
          se almacenan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CuitInput value={cuit} onChange={setCuit} disabled={isLoading} />

          <PasswordInput value={password} onChange={setPassword} disabled={isLoading} />

          <DateRangePicker
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            onFechaDesdeChange={handleFechaDesdeChange}
            onFechaHastaChange={handleFechaHastaChange}
            error={dateError}
            disabled={isLoading}
            maxDate={today.toISOString().split("T")[0]}
          />

          {/* Remember CUIT Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberCuit}
              onChange={(e) => setRememberCuit(e.target.checked)}
              disabled={isLoading}
              className="rounded border-border"
            />
            <label htmlFor="remember" className="text-sm cursor-pointer">
              Recordar mi CUIT
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-3">
              <p className="text-sm text-destructive flex items-start gap-2">
                <ErrorIcon />
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isReady}
            className="w-full rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 focus-ring disabled:opacity-50 shadow-sm transition-all cursor-pointer"
          >
            {isLoadingCompanies ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                {loadingMessages[loadingMessageIndex]}
              </span>
            ) : (
              "Continuar"
            )}
          </button>

          <PrivacyBanner />

          {/* Invisible Turnstile widget for bot protection */}
          <TurnstileWidget ref={turnstileRef} onSuccess={handleTurnstileSuccess} />
        </form>
      </CardContent>
    </Card>
  );
}

function ErrorIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}



