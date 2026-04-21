import type { Metadata } from "next";
import Link from "next/link";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { getGuideDateModified, recategorizacionFaqEntries } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "que-es-la-recategorizacion", label: "¿Qué es la recategorización?" },
  { id: "cuando-se-hace", label: "¿Cuándo se hace?" },
  { id: "que-evalua-arca", label: "¿Qué evalúa ARCA?" },
  { id: "paso-a-paso", label: "Paso a paso en ARCA" },
  { id: "recategorizacion-de-oficio", label: "Recategorización de oficio" },
];

export const metadata: Metadata = {
  title: "Recategorización del Monotributo 2026 — Guía paso a paso",
  description:
    "Cuándo y cómo recategorizarte en el Monotributo en 2026: fechas de enero y julio, qué datos evalúa ARCA, recategorización de oficio y qué pasa si no la hacés.",
  keywords: [
    "recategorización monotributo",
    "recategorización monotributo 2026",
    "cuándo recategorizarse monotributo",
    "cómo recategorizarse monotributo",
    "recategorización de oficio monotributo",
    "monotributo enero julio",
    "arca recategorización",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/recategorizacion` },
  openGraph: {
    title: "Recategorización del Monotributo 2026 — Guía paso a paso",
    description:
      "Cuándo y cómo recategorizarte, qué evalúa ARCA y qué pasa si no te recategorizás. Guía oficial actualizada a 2026.",
    type: "article",
    url: `${siteUrl}/monotributo/recategorizacion`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/recategorizacion.png",
        width: 1200,
        height: 630,
        alt: "Recategorización del Monotributo paso a paso",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/recategorizacion.png"],
    title: "Recategorización del Monotributo 2026 — Guía paso a paso",
    description:
      "Cuándo y cómo recategorizarte, qué evalúa ARCA y qué pasa si no te recategorizás. Guía oficial 2026.",
  },
};

export default function RecategorizacionPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Guías", href: "/guias" },
            { label: "Recategorización" },
          ]}
        />

        <ArticleHero
          image="/og/recategorizacion.png"
          imageAlt="Recategorización del Monotributo"
          badgeLabel="Guía oficial 2026"
          badgeIcon={
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Recategorización del Monotributo 2026"
          description={
            <>
              La <strong className="text-white">recategorización del Monotributo</strong> es el trámite semestral
              en el que actualizás tu categoría según tus ingresos de los últimos 12 meses. Se hace en{" "}
              <strong className="text-white">enero y julio</strong>, en el portal de{" "}
              <Link
                href="/monotributo/arca-vs-afip"
                className="text-cyan-300 hover:text-white underline-offset-2 hover:underline font-semibold"
              >
                ARCA (ex AFIP)
              </Link>
              .
            </>
          }
          dateModified={dateModified}
          readingTime="5 min de lectura"
        />

        <TableOfContents items={tocItems} className="mb-10" />

        {/* Quick summary stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Frecuencia</p>
            </div>
            <p className="text-2xl font-bold text-foreground">2 veces / año</p>
            <p className="text-sm text-muted-foreground mt-1">Enero y julio</p>
          </div>
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Plazo</p>
            </div>
            <p className="text-2xl font-bold text-foreground">Primeros días</p>
            <p className="text-sm text-muted-foreground mt-1">De febrero y de agosto</p>
          </div>
          <div className="rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xs uppercase tracking-wide font-semibold">Ventana</p>
            </div>
            <p className="text-2xl font-bold text-foreground">12 meses móviles</p>
            <p className="text-sm text-muted-foreground mt-1">Acumulado previo</p>
          </div>
        </section>

        {/* ¿Qué es? */}
        <section className="mb-12">
          <h2
            id="que-es-la-recategorizacion"
            className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
          >
            ¿Qué es la recategorización?
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            La recategorización es el trámite en el que un <strong className="text-foreground">monotributista
            actualiza su categoría</strong> en base a sus ingresos y parámetros de actividad de los últimos 12 meses.
            Sirve para que la categoría registrada en ARCA refleje tu situación real de facturación y pagues la
            cuota correspondiente: si creció tu facturación, subís; si bajó, podés bajar y pagar menos.
          </p>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            Es un trámite <strong className="text-foreground">semestral y obligatorio cuando hay cambio de
            categoría</strong>. Si seguís en la misma, técnicamente no estás obligado a hacer nada, aunque muchos
            monotributistas hacen el trámite igualmente para confirmarlo.
          </p>
        </section>

        {/* Cuándo */}
        <section className="mb-12">
          <h2
            id="cuando-se-hace"
            className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
          >
            ¿Cuándo se hace?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-5">
              <h3 className="text-lg font-bold text-foreground mb-2">Primera recategorización</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                Entre <strong className="text-foreground">enero y principios de febrero</strong>. Evalúa los
                ingresos de los últimos 12 meses (enero a diciembre del año anterior).
              </p>
              <p className="text-xs text-muted-foreground">
                Vigencia: desde febrero hasta la siguiente recategorización de julio.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-5">
              <h3 className="text-lg font-bold text-foreground mb-2">Segunda recategorización</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                Entre <strong className="text-foreground">julio y principios de agosto</strong>. Evalúa los ingresos
                de los últimos 12 meses (julio del año anterior a junio del año en curso).
              </p>
              <p className="text-xs text-muted-foreground">
                Vigencia: desde agosto hasta la siguiente recategorización de enero.
              </p>
            </div>
          </div>
        </section>

        {/* Qué evalúa ARCA */}
        <section className="mb-12">
          <h2
            id="que-evalua-arca"
            className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
          >
            ¿Qué evalúa ARCA?
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Cuando te recategorizás, ARCA mira cuatro parámetros y te ubica en la categoría que corresponda según el
            más alto. En la práctica, para la mayoría de monotributistas <strong className="text-foreground">los
            ingresos brutos son el parámetro determinante</strong>, pero los otros tres pueden forzar una categoría
            superior si tu local es muy grande, consume mucha energía o pagás alquileres altos.
          </p>
          <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Parámetro</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Qué mira</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 font-semibold text-foreground">Ingresos brutos</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    Total facturado en los últimos 12 meses (en Monotributo la factura C no discrimina IVA: se cuenta
                    el total del comprobante). Se compara con el tope anual de cada categoría.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-foreground">Energía eléctrica</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    Kilowatts-hora consumidos durante el año. Cada categoría tiene un tope máximo de kWh permitido.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-foreground">Superficie afectada</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    Metros cuadrados del local / oficina donde desarrollás la actividad (solo aplica si tenés local
                    comercial).
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-foreground">Alquileres devengados</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    Total anual de alquileres que pagás por el local, oficina o inmueble afectado a tu actividad.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Paso a paso */}
        <section className="mb-12">
          <h2
            id="paso-a-paso"
            className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
          >
            Paso a paso en ARCA
          </h2>
          <ol className="space-y-4">
            {[
              {
                title: "Calculá tus ingresos de los últimos 12 meses",
                body: "Sumá el total facturado (importe final de cada comprobante C emitido) de los últimos 12 meses. Incluí ventas de bienes, servicios y honorarios. En Monotributo no hay que restar IVA porque la factura C no lo discrimina: lo que se compara con el tope anual es el total bruto de los comprobantes.",
              },
              {
                title: "Ingresá a ARCA con CUIT y clave fiscal",
                body: "Entrá a arca.gob.ar y autenticate con CUIT y clave fiscal (nivel 3 o superior). Desde el panel de servicios, abrí 'Monotributo'.",
              },
              {
                title: "Seleccioná 'Recategorización'",
                body: "Dentro de Monotributo buscá la opción de recategorización semestral. El sistema te muestra tu categoría actual y los parámetros del período.",
              },
              {
                title: "Completá los 4 parámetros",
                body: "Cargá ingresos brutos, energía eléctrica (kWh anuales), superficie y alquileres devengados. El sistema sugiere automáticamente la categoría que corresponde.",
              },
              {
                title: "Confirmá la recategorización",
                body: "Revisá que la categoría sugerida sea correcta y confirmá. Desde ese momento, la nueva cuota mensual se aplica al mes siguiente (febrero o agosto).",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-white dark:bg-background p-5">
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

        {/* Recategorización de oficio */}
        <section className="mb-12">
          <h2
            id="recategorizacion-de-oficio"
            className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
          >
            Recategorización de oficio
          </h2>
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="relative flex flex-col sm:flex-row items-start gap-4">
              <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  Si no te recategorizaste en la ventana de enero o julio <strong className="text-foreground">y
                  correspondía hacerlo</strong>, ARCA te recategoriza automáticamente cuando cruza tus datos (facturación
                  electrónica, consumo de energía, bancos y billeteras virtuales). Esto se llama{" "}
                  <strong className="text-foreground">recategorización de oficio</strong>.
                </p>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  Las consecuencias son: pagar la diferencia de cuota retroactiva más una multa del{" "}
                  <strong className="text-foreground">50% del impuesto integrado y la cotización previsional omitidos
                  </strong>. Tenés derecho a manifestar disconformidad dentro de los 15 días de notificada la
                  recategorización a través del servicio "Presentaciones Digitales" de ARCA.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Proyectá tu próxima recategorización
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
              Usá la calculadora de GARCA para simular distintos escenarios de facturación y ver en qué categoría vas
              a quedar en enero o julio. <strong className="text-slate-900 dark:text-white">Gratis, sin registro, sin
              guardar datos.</strong>
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

        <RelatedGuides currentHref="/monotributo/recategorizacion" className="mb-12" />

        <div className="mb-12">
          <SupportBanner />
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
          <FaqAccordion items={recategorizacionFaqEntries} />
        </section>
    </div>
  );
}
