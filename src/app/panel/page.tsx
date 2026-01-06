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

  // Helper para parsear fecha DD/MM/YYYY a Date
  const parseInvoiceDate = (fecha: string): Date => {
    const [day, month, year] = fecha.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // Detectar si tenemos datos de los últimos 12 meses (año móvil para Monotributo)
  const hasLast12MonthsData = () => {
    if (state.invoices.length === 0) return false;
    
    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    // Filtrar facturas de los últimos 12 meses
    const last12MonthsInvoices = state.invoices.filter((inv) => {
      const invoiceDate = parseInvoiceDate(inv.fecha);
      return invoiceDate >= twelveMonthsAgo && invoiceDate <= today;
    });

    // Si no hay facturas en los últimos 12 meses, no mostrar Monotributo
    if (last12MonthsInvoices.length === 0) return false;

    // Obtener el rango de fechas de las facturas
    const dates = last12MonthsInvoices.map((inv) => parseInvoiceDate(inv.fecha));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Verificar que el rango cubra al menos 10 meses de los últimos 12
    // (damos margen porque puede no haber facturas todos los meses)
    const monthsCovered = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    return monthsCovered >= 10;
  };

  const hasCurrentYearData = hasLast12MonthsData();

  // Calcular ingresos anuales para Monotributo (últimos 12 meses - año móvil)
  const calcularIngresosAnuales = () => {
    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    return state.invoices
      .filter((inv) => {
        const invoiceDate = parseInvoiceDate(inv.fecha);
        return invoiceDate >= twelveMonthsAgo && invoiceDate <= today;
      })
      .reduce((sum, inv) => {
        // Convertir a pesos si es moneda extranjera con tipo de cambio
        if (inv.moneda !== "ARS" && inv.xmlData?.exchangeRate) {
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

