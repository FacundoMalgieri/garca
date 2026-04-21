import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString().split("T")[0];

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Monotributo vs Responsable Inscripto 2026",
    description:
      "Diferencias clave: IVA, Ganancias, facturación, retenciones y cuándo conviene cada régimen.",
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
      name: "vs Responsable Inscripto",
      item: `${siteUrl}/monotributo/vs-responsable-inscripto`,
    },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Monotributo vs Responsable Inscripto 2026 — Diferencias y cuándo conviene cada uno",
  description:
    "Comparativa entre Monotributo y Responsable Inscripto en Argentina: IVA, Ganancias, facturación, retenciones y recomendaciones.",
  author: { "@type": "Person", name: "Facundo Malgieri", url: "https://github.com/FacundoMalgieri" },
  publisher: { "@type": "Organization", name: "GARCA", url: siteUrl },
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/monotributo/vs-responsable-inscripto` },
  inLanguage: "es-AR",
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

const faqEntries = [
  {
    question: "¿Qué conviene: Monotributo o Responsable Inscripto?",
    answer:
      "Depende del tipo de clientes, de si podés computar crédito fiscal (compras con IVA) y del volumen. Si facturás poco y tus clientes son consumidores finales, el Monotributo suele ser más conveniente por la simplicidad y la cuota fija. Si facturás mucho, tenés muchos costos con IVA (importaciones, insumos) y le vendés a empresas grandes, el Responsable Inscripto puede ser más eficiente.",
  },
  {
    question: "¿Cuándo es obligatorio pasar a Responsable Inscripto?",
    answer:
      "Cuando tus ingresos de los últimos 12 meses superan el tope de la categoría K del Monotributo, quedás excluido del régimen simplificado y el pase a Responsable Inscripto es obligatorio. También cuando se da alguna causal del art. 20 de la Ley 26.565: más de 3 actividades simultáneas o más de 3 unidades de explotación, importaciones de bienes para reventa, compras y gastos superiores al 80% de tus ingresos (o 40% en servicios), o quedar inscripto en REPSAL, entre otras.",
  },
  {
    question: "¿Puedo volver al Monotributo después de ser Responsable Inscripto?",
    answer:
      "Depende. Si pasaste voluntariamente a Responsable Inscripto (por ejemplo, renunciaste al Monotributo sin haber sido excluido), podés reinscribirte cuando quieras siempre que cumplas las condiciones de inclusión. Pero si fuiste excluido por ARCA (por ejemplo, por superar el tope de K), tenés que esperar 3 años calendario completos desde la exclusión para poder reingresar al régimen simplificado.",
  },
  {
    question: "¿Tengo que contratar un contador si paso a Responsable Inscripto?",
    answer:
      "No es obligatorio por ley, pero en la práctica sí se recomienda. El Responsable Inscripto presenta DDJJ mensuales de IVA, DDJJ anual de Ganancias, lleva libros IVA y muchas veces convive con Ingresos Brutos multijurisdiccional. Un contador te ahorra errores y posibles multas.",
  },
  {
    question: "¿Qué pasa con las facturas ya emitidas si cambio de régimen?",
    answer:
      "Las facturas emitidas antes del cambio siguen siendo válidas con el régimen que tenías al momento de emitirlas. Desde la fecha del cambio, tus comprobantes nuevos tienen que respetar el nuevo régimen (factura A si sos Responsable Inscripto, factura C si sos Monotributista).",
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

export default function VsResponsableInscriptoPage() {
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
            { label: "vs Responsable Inscripto" },
          ]}
        />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-blue-950/40 border border-teal-200 dark:border-teal-800/30 p-6 md:p-10 mb-10 shadow-[0_8px_40px_-8px_rgba(20,184,166,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400/25 to-cyan-400/25 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/25 to-cyan-400/25 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold mb-4 shadow-lg shadow-teal-500/25">
              Comparativa 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
              Monotributo vs Responsable Inscripto 2026
            </h1>
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mb-3 max-w-3xl">
              Son los dos regímenes impositivos más comunes en Argentina para quienes facturan por cuenta propia. El{" "}
              <strong className="text-slate-900 dark:text-white">Monotributo</strong> es un régimen simplificado con
              cuota fija; el <strong className="text-slate-900 dark:text-white">Responsable Inscripto</strong> es el
              régimen general, más complejo pero sin tope de facturación. Acá te mostramos las diferencias clave y
              cuándo conviene cada uno.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Actualizado el{" "}
              <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
            </p>
          </div>
        </section>

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

        {/* FAQ */}
        <section className="space-y-4 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Preguntas frecuentes</h2>
          {faqEntries.map((entry) => (
            <details
              key={entry.question}
              className="rounded-xl border border-border bg-white dark:bg-background p-4 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
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
