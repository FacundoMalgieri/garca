import type { Metadata } from "next";
import Link from "next/link";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import { getGuideDateModified, serviciosVsBienesFaqEntries } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateModified = getGuideDateModified();

export const metadata: Metadata = {
  title: "Monotributo: Servicios vs Venta de Bienes 2026 — Diferencias de cuota",
  description:
    "Diferencias entre prestación de servicios y venta de bienes en el Monotributo 2026: cuotas, impuesto integrado por categoría y cuándo conviene cada uno. Tabla oficial.",
  keywords: [
    "monotributo servicios vs bienes",
    "monotributo venta de bienes",
    "monotributo prestación de servicios",
    "impuesto integrado monotributo",
    "diferencia servicios y bienes monotributo",
    "monotributo 2026",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/servicios-vs-bienes` },
  openGraph: {
    title: "Monotributo: Servicios vs Venta de Bienes 2026",
    description:
      "Tabla comparativa oficial 2026 con cuotas de servicios y venta de bienes por categoría. Cuándo conviene cada uno.",
    type: "article",
    url: `${siteUrl}/monotributo/servicios-vs-bienes`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/servicios-vs-bienes.png",
        width: 1200,
        height: 630,
        alt: "Monotributo: servicios vs venta de bienes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/servicios-vs-bienes.png"],
    title: "Monotributo: Servicios vs Venta de Bienes 2026",
    description:
      "Tabla comparativa oficial 2026. Diferencias de cuota e impuesto integrado por categoría.",
  },
};

export default function ServiciosVsBienesPage() {
  const categorias = MONOTRIBUTO_DATA.categorias;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Guías", href: "/guias" },
            { label: "Servicios vs Venta de bienes" },
          ]}
        />

        <ArticleHero
          image="/og/servicios-vs-bienes.png"
          imageAlt="Monotributo servicios vs venta de bienes"
          badgeLabel="Comparativa 2026"
          title="Monotributo: Servicios vs Venta de Bienes 2026"
          description={
            <>
              La distinción entre <strong className="text-white">prestación de servicios</strong> y{" "}
              <strong className="text-white">venta de bienes</strong> cambia cuánto pagás de cuota mensual, pero
              no cambia el tope de facturación anual. Acá vas a ver la tabla completa con ambos valores por
              categoría y cuándo conviene cada uno.
            </>
          }
          dateModified={dateModified}
          readingTime="4 min de lectura"
        />

        {/* Key differences */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Qué cambia y qué no</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs uppercase tracking-wide font-semibold">Lo que es igual</p>
              </div>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                <li>Los topes de facturación anual (A a K)</li>
                <li>Los aportes jubilatorios (SIPA)</li>
                <li>El aporte a obra social</li>
                <li>Las fechas de recategorización</li>
                <li>Los parámetros evaluados (ingresos, energía, superficie, alquileres)</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-xs uppercase tracking-wide font-semibold">Lo que cambia</p>
              </div>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                <li>El <strong>impuesto integrado</strong> (desde categoría C)</li>
                <li>La <strong>cuota total mensual</strong> resultante</li>
                <li>Cuánto ahorrás al final del año</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                En las categorías A y B, el impuesto integrado es igual para servicios y bienes.
              </p>
            </div>
          </div>
        </section>

        {/* Comparative table */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Tabla comparativa 2026</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
            Cuota mensual total (impuesto integrado + SIPA + obra social) por categoría para ambos rubros. El tope
            anual de facturación es el mismo.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:bg-background shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Cat.</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Tope anual</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Servicios</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Venta de bienes</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Diferencia / mes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categorias.map((cat) => {
                  const diff = cat.total.servicios - cat.total.venta;
                  return (
                    <tr key={cat.categoria} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/monotributo/categoria/${cat.categoria.toLowerCase()}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold shadow-sm hover:scale-110 transition-transform"
                        >
                          {cat.categoria}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {currencyFormatter.format(cat.ingresosBrutos)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {currencyFormatter.format(cat.total.servicios)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {currencyFormatter.format(cat.total.venta)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {diff > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            −{currencyFormatter.format(diff)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            La diferencia negativa indica cuánto <strong className="text-foreground">menos</strong> pagás por mes si
            tu actividad es venta de bienes en esa categoría.
          </p>
        </section>

        {/* ¿Cuál elegir? */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">¿Cuál corresponde elegir?</h2>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            No es una elección libre: la categoría de actividad la determina lo que{" "}
            <strong className="text-foreground">efectivamente hacés</strong>. Algunas referencias rápidas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-5">
              <h3 className="text-lg font-bold text-foreground mb-2">Prestación de servicios</h3>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                <li>Programadores, diseñadores, consultores freelance</li>
                <li>Abogados, contadores, arquitectos</li>
                <li>Psicólogos, fisioterapeutas, profesores particulares</li>
                <li>Oficios (electricistas, plomeros, gasistas)</li>
                <li>Trabajo intelectual o manual sin entrega de bienes</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50/70 to-pink-50/70 dark:from-purple-950/20 dark:to-pink-950/20 p-5">
              <h3 className="text-lg font-bold text-foreground mb-2">Venta de bienes</h3>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                <li>Kioscos, despensas, almacenes</li>
                <li>Indumentaria, librerías, ferreterías</li>
                <li>Ecommerce (dropshipping, tiendas propias)</li>
                <li>Reventa de productos importados</li>
                <li>Producción y venta de artesanías</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Actividad mixta */}
        <section className="mb-12 relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 md:p-7">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                ¿Y si hago las dos cosas?
              </h2>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Si tu actividad mezcla servicios y venta de bienes, tenés que declarar la{" "}
                <strong className="text-foreground">actividad principal</strong>, que es la que te genera mayores
                ingresos brutos. Por ejemplo: un diseñador que además vende remeras estampadas declara como servicios
                si la mayoría de sus ingresos vienen del diseño, o como venta de bienes si la mayoría vienen de las
                remeras.
              </p>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                El tope de facturación anual es el mismo en ambos casos, así que la mezcla de ingresos no te limita;
                solo afecta cuánto de impuesto integrado vas a pagar.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Simulá tu cuota por rubro
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
              En la calculadora podés alternar entre servicios y venta de bienes y ver en tiempo real cuánto cambia
              tu cuota mensual según tu categoría actual.
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

        <RelatedGuides currentHref="/monotributo/servicios-vs-bienes" className="mb-12" />

        <div className="mb-12">
          <SupportBanner />
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
          <FaqAccordion items={serviciosVsBienesFaqEntries} />
        </section>
    </div>
  );
}
