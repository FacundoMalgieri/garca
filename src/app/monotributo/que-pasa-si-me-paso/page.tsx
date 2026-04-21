import type { Metadata } from "next";
import Link from "next/link";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import { getGuideDateModified, quePasaSiMePasoFaqEntries } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateModified = getGuideDateModified();

export const metadata: Metadata = {
  title: "¿Qué pasa si me paso del Monotributo? — Guía 2026",
  description:
    "Qué pasa si superás el tope del Monotributo en 2026: recategorización obligatoria, recategorización de oficio, exclusión del régimen y pase a Responsable Inscripto.",
  keywords: [
    "me pase del monotributo",
    "superé el monotributo",
    "qué pasa si me paso del monotributo",
    "exclusión monotributo",
    "recategorización de oficio",
    "pasar a responsable inscripto",
    "monotributo 2026",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/que-pasa-si-me-paso` },
  openGraph: {
    title: "¿Qué pasa si me paso del Monotributo? — Guía 2026",
    description:
      "Recategorización, recategorización de oficio, exclusión y pase a Responsable Inscripto. Guía 2026 actualizada.",
    type: "article",
    url: `${siteUrl}/monotributo/que-pasa-si-me-paso`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/que-pasa-si-me-paso.png",
        width: 1200,
        height: 630,
        alt: "Qué pasa si te pasás del tope del Monotributo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/que-pasa-si-me-paso.png"],
    title: "¿Qué pasa si me paso del Monotributo? — Guía 2026",
    description:
      "Recategorización, recategorización de oficio, exclusión y pase a Responsable Inscripto.",
  },
};

export default function QuePasaSiMePasoPage() {
  const categoriaK = MONOTRIBUTO_DATA.categorias[MONOTRIBUTO_DATA.categorias.length - 1];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Guías", href: "/guias" },
            { label: "¿Qué pasa si me paso?" },
          ]}
        />

        <ArticleHero
          image="/og/que-pasa-si-me-paso.png"
          imageAlt="¿Qué pasa si me paso del Monotributo?"
          badgeLabel="Excedí el tope — ¿qué hago?"
          badgeIcon={
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          title="¿Qué pasa si me paso del Monotributo?"
          description={
            <>
              Si tu facturación de los últimos 12 meses superó el tope de tu categoría, hay{" "}
              <strong className="text-white">tres escenarios posibles</strong>: recategorización a una categoría
              superior del Monotributo, recategorización de oficio por parte de ARCA, o exclusión del régimen
              simplificado y pase obligatorio a Responsable Inscripto. Acá te explicamos cada uno.
            </>
          }
          dateModified={dateModified}
          readingTime="6 min de lectura"
        />

        {/* Ventana móvil explainer */}
        <section className="mb-12 relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 md:p-7">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Primero: ¿realmente te pasaste?</h2>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                El Monotributo <strong className="text-foreground">no controla mes por mes</strong>, controla el
                acumulado de los últimos 12 meses corridos (ventana móvil). Podés tener un mes pico muy alto sin
                problemas, siempre que el total anualizado no supere el tope de tu categoría.
              </p>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Antes de asumir que te pasaste, sumá el total facturado (importe final de todas las facturas C
                emitidas) en los últimos 12 meses y compará con el tope anual de tu categoría. Si el total sigue
                debajo del tope, no pasa nada.
              </p>
            </div>
          </div>
        </section>

        {/* 3 Escenarios */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Los 3 escenarios posibles</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* Escenario 1 */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/30 dark:to-green-950/30 p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white flex items-center justify-center font-bold shadow-sm">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-2">Recategorización a categoría superior</h3>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    Es el escenario más común y menos grave. Tu facturación superó el tope de tu categoría actual,
                    pero sigue por debajo del tope de la categoría K. Simplemente tenés que recategorizarte a una
                    categoría superior en la próxima ventana (enero o julio).
                  </p>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-foreground">Qué hacer:</strong> entrar a ARCA en enero o julio, hacer
                    el trámite de recategorización y confirmar la categoría que te sugiere el sistema. La nueva
                    cuota se aplica al mes siguiente.
                  </p>
                </div>
              </div>
            </div>

            {/* Escenario 2 */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-2">Recategorización de oficio</h3>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    Pasa cuando te pasaste del tope y <strong className="text-foreground">no te recategorizaste
                    en término</strong>. ARCA detecta la situación cuando cruza tus datos (facturación electrónica,
                    bancos) y te recategoriza automáticamente.
                  </p>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-foreground">Consecuencias:</strong> diferencia de cuota retroactiva
                    desde el momento en que debías haber subido, más una multa del 50% del impuesto integrado y
                    la cotización previsional omitidos. Para evitarla, siempre recategorizate vos en la ventana
                    que corresponde.
                  </p>
                </div>
              </div>
            </div>

            {/* Escenario 3 */}
            <div className="rounded-2xl border border-rose-200 dark:border-rose-800/40 bg-gradient-to-br from-rose-50/80 to-red-50/80 dark:from-rose-950/30 dark:to-red-950/30 p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-white flex items-center justify-center font-bold shadow-sm">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-2">Exclusión del régimen</h3>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    Tu acumulado de los últimos 12 meses supera el tope de la categoría K (
                    {currencyFormatter.format(categoriaK.ingresosBrutos)}). Quedás automáticamente excluido del
                    Monotributo y tenés que inscribirte como <strong className="text-foreground">Responsable
                    Inscripto</strong> en IVA y Ganancias.
                  </p>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    <strong className="text-foreground">Qué implica:</strong> empezar a liquidar IVA mensualmente
                    (10,5% o 21% según la actividad), presentar Ganancias anual, emitir factura A en vez de C, y
                    tener que llevar una contabilidad más prolija. Se recomienda consultar con un contador.
                  </p>
                  <Link
                    href="/monotributo/vs-responsable-inscripto"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 transition-colors"
                  >
                    Ver comparativa Monotributo vs Responsable Inscripto →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cuándo se detecta */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">¿Cuándo detecta ARCA que me pasé?</h2>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            ARCA tiene varios mecanismos automáticos para identificar monotributistas que excedieron sus topes:
          </p>
          <ul className="space-y-3">
            {[
              {
                title: "Facturación electrónica",
                body: "Todos los comprobantes del Monotributo son electrónicos y quedan automáticamente registrados en ARCA. La suma de facturación está siempre disponible para el fisco.",
              },
              {
                title: "Cruce con terceros",
                body: "ARCA cruza datos con bancos, tarjetas de crédito, plataformas de pago (MercadoPago, PayPal), y organismos provinciales (Ingresos Brutos).",
              },
              {
                title: "Ventana semestral",
                body: "En enero y julio, el sistema automáticamente evalúa tus parámetros. Si cruzaste el tope y no te recategorizaste, puede ejecutar la recategorización de oficio.",
              },
              {
                title: "Fiscalizaciones",
                body: "En casos específicos ARCA puede iniciar una fiscalización formal que mira tu situación durante los últimos 5 años.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-border bg-white dark:bg-background p-4 flex gap-3"
              >
                <span className="shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground mb-1">{item.title}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Mirá tu situación actual
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
              Entrá a GARCA con tus credenciales de ARCA (no se guardan en ningún servidor) o usá la calculadora
              gratuita con tus datos de facturación para ver si estás cerca del tope y cuánto margen tenés.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/ingresar"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all"
              >
                Ingresar a GARCA
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/calculadora-monotributo"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-200 dark:border-blue-800/60 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-blue-700 dark:text-blue-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-105"
              >
                Usar calculadora
              </Link>
            </div>
          </div>
        </section>

        <RelatedGuides currentHref="/monotributo/que-pasa-si-me-paso" className="mb-12" />

        <div className="mb-12">
          <SupportBanner />
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
          <FaqAccordion items={quePasaSiMePasoFaqEntries} />
        </section>
    </div>
  );
}
