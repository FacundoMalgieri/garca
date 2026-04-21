import Link from "next/link";

import { CategoriaCard } from "@/components/monotributo/CategoriaCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import { monotributoHubFaqEntries } from "@/lib/seo/page-schemas";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateModified = MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString().split("T")[0];

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default function MonotributoIndexPage() {
  const categorias = MONOTRIBUTO_DATA.categorias;
  const primera = categorias[0];
  const ultima = categorias[categorias.length - 1];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Monotributo" },
          ]}
        />

        {/* Hero with gradient + decorative blobs */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-10 mb-10 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold mb-4 shadow-lg shadow-blue-500/25">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Guía oficial 2026
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
              Monotributo 2026 — Categorías, Cuotas y Topes
            </h1>
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mb-3 max-w-3xl">
              Las <strong className="text-slate-900 dark:text-white">11 categorías vigentes del Monotributo</strong> en
              Argentina, de la A a la K, con sus cuotas mensuales, topes de facturación anual y desglose de aportes.
              Datos tomados directamente de ARCA (ex-AFIP) y actualizados automáticamente.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Actualizado el{" "}
              <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
            </p>
          </div>
        </section>

        {/* Stat cards with colored gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Categoría más baja</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{primera.categoria}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cuota desde {currencyFormatter.format(primera.total.servicios)} / mes
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Tope máximo anual</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {currencyFormatter.format(ultima.ingresosBrutos)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Categoría {ultima.categoria}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Recategorización</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">2 veces / año</p>
            <p className="text-sm text-muted-foreground mt-1">Enero y Julio</p>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Tabla completa de categorías</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {categorias.map((cat) => (
            <CategoriaCard key={cat.categoria} categoria={cat} />
          ))}
        </div>

        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Herramientas por categoría
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            Calculadoras derivadas de la tabla oficial. Elegí tu categoría y mirá cuánto podés facturar por mes,
            semana o día sin pasarte del tope anual.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categorias.map((cat) => (
              <Link
                key={cat.categoria}
                href={`/monotributo/cuanto-puedo-facturar-por-mes/${cat.categoria.toLowerCase()}`}
                className="group relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] transition-all"
              >
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold uppercase tracking-wide">
                  Tope mensual
                </p>
                <p className="text-base font-bold text-foreground">
                  {currencyFormatter.format(cat.ingresosBrutos / 12)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium group-hover:translate-x-0.5 transition-transform">
                  Categoría {cat.categoria} →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Compact pointer to the dedicated guides index */}
        <section className="mb-12">
          <Link
            href="/monotributo/guias"
            className="group relative overflow-hidden block rounded-2xl border border-indigo-200 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-violet-950/30 p-5 md:p-6 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-sm shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground mb-1">
                    Todas las guías de Monotributo
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    Recategorización, exclusión del régimen, comparativa con Responsable Inscripto, servicios vs.
                    venta de bienes y más. Índice completo en un solo lugar.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 group-hover:translate-x-0.5 transition-transform shrink-0">
                Ver índice de guías
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
        </section>

        {/* CTA with gradient + blobs */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              ¿Querés saber en qué categoría vas a quedar?
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
              Usá la calculadora gratuita de GARCA. Ingresás tu facturación mes a mes y te proyecta en qué
              categoría vas a caer en tu próxima recategorización. <strong className="text-slate-900 dark:text-white">Sin registro, sin datos guardados.</strong>
            </p>
            <Link
              href="/calculadora-monotributo"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all"
            >
              Abrir calculadora
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
          <FaqAccordion items={monotributoHubFaqEntries} />
        </section>

      <SupportBanner />
    </div>
  );
}
