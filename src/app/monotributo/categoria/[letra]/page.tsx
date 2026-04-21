import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoriaCard } from "@/components/monotributo/CategoriaCard";
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

  const pageUrl = `${siteUrl}/monotributo/categoria/${letra}`;
  const cuotaStr = currencyFormatter.format(categoria.total.servicios);
  const topeStr = currencyFormatter.format(categoria.ingresosBrutos);

  return {
    title: `Monotributo Categoría ${upper} 2026 — Cuota ${cuotaStr} / mes`,
    description: `Categoría ${upper} del Monotributo 2026: cuota mensual de ${cuotaStr}, tope anual de facturación de ${topeStr}. Desglose de aportes, requisitos y comparativa con otras categorías.`,
    keywords: [
      `monotributo categoria ${upper.toLowerCase()}`,
      `categoria ${upper.toLowerCase()} monotributo 2026`,
      `cuota monotributo ${upper.toLowerCase()}`,
      `tope monotributo categoria ${upper.toLowerCase()}`,
      `cuanto pago monotributo categoria ${upper.toLowerCase()}`,
      `monotributo ${upper.toLowerCase()} 2026`,
      "monotributo argentina",
      "ARCA monotributo",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: pageUrl,
      siteName: "GARCA",
      title: `Monotributo Categoría ${upper} 2026`,
      description: `Cuota mensual ${cuotaStr}, tope anual ${topeStr}. Desglose completo de la categoría ${upper}.`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `Monotributo Categoría ${upper} — GARCA`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Monotributo Categoría ${upper} — Cuota y Tope 2026`,
      description: `Cuota ${cuotaStr} / mes — Tope anual ${topeStr}.`,
      images: ["/og-image.png"],
    },
  };
}

export default async function CategoriaPage({
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

  const pageUrl = `${siteUrl}/monotributo/categoria/${letra}`;
  const topeMensual = categoria.ingresosBrutos / 12;
  const topeAnteriorStr = anterior ? currencyFormatter.format(anterior.ingresosBrutos) : "-";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
      { "@type": "ListItem", position: 3, name: `Categoría ${upper}`, item: pageUrl },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Monotributo Categoría ${upper} 2026 — Cuánto Pago y Cuánto Puedo Facturar`,
    description: `Categoría ${upper} del Monotributo 2026: cuota mensual de ${currencyFormatter.format(
      categoria.total.servicios
    )}, tope anual de facturación de ${currencyFormatter.format(
      categoria.ingresosBrutos
    )}. Desglose de aportes, requisitos y comparativa con otras categorías.`,
    author: { "@type": "Person", name: "Facundo Malgieri", url: "https://github.com/FacundoMalgieri" },
    publisher: { "@type": "Organization", name: "GARCA", url: siteUrl },
    datePublished: "2026-01-20",
    dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: "es-AR",
  };

  const faqEntries = [
    {
      question: `¿Cuánto se paga por la categoría ${upper} del Monotributo en 2026?`,
      answer: `La cuota mensual de la categoría ${upper} es de ${currencyFormatter.format(
        categoria.total.servicios
      )} para servicios y ${currencyFormatter.format(
        categoria.total.venta
      )} para venta de bienes. Incluye impuesto integrado, aportes jubilatorios (SIPA) y obra social.`,
    },
    {
      question: `¿Cuánto puedo facturar en la categoría ${upper}?`,
      answer: `El tope anual de facturación de la categoría ${upper} es de ${currencyFormatter.format(
        categoria.ingresosBrutos
      )}. Esto da un promedio de ${currencyFormatter.format(
        topeMensual
      )} por mes. Si superás ese monto en los últimos 12 meses, tenés que subir de categoría.`,
    },
    anterior
      ? {
          question: `¿Cuál es la diferencia entre la categoría ${upper} y la ${anterior.categoria}?`,
          answer: `La categoría ${upper} permite facturar hasta ${currencyFormatter.format(
            categoria.ingresosBrutos
          )} al año, mientras que la ${anterior.categoria} tope en ${topeAnteriorStr}. La cuota mensual pasa de ${currencyFormatter.format(
            anterior.total.servicios
          )} (${anterior.categoria}) a ${currencyFormatter.format(
            categoria.total.servicios
          )} (${upper}) para servicios.`,
        }
      : {
          question: `¿Qué pasa si gano menos del tope de la categoría ${upper}?`,
          answer: `La categoría ${upper} es la más baja del Monotributo. Si tus ingresos son menores al tope anual, seguís pagando la cuota de la ${upper} igual — no hay una categoría inferior. Si tu actividad no supera este monto, esta es tu categoría correspondiente.`,
        },
    siguiente
      ? {
          question: `¿Qué pasa si supero el tope de la categoría ${upper}?`,
          answer: `Si superás los ${currencyFormatter.format(
            categoria.ingresosBrutos
          )} anuales, tenés que recategorizarte a la categoría ${siguiente.categoria}, cuya cuota mensual es de ${currencyFormatter.format(
            siguiente.total.servicios
          )} para servicios. La recategorización se hace en enero o julio. Si no la hacés, ARCA te recategoriza de oficio.`,
        }
      : {
          question: `¿Qué pasa si supero el tope de la categoría ${upper}?`,
          answer: `La categoría ${upper} es la más alta del Monotributo. Si superás su tope anual de ${currencyFormatter.format(
            categoria.ingresosBrutos
          )}, salís del régimen simplificado y tenés que inscribirte como Responsable Inscripto en IVA y Ganancias.`,
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
            { label: `Categoría ${upper}` },
          ]}
        />

        {/* Hero with gradient + big letter badge */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-10 mb-10 shadow-[0_8px_40px_-8px_rgba(99,102,241,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/25 to-purple-400/25 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/25 to-cyan-400/25 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

          <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
            <span className="shrink-0 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white text-3xl font-bold shadow-lg shadow-indigo-500/30">
              {upper}
            </span>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3 backdrop-blur-sm">
                Categoría {upper} · Monotributo 2026
              </span>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                Monotributo Categoría {upper} 2026 — Cuánto Pago y Cuánto Puedo Facturar
              </h1>
              <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 max-w-3xl mb-3">
                Todo lo que tenés que saber de la{" "}
                <strong className="text-slate-900 dark:text-white">categoría {upper}</strong>: cuota mensual, tope
                anual de facturación, desglose de aportes y requisitos. Datos oficiales de ARCA, actualizados a 2026.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Actualizado el{" "}
                <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
              </p>
            </div>
          </div>
        </section>

        {/* Stat cards with colored gradients */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Cuota mensual (servicios)</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {currencyFormatter.format(categoria.total.servicios)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Venta de bienes: {currencyFormatter.format(categoria.total.venta)}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Tope anual de facturación</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {currencyFormatter.format(categoria.ingresosBrutos)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Acumulado últimos 12 meses</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Promedio mensual máximo</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {currencyFormatter.format(topeMensual)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tope anual ÷ 12</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Desglose de la cuota mensual
          </h2>
          <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Componente</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Servicios</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Venta de bienes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-foreground">Impuesto integrado</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {currencyFormatter.format(categoria.impuestoIntegrado.servicios)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {currencyFormatter.format(categoria.impuestoIntegrado.venta)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground">Aportes jubilatorios (SIPA)</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {currencyFormatter.format(categoria.aportesSIPA)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {currencyFormatter.format(categoria.aportesSIPA)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground">Obra social</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {currencyFormatter.format(categoria.aportesObraSocial)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {currencyFormatter.format(categoria.aportesObraSocial)}
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 font-semibold">
                  <td className="px-4 py-3 text-foreground">Total</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {currencyFormatter.format(categoria.total.servicios)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {currencyFormatter.format(categoria.total.venta)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Desde la categoría C en adelante, el impuesto integrado es menor para quienes venden bienes respecto de
            quienes prestan servicios.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Requisitos adicionales</h2>
          <div className="rounded-2xl border border-border bg-white dark:bg-background p-5 shadow-sm">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/15 to-indigo-500/15 dark:from-blue-500/25 dark:to-indigo-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Superficie afectada</dt>
                  <dd className="font-semibold text-foreground mt-0.5">{categoria.superficieAfectada}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/15 dark:from-amber-500/25 dark:to-orange-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Energía eléctrica consumida</dt>
                  <dd className="font-semibold text-foreground mt-0.5">{categoria.energiaElectrica}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500/15 to-green-500/15 dark:from-emerald-500/25 dark:to-green-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Alquileres devengados (anual)</dt>
                  <dd className="font-semibold text-foreground mt-0.5">
                    Hasta {currencyFormatter.format(categoria.alquileres)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500/15 to-pink-500/15 dark:from-purple-500/25 dark:to-pink-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 12h10m-10 5h6" />
                  </svg>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Precio unitario máximo</dt>
                  <dd className="font-semibold text-foreground mt-0.5">
                    {currencyFormatter.format(categoria.precioUnitarioMax)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        {(anterior || siguiente) && (
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Categorías vecinas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anterior && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">← Categoría anterior</p>
                  <CategoriaCard categoria={anterior} />
                </div>
              )}
              {siguiente && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Categoría siguiente →</p>
                  <CategoriaCard categoria={siguiente} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA: tope mensual detallado (purple gradient) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-rose-950/40 border border-purple-200 dark:border-purple-800/30 p-6 md:p-8 mb-6 shadow-[0_8px_40px_-8px_rgba(168,85,247,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              ¿Cuánto puedo facturar por mes en la categoría {upper}?
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
              El tope anual de {currencyFormatter.format(categoria.ingresosBrutos)} equivale a{" "}
              <strong className="text-slate-900 dark:text-white">{currencyFormatter.format(topeMensual)}</strong> por
              mes en promedio. El cálculo es una ventana móvil de los últimos 12 meses, no un límite mes a mes. Mirá el
              desglose semanal y diario, más qué pasa si te pasás.
            </p>
            <Link
              href={`/monotributo/cuanto-puedo-facturar-por-mes/${letra}`}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all"
            >
              Ver tope mensual detallado
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* CTA: calculadora (blue gradient) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              ¿Vas a quedar en la categoría {upper}?
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
              Calculá si con tu facturación actual te corresponde esta categoría o conviene planificar para mantenerte
              en otra. <strong className="text-slate-900 dark:text-white">La calculadora de GARCA es gratis y no guarda tus datos.</strong>
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

        <section className="space-y-4 mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Preguntas frecuentes — Categoría {upper}</h2>
          {faqEntries.map((entry) => (
            <details key={entry.question} className="rounded-xl border border-border bg-white dark:bg-background p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
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
