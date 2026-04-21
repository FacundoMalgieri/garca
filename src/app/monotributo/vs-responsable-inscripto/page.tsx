import type { Metadata } from "next";
import Link from "next/link";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { getGuideDateModified, vsResponsableInscriptoFaqEntries } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

export const metadata: Metadata = {
  title: "Monotributo vs Responsable Inscripto 2026 — Diferencias y cuándo conviene cada uno",
  description:
    "Diferencias entre Monotributo y Responsable Inscripto en Argentina 2026: IVA, Ganancias, facturación, retenciones y cuándo conviene cada régimen. Tabla comparativa.",
  keywords: [
    "monotributo vs responsable inscripto",
    "diferencia monotributo responsable inscripto",
    "pasar de monotributo a responsable inscripto",
    "responsable inscripto 2026",
    "qué conviene monotributo o responsable inscripto",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/vs-responsable-inscripto` },
  openGraph: {
    title: "Monotributo vs Responsable Inscripto 2026",
    description:
      "Diferencias clave: IVA, Ganancias, facturación, retenciones y cuándo conviene cada régimen.",
    type: "article",
    url: `${siteUrl}/monotributo/vs-responsable-inscripto`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/vs-responsable-inscripto.png",
        width: 1200,
        height: 630,
        alt: "Monotributo vs Responsable Inscripto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/vs-responsable-inscripto.png"],
    title: "Monotributo vs Responsable Inscripto 2026",
    description:
      "Diferencias clave: IVA, Ganancias, facturación, retenciones y cuándo conviene cada régimen.",
  },
};


const comparison = [
  {
    label: "Cómo tributa",
    mono: "Cuota fija mensual (impuesto integrado + SIPA + obra social) según la categoría.",
    ri: "IVA mensual (21% o 10,5%) + Ganancias anual + autónomos. Ingresos Brutos aparte.",
  },
  {
    label: "Tipo de factura",
    mono: "Factura C (no discrimina IVA).",
    ri: "Factura A (discrimina IVA a otros responsables inscriptos).",
  },
  {
    label: "Retenciones que sufre",
    mono: "No sufre retenciones de IVA ni de Ganancias en general. Sí puede sufrir retenciones de Ingresos Brutos provinciales.",
    ri: "Sufre retenciones de IVA, Ganancias e IIBB de sus clientes.",
  },
  {
    label: "Libros y contabilidad",
    mono: "Mínima. Solo hace falta tener los comprobantes y los pagos de cuota.",
    ri: "Tenés que presentar DDJJ mensual de IVA, DDJJ anual de Ganancias y llevar libros (IVA Compras, IVA Ventas).",
  },
  {
    label: "Tope de facturación",
    mono: "Hasta el tope anual de la categoría K (régimen simplificado).",
    ri: "Sin tope.",
  },
  {
    label: "Computa crédito fiscal IVA",
    mono: "No.",
    ri: "Sí. Descontás el IVA de tus compras del IVA que facturás.",
  },
  {
    label: "Deducciones en Ganancias",
    mono: "No aplica (no paga Ganancias).",
    ri: "Podés deducir gastos de la actividad y pagar impuesto sobre la utilidad.",
  },
  {
    label: "Obra social y jubilación",
    mono: "Incluida en la cuota mensual.",
    ri: "Autónomos (jubilación) aparte. La obra social se paga por separado (sindicato o prepaga).",
  },
];

export default function VsResponsableInscriptoPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Guías", href: "/guias" },
            { label: "vs Responsable Inscripto" },
          ]}
        />

        <ArticleHero
          image="/og/vs-responsable-inscripto.png"
          imageAlt="Monotributo vs Responsable Inscripto"
          badgeLabel="Comparativa 2026"
          title="Monotributo vs Responsable Inscripto 2026"
          description={
            <>
              Son los dos regímenes impositivos más comunes en Argentina para quienes facturan por cuenta propia.
              El <strong className="text-white">Monotributo</strong> es un régimen simplificado con cuota fija; el{" "}
              <strong className="text-white">Responsable Inscripto</strong> es el régimen general, más complejo
              pero sin tope de facturación.
            </>
          }
          dateModified={dateModified}
          readingTime="7 min de lectura"
        />

        {/* Resumen */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-6">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Monotributo</p>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Régimen simplificado</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Cuota fija mensual que engloba impuesto integrado, jubilación y obra social. Ideal para quienes
              facturan poco o venden principalmente a consumidores finales.
            </p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>Trámite y contabilidad mínimas</li>
              <li>Una sola cuota mensual</li>
              <li>Cobertura social incluida</li>
              <li>Topes de facturación anuales</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Responsable Inscripto</p>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Régimen general</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Pagás IVA mensual (21% o 10,5%), Ganancias anual sobre utilidad y autónomos. Obligatorio cuando
              superás la categoría K del Monotributo.
            </p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>Sin tope de facturación</li>
              <li>Podés computar crédito fiscal IVA</li>
              <li>Deducís gastos en Ganancias</li>
              <li>Emitís factura A a empresas</li>
            </ul>
          </div>
        </section>

        {/* Tabla comparativa */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Tabla comparativa</h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:bg-background shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground w-1/4">Tema</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Monotributo</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Responsable Inscripto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison.map((row) => (
                  <tr key={row.label} className="align-top">
                    <td className="px-4 py-3 font-semibold text-foreground">{row.label}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.mono}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.ri}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cuándo conviene */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">¿Cuándo conviene cada uno?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/30 dark:to-green-950/30 p-6">
              <h3 className="text-lg font-bold text-foreground mb-3">Conviene Monotributo si…</h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                <li>Tus ingresos encajan dentro de alguna categoría (A a K).</li>
                <li>Tus clientes son consumidores finales o no necesitan factura A.</li>
                <li>Tenés pocos gastos facturados con IVA (no perdés crédito fiscal).</li>
                <li>Querés simplicidad: una cuota fija, sin DDJJ mensual de IVA.</li>
                <li>Querés tener jubilación y obra social sin trámites separados.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 p-6">
              <h3 className="text-lg font-bold text-foreground mb-3">Conviene Responsable Inscripto si…</h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                <li>Tus ingresos superan el tope de la categoría K.</li>
                <li>La mayoría de tus clientes son empresas y necesitan factura A.</li>
                <li>Tenés muchas compras con IVA discriminado (aprovechás crédito fiscal).</li>
                <li>Tu actividad genera utilidades bajas (pagás poco Ganancias).</li>
                <li>Vendés al exterior y querés recuperar el IVA de las exportaciones.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Simulá tu categoría antes de decidir
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
              Antes de pasar a Responsable Inscripto, usá la calculadora de GARCA para ver en qué categoría del
              Monotributo caés según tu facturación proyectada y si tenés margen para seguir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/calculadora-monotributo"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all"
              >
                Abrir calculadora
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/monotributo/que-pasa-si-me-paso"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-200 dark:border-blue-800/60 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-blue-700 dark:text-blue-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-105"
              >
                ¿Me pasé del Monotributo?
              </Link>
            </div>
          </div>
        </section>

        <RelatedGuides currentHref="/monotributo/vs-responsable-inscripto" className="mb-12" />

        <div className="mb-12">
          <SupportBanner />
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
          <FaqAccordion items={vsResponsableInscriptoFaqEntries} />
        </section>
    </div>
  );
}
