import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoriaCard } from "@/components/monotributo/CategoriaCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
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
          className="mb-4"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Monotributo", href: "/monotributo" },
            { label: `Categoría ${upper}` },
          ]}
        />


        <header className="mb-8">
          <span className="inline-flex items-center justify-center rounded-md bg-primary/10 dark:bg-primary/30 text-primary dark:text-white px-3 py-1 text-sm font-semibold mb-3">
            Categoría {upper}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Monotributo Categoría {upper} 2026 — Cuánto Pago y Cuánto Puedo Facturar
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-3">
            Todo lo que tenés que saber de la <strong className="text-foreground">categoría {upper}</strong>: cuota
            mensual, tope anual de facturación, desglose de aportes y requisitos. Datos oficiales de ARCA, actualizados
            a 2026.
          </p>
          <p className="text-xs text-muted-foreground">
            Actualizado el{" "}
            <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border border-primary/30 dark:border-primary/60 bg-primary/5 dark:bg-primary/20 p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Cuota mensual (servicios)</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
              {currencyFormatter.format(categoria.total.servicios)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Venta de bienes: {currencyFormatter.format(categoria.total.venta)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white dark:bg-background p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tope anual de facturación</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
              {currencyFormatter.format(categoria.ingresosBrutos)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Acumulado últimos 12 meses</p>
          </div>
          <div className="rounded-lg border border-border bg-white dark:bg-background p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Promedio mensual máximo</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
              {currencyFormatter.format(topeMensual)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tope anual dividido 12</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Desglose de la cuota mensual
          </h2>
          <div className="rounded-lg border border-border bg-white dark:bg-background overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
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
                <tr className="bg-muted/20 font-semibold">
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

        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Requisitos adicionales</h2>
          <div className="rounded-lg border border-border bg-white dark:bg-background p-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Superficie afectada</dt>
                <dd className="font-medium text-foreground mt-1">{categoria.superficieAfectada}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Energía eléctrica consumida</dt>
                <dd className="font-medium text-foreground mt-1">{categoria.energiaElectrica}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Alquileres devengados (anual)</dt>
                <dd className="font-medium text-foreground mt-1">
                  Hasta {currencyFormatter.format(categoria.alquileres)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Precio unitario máximo</dt>
                <dd className="font-medium text-foreground mt-1">
                  {currencyFormatter.format(categoria.precioUnitarioMax)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {(anterior || siguiente) && (
          <section className="mb-10">
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

        <section className="rounded-lg border border-primary/30 dark:border-primary/60 bg-primary/5 dark:bg-primary/20 p-6 mb-10">
          <h2 className="text-xl font-bold text-foreground mb-2">
            ¿Vas a quedar en la categoría {upper}?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Calculá si con tu facturación actual te corresponde esta categoría o conviene planificar para mantenerte
            en otra. La calculadora de GARCA es gratis y no guarda tus datos.
          </p>
          <Link
            href="/calculadora-monotributo"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Abrir calculadora →
          </Link>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Preguntas frecuentes — Categoría {upper}</h2>
          {faqEntries.map((entry) => (
            <details key={entry.question} className="rounded-lg border border-border bg-white dark:bg-background p-4">
              <summary className="cursor-pointer text-base font-semibold text-foreground">{entry.question}</summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{entry.answer}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
