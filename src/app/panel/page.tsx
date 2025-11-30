"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ChartsPanel } from "@/components/ChartsPanel";
import { CompanyHeader } from "@/components/CompanyHeader";
import { InvoiceTable } from "@/components/InvoiceTable";
import { MonotributoPanel } from "@/components/MonotributoPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useMonotributo } from "@/hooks/useMonotributo";

export default function PanelPage() {
  const router = useRouter();
  const { state } = useInvoiceContext();

  // Detectar si tenemos datos del año actual completo
  const isCurrentYearComplete = () => {
    if (state.invoices.length === 0) return false;
    
    const currentYear = new Date().getFullYear().toString();
    const currentYearInvoices = state.invoices.filter((inv) => {
      const year = inv.fecha.split("/")[2];
      return year === currentYear;
    });

    // Si no hay facturas del año actual, no mostrar Monotributo
    if (currentYearInvoices.length === 0) return false;

    // Obtener el rango de fechas de las facturas del año actual
    const dates = currentYearInvoices.map((inv) => {
      const [day, month, year] = inv.fecha.split("/");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    });

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Verificar que el rango empiece en enero (mes 0) y termine en el mes actual o posterior
    const today = new Date();
    const currentMonth = today.getMonth();

    // Debe empezar en enero (permitir hasta 31 de enero como margen)
    const startsInJanuary = minDate.getMonth() === 0 || minDate <= new Date(parseInt(currentYear), 0, 31);
    
    // Debe llegar al menos al mes actual o muy cerca
    const reachesCurrentMonth = maxDate.getMonth() >= currentMonth - 1;

    return startsInJanuary && reachesCurrentMonth;
  };

  const hasCurrentYearData = isCurrentYearComplete();

  // Calcular ingresos anuales para Monotributo (solo año actual)
  const calcularIngresosAnuales = () => {
    const currentYear = new Date().getFullYear().toString();
    return state.invoices
      .filter((inv) => {
        const year = inv.fecha.split("/")[2];
        return year === currentYear;
      })
      .reduce((sum, inv) => {
        if (inv.moneda === "USD" && inv.xmlData?.exchangeRate) {
          return sum + inv.importeTotal * inv.xmlData.exchangeRate;
        }
        return sum + inv.importeTotal;
      }, 0);
  };

  const ingresosAnuales = calcularIngresosAnuales();
  const { data: monotributoData } = useMonotributo(hasCurrentYearData ? ingresosAnuales : 0);

  // Si no hay facturas, redirigir a /ingresar
  useEffect(() => {
    if (!state.isLoading && state.invoices.length === 0) {
      router.push("/ingresar");
    }
  }, [state.isLoading, state.invoices.length, router]);

  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (state.invoices.length === 0) {
    return null; // El useEffect redirigirá
  }

  return (
    <div className="w-full pt-4 pb-0 md:py-8 space-y-4 md:space-y-8 max-w-[1920px] mx-auto px-0 md:px-6">
      {/* Company Header */}
      <section className="md:px-0">
        <CompanyHeader />
      </section>

      {/* Monotributo + Análisis Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <section id="monotributo">
          <MonotributoPanel 
            ingresosAnuales={ingresosAnuales} 
            isCurrentYearData={hasCurrentYearData}
          />
        </section>
        <section id="graficos">
          <ChartsPanel 
            monotributoData={monotributoData} 
            ingresosAnuales={ingresosAnuales}
            isCurrentYearData={hasCurrentYearData}
          />
        </section>
      </div>

      {/* Totales */}
      <section id="totales">
        <SummaryPanel />
      </section>

      {/* Facturas (al final para evitar scroll infinito en mobile) */}
      <section id="facturas">
        <InvoiceTable />
      </section>
    </div>
  );
}

