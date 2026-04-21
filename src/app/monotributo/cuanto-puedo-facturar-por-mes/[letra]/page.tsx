import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import { getCategoriaByLetter } from "@/lib/projection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateModified = MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString().split("T")[0];

const VALID_LETTERS = MONOTRIBUTO_DATA.categorias.map((c) => c.categoria.toLowerCase());

export const dynamicParams = false;

type RouteParams = { letra: string };

export function generateStaticParams(): Array<RouteParams> {
  return VALID_LETTERS.map((letra) => ({ letra }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { letra } = await params;
  const upper = letra?.toUpperCase();
  const categoria = upper ? getCategoriaByLetter(upper, MONOTRIBUTO_DATA.categorias) : null;

  if (!categoria || !upper) {
    return {
      title: "Categoría no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const topeMensual = categoria.ingresosBrutos / 12;
  const topeMensualStr = currencyFormatter.format(topeMensual);
  const topeAnualStr = currencyFormatter.format(categoria.ingresosBrutos);
  const pageUrl = `${siteUrl}/monotributo/cuanto-puedo-facturar-por-mes/${letra}`;

  return {
    title: `¿Cuánto Puedo Facturar por Mes en Monotributo Categoría ${upper}? — ${topeMensualStr}`,
    description: `En la categoría ${upper} del Monotributo podés facturar en promedio hasta ${topeMensualStr} por mes (${topeAnualStr} al año). Calculá tu tope mensual, semanal y diario, y qué pasa si te pasás.`,
    keywords: [
      `cuanto puedo facturar por mes categoria ${upper.toLowerCase()}`,
      `tope mensual monotributo ${upper.toLowerCase()}`,
      `facturacion mensual monotributo ${upper.toLowerCase()}`,
      `cuanto se puede facturar monotributo ${upper.toLowerCase()}`,
      `maximo mensual categoria ${upper.toLowerCase()} monotributo`,
      `monotributo ${upper.toLowerCase()} facturacion mensual`,
      "monotributo 2026",
      "ARCA monotributo",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: pageUrl,
      siteName: "GARCA",
      title: `Tope mensual de facturación — Monotributo Categoría ${upper}`,
      description: `${topeMensualStr} por mes en promedio (${topeAnualStr} al año). Desglose diario, semanal y anual.`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `Monotributo Categoría ${upper} — tope mensual — GARCA`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Cuánto facturar por mes — Categoría ${upper}`,
      description: `${topeMensualStr} / mes en la categoría ${upper} del Monotributo 2026.`,
      images: ["/og-image.png"],
    },
  };
}

export default async function CuantoFacturarPorMesPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { letra } = await params;
  if (!letra) {
    notFound();
  }
  const upper = letra.toUpperCase();
  const categoria = getCategoriaByLetter(upper, MONOTRIBUTO_DATA.categorias);

  if (!categoria) {
    notFound();
  }

  const categorias = MONOTRIBUTO_DATA.categorias;
  const index = categorias.findIndex((c) => c.categoria === upper);
  const anterior = index > 0 ? categorias[index - 1] : null;
  const siguiente = index < categorias.length - 1 ? categorias[index + 1] : null;

  const pageUrl = `${siteUrl}/monotributo/cuanto-puedo-facturar-por-mes/${letra}`;
  const topeAnual = categoria.ingresosBrutos;
  const topeMensual = topeAnual / 12;
  const topeSemanal = topeAnual / 52;
  const topeDiario = topeAnual / 365;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
      {
        "@type": "ListItem",
        position: 3,
        name: `Cuánto facturar por mes — ${upper}`,
        item: pageUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `¿Cuánto puedo facturar por mes en la categoría ${upper} del Monotributo 2026?`,
    description: `En la categoría ${upper} del Monotributo podés facturar en promedio hasta ${currencyFormatter.format(
      topeMensual
    )} por mes (${currencyFormatter.format(topeAnual)} al año). Desglose mensual, semanal, diario y qué pasa si te pasás.`,
    author: { "@type": "Person", name: "Facundo Malgieri", url: "https://github.com/FacundoMalgieri" },
    publisher: { "@type": "Organization", name: "GARCA", url: siteUrl },
    datePublished: "2026-01-20",
    dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: "es-AR",
  };

  const faqEntries = [
    {
      question: `¿Cuánto puedo facturar por mes en la categoría ${upper}?`,
      answer: `En promedio podés facturar hasta ${currencyFormatter.format(
        topeMensual
      )} por mes. El cálculo sale de dividir el tope anual de la categoría ${upper} (${currencyFormatter.format(
        topeAnual
      )}) por 12 meses. No es un límite estricto mensual: podés facturar más en un mes y menos en otro, siempre que el acumulado de los últimos 12 meses no supere el tope anual.`,
    },
    {
      question: `¿Qué pasa si un mes facturo más del promedio mensual?`,
      answer: `No pasa nada mientras el acumulado de los últimos 12 meses siga por debajo del tope anual de ${currencyFormatter.format(
        topeAnual
      )}. El Monotributo se evalúa sobre una ventana móvil de 12 meses, no mes a mes. Si un mes facturás más, podés compensar facturando menos otro mes.`,
    },
    {
      question: `¿Qué pasa si me paso del tope anual de ${currencyFormatter.format(topeAnual)}?`,
      answer: siguiente
        ? `Si en los últimos 12 meses superás los ${currencyFormatter.format(
            topeAnual
          )}, te corresponde recategorizarte a la categoría ${siguiente.categoria}, cuyo tope es de ${currencyFormatter.format(
            siguiente.ingresosBrutos
          )}. La recategorización se hace en enero o julio. Si no la hacés, ARCA te recategoriza de oficio.`
        : `La categoría ${upper} es la más alta del Monotributo. Si superás su tope anual de ${currencyFormatter.format(
            topeAnual
          )}, salís del régimen simplificado y tenés que inscribirte como Responsable Inscripto en IVA y Ganancias.`,
    },
    {
      question: `¿Cuánto puedo facturar por día o por semana en la categoría ${upper}?`,
      answer: `Si dividís el tope anual en partes iguales, la categoría ${upper} permite facturar en promedio ${currencyFormatter.format(
        topeSemanal
      )} por semana o ${currencyFormatter.format(
        topeDiario
      )} por día. Importante: ARCA no controla esos cortes, solo mira el acumulado de los últimos 12 meses.`,
    },
    anterior
      ? {
          question: `¿Cuánto más puedo facturar en ${upper} que en la categoría ${anterior.categoria}?`,
          answer: `La categoría ${upper} permite facturar ${currencyFormatter.format(
            topeAnual - anterior.ingresosBrutos
          )} más al año que la ${anterior.categoria} (${currencyFormatter.format(
            (topeAnual - anterior.ingresosBrutos) / 12
          )} más por mes). A cambio, la cuota mensual sube de ${currencyFormatter.format(
            anterior.total.servicios
          )} a ${currencyFormatter.format(categoria.total.servicios)} para servicios.`,
        }
      : {
          question: `¿Qué pasa si facturo poco en la categoría ${upper}?`,
          answer: `La categoría ${upper} es la más baja del Monotributo. Aunque factures muy poco, pagás la cuota completa de ${currencyFormatter.format(
            categoria.total.servicios
          )} para servicios. No existe una categoría con cuota menor.`,
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
            { label: `Cuánto facturar por mes — ${upper}` },
          ]}
        />

        {/* Hero emerald/teal (pensando en "dinero positivo") */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/30 p-6 md:p-10 mb-10 shadow-[0_8px_40px_-8px_rgba(16,185,129,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/25 to-green-400/25 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-400/25 to-cyan-400/25 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

          <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
            <span className="shrink-0 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white text-3xl font-bold shadow-lg shadow-emerald-500/30">
              {upper}
            </span>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3 backdrop-blur-sm">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Tope de facturación · Categoría {upper}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                ¿Cuánto puedo facturar por mes en la categoría {upper} del Monotributo 2026?
              </h1>
              <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 max-w-3xl mb-3">
                En la categoría {upper} podés facturar en promedio hasta{" "}
                <strong className="text-slate-900 dark:text-white">{currencyFormatter.format(topeMensual)}</strong> por
                mes, lo que equivale a{" "}
                <strong className="text-slate-900 dark:text-white">{currencyFormatter.format(topeAnual)}</strong>{" "}
                acumulados en los últimos 12 meses. Abajo tenés el desglose mensual, semanal y diario, y qué hacer si te
                pasás del tope.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Actualizado el{" "}
                <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
              </p>
            </div>
          </div>
        </section>

        {/* Stat grid with colored cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-4 md:p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Por mes</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {currencyFormatter.format(topeMensual)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">En promedio</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 md:p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Por semana</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {currencyFormatter.format(topeSemanal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tope ÷ 52</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 md:p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Por día</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {currencyFormatter.format(topeDiario)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tope ÷ 365</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 md:p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Por año</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {currencyFormatter.format(topeAnual)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tope oficial</p>
          </div>
        </section>

        {/* Info card — ventana móvil 12 meses */}
        <section className="mb-12 relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 md:p-7">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                ¿Es un límite mensual estricto?
              </h2>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                <strong className="text-foreground">No.</strong> El Monotributo no controla mes por mes, sino que mira
                el <strong className="text-foreground">acumulado de los últimos 12 meses</strong>. Podés facturar más
                en un mes y menos en otro, siempre que el total de la ventana móvil no supere el tope anual de{" "}
                {currencyFormatter.format(topeAnual)}.
              </p>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Esto te da flexibilidad para meses buenos y malos. Por eso el número de{" "}
                {currencyFormatter.format(topeMensual)} es un <em>promedio objetivo</em>, no un techo por mes
                calendario.
              </p>
            </div>
          </div>
        </section>

        {/* Warning section (amber gradient) */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">¿Qué pasa si me paso del tope?</h2>
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="relative flex flex-col sm:flex-row items-start gap-4">
              <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {siguiente ? (
                  <>
                    <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      Si tu acumulado de los últimos 12 meses supera los {currencyFormatter.format(topeAnual)}, te
                      corresponde{" "}
                      <strong className="text-foreground">
                        recategorizarte a la categoría {siguiente.categoria}
                      </strong>
                      , cuyo tope anual es de {currencyFormatter.format(siguiente.ingresosBrutos)} (
                      {currencyFormatter.format(siguiente.ingresosBrutos / 12)} por mes en promedio).
                    </p>
                    <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      La recategorización es semestral: se hace en{" "}
                      <strong className="text-foreground">enero y julio</strong>. Si no la hacés vos, ARCA te
                      recategoriza de oficio cuando cruza datos.
                    </p>
                    <Link
                      href={`/monotributo/cuanto-puedo-facturar-por-mes/${siguiente.categoria.toLowerCase()}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-white/10 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-white/20 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-200 transition-colors"
                    >
                      Ver tope mensual categoría {siguiente.categoria} →
                    </Link>
                  </>
                ) : (
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    La categoría {upper} es la <strong className="text-foreground">más alta del Monotributo</strong>.
                    Si tu acumulado de los últimos 12 meses supera los {currencyFormatter.format(topeAnual)}, salís del
                    régimen simplificado y tenés que inscribirte como{" "}
                    <strong className="text-foreground">Responsable Inscripto</strong> en IVA y Ganancias.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main CTA: calculadora */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Planificá tu facturación mes a mes
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
              En la calculadora de GARCA cargás tu facturación real mes por mes y te mostramos en tiempo real si te vas
              a mantener en la categoría {upper} o conviene frenar la facturación para no saltar.{" "}
              <strong className="text-slate-900 dark:text-white">Sin registro, sin guardar datos.</strong>
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

        {(anterior || siguiente) && (
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Tope mensual de otras categorías</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anterior && (
                <Link
                  href={`/monotributo/cuanto-puedo-facturar-por-mes/${anterior.categoria.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.01] transition-all"
                >
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold uppercase tracking-wide">
                    ← Categoría anterior
                  </p>
                  <p className="text-base font-bold text-foreground">Categoría {anterior.categoria}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currencyFormatter.format(anterior.ingresosBrutos / 12)} por mes
                  </p>
                </Link>
              )}
              {siguiente && (
                <Link
                  href={`/monotributo/cuanto-puedo-facturar-por-mes/${siguiente.categoria.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.01] transition-all"
                >
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold uppercase tracking-wide">
                    Categoría siguiente →
                  </p>
                  <p className="text-base font-bold text-foreground">Categoría {siguiente.categoria}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currencyFormatter.format(siguiente.ingresosBrutos / 12)} por mes
                  </p>
                </Link>
              )}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Detalles completos de la categoría {upper}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Si querés ver la cuota mensual, desglose de aportes (SIPA, obra social), requisitos y comparativa con
            otras categorías, tenés la ficha completa acá:
          </p>
          <Link
            href={`/monotributo/categoria/${letra}`}
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-purple-300 dark:border-purple-800/60 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:border-purple-500 dark:hover:border-purple-600 hover:shadow-md px-5 py-2.5 text-sm font-semibold text-purple-700 dark:text-purple-200 transition-all"
          >
            Ver ficha completa categoría {upper}
            <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </section>

        <section className="space-y-4 mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Preguntas frecuentes — Facturación mensual categoría {upper}
          </h2>
          {faqEntries.map((entry) => (
            <details key={entry.question} className="rounded-xl border border-border bg-white dark:bg-background p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
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
