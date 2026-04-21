import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Monotributo: Servicios vs Venta de Bienes 2026",
    description:
      "Tabla comparativa oficial 2026. Diferencias de cuota e impuesto integrado por categoría.",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
    {
      "@type": "ListItem",
      position: 3,
      name: "Servicios vs Venta de Bienes",
      item: `${siteUrl}/monotributo/servicios-vs-bienes`,
    },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Monotributo: Servicios vs Venta de Bienes 2026 — Diferencias de cuota",
  description:
    "Comparativa oficial de cuotas entre prestación de servicios y venta de bienes en el Monotributo 2026, categoría por categoría.",
  author: { "@type": "Person", name: "Facundo Malgieri", url: "https://github.com/FacundoMalgieri" },
  publisher: { "@type": "Organization", name: "GARCA", url: siteUrl },
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/monotributo/servicios-vs-bienes` },
  inLanguage: "es-AR",
};

const faqEntries = [
  {
    question: "¿Qué diferencia hay entre servicios y venta de bienes en el Monotributo?",
    answer:
      "La diferencia está en el impuesto integrado, no en el tope de facturación ni en los aportes. Desde la categoría C en adelante, quienes venden bienes pagan un impuesto integrado menor que quienes prestan servicios, aunque los topes de facturación anual son iguales para ambos rubros.",
  },
  {
    question: "¿Los topes de facturación son distintos entre servicios y bienes?",
    answer:
      "No. Los topes anuales de facturación son exactamente los mismos para servicios y venta de bienes en las 11 categorías. Lo único que cambia es el impuesto integrado, que hace que la cuota total mensual sea distinta.",
  },
  {
    question: "¿Cómo se declara si presto servicios y también vendo bienes?",
    answer:
      "Si desarrollás las dos actividades, tenés que declarar la actividad principal (la que te genera mayores ingresos) al momento de la inscripción. Si el grueso de tu facturación es de servicios, te inscribís como servicios; si es venta de bienes, al revés. La cuota que pagás se define por la actividad principal.",
  },
  {
    question: "¿Puedo cambiar de servicios a venta de bienes más adelante?",
    answer:
      "Sí. Podés modificar la actividad principal en el portal de ARCA, dentro del servicio Monotributo. Tené en cuenta que el cambio afecta tu cuota mensual desde el mes siguiente, porque el impuesto integrado puede ser distinto.",
  },
  {
    question: "¿Por qué los bienes pagan menos impuesto integrado?",
    answer:
      "Porque en la venta de bienes ya existe un margen comercial que tributa IVA en la cadena productiva, mientras que en la prestación de servicios el valor agregado se genera íntegramente en el monotributista. Por eso, desde la categoría C en adelante, el impuesto integrado es menor para bienes.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqEntries.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: { "@type": "Answer", text: entry.answer },
  })),
};

export default function ServiciosVsBienesPage() {
  const categorias = MONOTRIBUTO_DATA.categorias;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Monotributo", href: "/monotributo" },
            { label: "Servicios vs Venta de bienes" },
          ]}
        />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-rose-950/40 border border-purple-200 dark:border-purple-800/30 p-6 md:p-10 mb-10 shadow-[0_8px_40px_-8px_rgba(168,85,247,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/25 to-pink-400/25 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/25 to-rose-400/25 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold mb-4 shadow-lg shadow-purple-500/25">
              Comparativa 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
              Monotributo: Servicios vs Venta de Bienes 2026
            </h1>
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mb-3 max-w-3xl">
              La distinción entre <strong className="text-slate-900 dark:text-white">prestación de servicios</strong>{" "}
              y <strong className="text-slate-900 dark:text-white">venta de bienes</strong> cambia cuánto pagás de
              cuota mensual, pero no cambia el tope de facturación anual. Acá vas a ver la tabla completa con ambos
              valores por categoría y cuándo conviene cada uno.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Actualizado el{" "}
              <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
            </p>
          </div>
        </section>

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

        {/* FAQ */}
        <section className="space-y-4 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Preguntas frecuentes</h2>
          {faqEntries.map((entry) => (
            <details
              key={entry.question}
              className="rounded-xl border border-border bg-white dark:bg-background p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <summary className="cursor-pointer text-base font-semibold text-foreground">{entry.question}</summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{entry.answer}</p>
            </details>
          ))}
        </section>

        <SupportBanner />
      </div>
    </>
  );
}
