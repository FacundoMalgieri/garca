import type { Metadata } from "next";
import Link from "next/link";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { getGuideDateModified, monotributo2026FaqEntries } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "que-es-monotributo-2026", label: "Qué es el Monotributo en 2026" },
  { id: "que-cambio-2026", label: "Qué cambió en el Monotributo 2026" },
  { id: "fechas-clave", label: "Fechas clave del año 2026" },
  { id: "checklist-2026", label: "Checklist del monotributista 2026" },
];

export const metadata: Metadata = {
  title: "Monotributo 2026 — Guía completa, cambios y fechas clave del año",
  description:
    "Todo lo que tenés que saber del Monotributo en 2026: cómo funciona el régimen, cambios de ARCA, actualización semestral de valores, fechas de recategorización y checklist para el año.",
  keywords: [
    "monotributo 2026",
    "monotributo argentina 2026",
    "novedades monotributo",
    "actualizacion monotributo",
    "arca monotributo 2026",
    "recategorizacion 2026",
    "fechas monotributo 2026",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/2026` },
  openGraph: {
    title: "Monotributo 2026 — Guía completa, cambios y fechas clave",
    description:
      "Qué cambió en el Monotributo 2026, fechas de recategorización, valores actualizados y checklist para el monotributista.",
    type: "article",
    url: `${siteUrl}/monotributo/2026`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/monotributo-2026.png",
        width: 1200,
        height: 630,
        alt: "Monotributo 2026 — guía completa del año",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monotributo 2026 — Guía completa y fechas clave",
    description:
      "Cambios, actualizaciones de valores, recategorización y checklist del monotributista para 2026.",
    images: ["/og/monotributo-2026.png"],
  },
};

export default function Monotributo2026Page() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Monotributo 2026" },
        ]}
      />

      <ArticleHero
        image="/og/monotributo-2026.png"
        imageAlt="Monotributo 2026 — guía completa del año"
        badgeLabel="Guía anual"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title="Monotributo 2026: guía completa del año"
        description={
          <>
            Qué cambió en el Monotributo para 2026, cuándo y cómo actualizar tu categoría, qué implicó la
            transición de <strong className="text-white">AFIP a ARCA</strong> y un checklist práctico para que no
            se te pase ninguna fecha del año.
          </>
        }
        dateModified={dateModified}
        readingTime="5 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* Quick stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xs uppercase tracking-wide font-semibold">Categorías</p>
          </div>
          <p className="text-2xl font-bold text-foreground">11 vigentes</p>
          <p className="text-sm text-muted-foreground mt-1">De la A a la K</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-xs uppercase tracking-wide font-semibold">Actualización</p>
          </div>
          <p className="text-2xl font-bold text-foreground">Semestral</p>
          <p className="text-sm text-muted-foreground mt-1">Enero y julio</p>
        </div>
        <div className="rounded-2xl border border-violet-200 dark:border-violet-800/40 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs uppercase tracking-wide font-semibold">Organismo</p>
          </div>
          <p className="text-2xl font-bold text-foreground">ARCA</p>
          <p className="text-sm text-muted-foreground mt-1">Ex AFIP desde 2024</p>
        </div>
      </section>

      {/* Qué es el Monotributo */}
      <section className="mb-12">
        <h2
          id="que-es-monotributo-2026"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Qué es el Monotributo en 2026
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El <strong className="text-foreground">Monotributo</strong> es un régimen tributario simplificado de
          Argentina que unifica en una sola cuota mensual el impuesto integrado (que reemplaza IVA y Ganancias),
          los aportes jubilatorios (SIPA) y la obra social. En 2026 sigue vigente con{" "}
          <strong className="text-foreground">11 categorías de la A a la K</strong>, y los valores de cuotas y
          topes de facturación se actualizan dos veces por año.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Para ver el detalle de cada categoría con su cuota mensual y su tope anual de facturación, consultá la{" "}
          <Link
            href="/monotributo"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            guía de categorías del Monotributo
          </Link>
          , que se mantiene al día con los valores oficiales de ARCA.
        </p>
      </section>

      {/* Cambios 2026 */}
      <section className="mb-12">
        <h2
          id="que-cambio-2026"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Qué cambió en el Monotributo 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-5">
            <h3 className="text-lg font-bold text-foreground mb-2">Actualización de topes y cuotas</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Los <strong className="text-foreground">topes anuales de facturación</strong> y las{" "}
              <strong className="text-foreground">cuotas mensuales</strong> se actualizan cada enero y cada julio
              siguiendo la evolución del índice de inflación. La actualización no requiere ninguna acción de tu
              parte: se aplica automáticamente en tu categoría vigente.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/70 to-green-50/70 dark:from-emerald-950/20 dark:to-green-950/20 p-5">
            <h3 className="text-lg font-bold text-foreground mb-2">ARCA reemplazó a AFIP</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Desde fines de 2024, AFIP pasó a llamarse <strong className="text-foreground">ARCA</strong> (Agencia
              de Recaudación y Control Aduanero). Para el monotributista cambió el nombre, el dominio web y el
              logo, pero no las obligaciones ni los plazos.{" "}
              <Link
                href="/monotributo/arca-vs-afip"
                className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
              >
                Ver qué cambió en detalle →
              </Link>
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/70 to-orange-50/70 dark:from-amber-950/20 dark:to-orange-950/20 p-5">
            <h3 className="text-lg font-bold text-foreground mb-2">Facturación electrónica obligatoria</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Todos los comprobantes que emitas tienen que ser{" "}
              <strong className="text-foreground">electrónicos con CAE</strong>. En 2026 no existen excepciones
              para el monotributista que vende a consumidor final: el talonario manual ya no es válido para nuevas
              emisiones.
            </p>
          </div>
          <div className="rounded-2xl border border-violet-200 dark:border-violet-800/40 bg-gradient-to-br from-violet-50/70 to-purple-50/70 dark:from-violet-950/20 dark:to-purple-950/20 p-5">
            <h3 className="text-lg font-bold text-foreground mb-2">Cruces de información</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              ARCA cruza datos con <strong className="text-foreground">bancos, billeteras virtuales, tarjetas y
              plataformas de pago</strong>. Si tu facturación electrónica no coincide con los movimientos que ven,
              pueden aparecer intimaciones o recategorizaciones de oficio.
            </p>
          </div>
        </div>
      </section>

      {/* Fechas clave */}
      <section className="mb-12">
        <h2
          id="fechas-clave"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Fechas clave del año 2026
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          El calendario del monotributista se mueve sobre tres fechas recurrentes: la recategorización de enero,
          la de julio y el vencimiento mensual de la cuota. A esto se suman las actualizaciones de valores que
          ARCA publica antes de cada período.
        </p>
        <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Cuándo</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Qué pasa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Enero</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  Recategorización semestral. Evaluás tus ingresos de los últimos 12 meses (enero a diciembre
                  del año anterior) y ajustás categoría si corresponde.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Todo el año</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  Pago mensual de la cuota, con vencimiento el día 20 de cada mes (se corre al día hábil siguiente
                  si cae feriado o fin de semana).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Julio</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  Segunda recategorización del año. Evalúa el acumulado de los últimos 12 meses (julio del año
                  anterior a junio del actual).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          ¿Cómo se hace exactamente?{" "}
          <Link
            href="/monotributo/recategorizacion"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            Guía paso a paso de recategorización →
          </Link>
        </p>
      </section>

      {/* Checklist */}
      <section className="mb-12">
        <h2
          id="checklist-2026"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Checklist del monotributista 2026
        </h2>
        <ol className="space-y-3">
          {[
            {
              title: "Confirmá tu categoría actual en ARCA",
              body: "Entrá a arca.gob.ar con CUIT y clave fiscal, abrí el servicio Monotributo y verificá qué categoría tenés vigente. Es el punto de partida para todo lo demás.",
            },
            {
              title: "Proyectá tu facturación del año",
              body: "Simulá cuánto vas a facturar en los próximos 12 meses para anticipar si te vas a pasar del tope y planificar en qué categoría vas a quedar en la próxima recategorización.",
            },
            {
              title: "Emití siempre factura electrónica",
              body: "Todo comprobante tiene que tener CAE. Como monotributista emitís factura C (mercado local) o factura E (exportación de servicios).",
            },
            {
              title: "Pagá la cuota antes del día 20",
              body: "El vencimiento es el 20 de cada mes. Podés pagar por débito automático, Interbanking, VEP o billetera virtual.",
            },
            {
              title: "Recategorizate en enero y en julio",
              body: "Aunque no cambie tu categoría, revisar el acumulado te permite detectar a tiempo si conviene subir, bajar o corregir los parámetros no monetarios (energía, superficie, alquiler).",
            },
          ].map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-border bg-white dark:bg-background p-5"
            >
              <span className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold shadow-sm">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <RelatedGuides currentHref="/monotributo/2026" className="mb-12" />

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Proyectá tu año con la calculadora
          </h2>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
            Cargá tu facturación mes a mes y vas a ver en qué categoría quedás en la próxima
            recategorización.{" "}
            <strong className="text-slate-900 dark:text-white">Gratis, sin registro, sin guardar datos.</strong>
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

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={monotributo2026FaqEntries} />
      </section>
    </div>
  );
}
