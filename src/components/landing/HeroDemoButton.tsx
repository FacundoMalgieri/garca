"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner, PlayIcon } from "@/components/ui/icons";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import type { MonotributoAFIPInfo } from "@/types/afip-scraper";

const DEMO_COMPANY = {
  cuit: "20345678901",
  razonSocial: "Tecnología Innovadora SRL (Demo)",
};

const getNextRecategorizacion = (): string => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  if (currentMonth < 6) {
    return `Julio ${currentYear}`;
  }
  return `Enero ${currentYear + 1}`;
};

const DEMO_MONOTRIBUTO_INFO: MonotributoAFIPInfo = {
  categoria: "G",
  tipoActividad: "servicios",
  actividadDescripcion: "LOCACIONES DE SERVICIOS",
  proximaRecategorizacion: getNextRecategorizacion(),
  nombreCompleto: "TECNOLOGÍA INNOVADORA SRL",
  cuit: "20345678901",
};

export function HeroDemoButton() {
  const router = useRouter();
  const { state, loadDemoData } = useInvoiceContext();
  const hasInvoices = state.isHydrated && state.invoices.length > 0;
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  const handleDemoClick = () => {
    if (hasInvoices) {
      setShowDemoConfirm(true);
    } else {
      void handleLoadDemo();
    }
  };

  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      // Demo fixture is loaded lazily so the ~36 KB of JSON only ships when
      // the user actually clicks "Ver demo" — not on every landing visit.
      const { mockInvoices } = await import("@/test/mocks/invoices");

      const adjustedInvoices = mockInvoices.map((invoice) => {
        const [day, month, year] = invoice.fecha.split("/");
        const originalDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        const today = new Date();
        const lastMockDate = new Date(2025, 10, 28); // Nov 28, 2025
        const monthDiff =
          (today.getFullYear() - lastMockDate.getFullYear()) * 12 +
          (today.getMonth() - lastMockDate.getMonth());

        const adjustedDate = new Date(originalDate);
        adjustedDate.setMonth(adjustedDate.getMonth() + monthDiff);

        const newFecha = `${String(adjustedDate.getDate()).padStart(2, "0")}/${String(adjustedDate.getMonth() + 1).padStart(2, "0")}/${adjustedDate.getFullYear()}`;

        return {
          ...invoice,
          fecha: newFecha,
          xmlData: invoice.xmlData ? { ...invoice.xmlData, fecha: newFecha } : undefined,
        };
      });

      // Push demo data through the provider so Navbar / /panel observe the
      // change synchronously via React state; the debounced save effect in
      // useInvoices will persist invoices + company to localStorage.
      loadDemoData(adjustedInvoices, DEMO_COMPANY, DEMO_MONOTRIBUTO_INFO);
      router.push("/panel");
    } catch (error) {
      console.error("Error loading demo data:", error);
      setIsLoadingDemo(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        isOpen={showDemoConfirm}
        onClose={() => setShowDemoConfirm(false)}
        onConfirm={() => {
          setShowDemoConfirm(false);
          void handleLoadDemo();
        }}
        title="¿Cargar datos de demo?"
        description="Se reemplazarán los datos de tu reporte actual con datos ficticios. Para recuperar tus datos reales tendrás que volver a ingresar con tu clave fiscal."
        confirmText="Sí, cargar demo"
        cancelText="Cancelar"
        variant="destructive"
      />

      <button
        onClick={handleDemoClick}
        disabled={isLoadingDemo}
        className="group w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-border bg-white/80 dark:bg-white/5 backdrop-blur-sm px-6 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
      >
        {isLoadingDemo ? (
          <>
            <LoadingSpinner />
            Cargando...
          </>
        ) : (
          <>
            <PlayIcon className="group-hover:scale-125 transition-transform duration-300" />
            Ver demo
          </>
        )}
      </button>
    </>
  );
}
