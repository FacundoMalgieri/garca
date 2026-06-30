import type { Metadata } from "next";
import Link from "next/link";

import { NativeAd } from "@/components/ads/NativeAd";
import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { declararExteriorFaqEntries, getGuideDateModified } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "computan-tope", label: "¿Cuentan para el tope del Monotributo?" },
  { id: "como-facturar", label: "Cómo facturar al exterior (factura E)" },
  { id: "como-se-computa", label: "Cómo se computa el ingreso para recategorizar" },
  { id: "si-me-paso", label: "¿Y si el ingreso del exterior me pasa del tope?" },
  { id: "paso-a-paso", label: "Paso a paso para estar en regla" },
  { id: "errores-comunes", label: "Errores comunes" },
];

export const metadata: Metadata = {
  title: "Cómo declarar ingresos del exterior en el Monotributo (2026)",
  description:
    "Cómo declarar ingresos del exterior siendo monotributista en 2026: por qué los cobros de clientes del exterior sí cuentan para el tope anual, cómo facturarlos con factura E, cómo se computan para la recategorización y qué pasa si te pasás.",
  keywords: [
    "declarar ingresos del exterior monotributo",
    "facturar al exterior monotributo",
    "ingresos exterior recategorizacion monotributo",
    "exportacion de servicios monotributo",
    "cobrar del exterior monotributo",
    "monotributo dolares tope",
    "factura e monotributo",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/declarar-ingresos-exterior` },
  openGraph: {
    title: "Cómo declarar ingresos del exterior en el Monotributo (2026)",
    description:
      "Los cobros del exterior sí computan para el tope del Monotributo. Cómo facturarlos, cómo se computan para recategorizar y qué pasa si te pasás.",
    type: "article",
    url: `${siteUrl}/monotributo/declarar-ingresos-exterior`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/declarar-ingresos-exterior.png",
        width: 1200,
        height: 630,
        alt: "Declarar ingresos del exterior en el Monotributo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/declarar-ingresos-exterior.png"],
    title: "Cómo declarar ingresos del exterior en el Monotributo (2026)",
    description:
      "Los cobros del exterior computan para el tope del Monotributo. Cómo facturarlos y cómo impactan en la recategorización.",
  },
};

export default function DeclararIngresosExteriorPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Declarar ingresos del exterior" },
        ]}
      />

      {/* Respuesta directa para snippet / People Also Ask */}
      <p
        id="respuesta-directa"
        className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-8 -mt-1"
      >
        Si sos monotributista y cobrás de un cliente del exterior, esos ingresos{" "}
        <strong className="text-foreground">sí cuentan</strong> para el tope anual de tu categoría. Los
        declarás emitiendo{" "}
        <Link
          href="/monotributo/factura-e"
          className="text-sky-700 dark:text-sky-400 font-semibold underline underline-offset-2 hover:opacity-80"
        >
          factura E
        </Link>{" "}
        (exportación de servicios), convertís el importe a pesos a la cotización del día y ese total se suma
        al resto de tu facturación cuando te recategorizás.{" "}
        <Link
          href="/calculadora-monotributo"
          className="text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Calculá tu categoría
        </Link>{" "}
        con tus ingresos totales.
      </p>

      <ArticleHero
        image="/og/declarar-ingresos-exterior.png"
        imageAlt="Declarar ingresos del exterior en el Monotributo"
        badgeLabel="Ingresos del exterior"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="Cómo declarar ingresos del exterior en el Monotributo"
        description={
          <>
            Cobrás en dólares de una empresa de afuera y no sabés cómo declararlo. Lo más importante:{" "}
            <strong className="text-white">esos ingresos cuentan</strong> para el tope anual del Monotributo,
            igual que tu facturación local. Acá te explicamos cómo facturarlos, cómo se computan para la
            recategorización y qué hacer si te empujan por encima de tu categoría.
          </>
        }
        dateModified={dateModified}
        readingTime="7 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-amber-600 dark:text-amber-400 mb-2">
            Tope Monotributo
          </p>
          <p className="text-2xl font-bold text-foreground">Sí computa</p>
          <p className="text-sm text-muted-foreground mt-1">Por total facturado</p>
        </div>
        <div className="rounded-2xl border border-sky-200 dark:border-sky-800/40 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-sky-600 dark:text-sky-400 mb-2">
            Comprobante
          </p>
          <p className="text-2xl font-bold text-foreground">Factura E</p>
          <p className="text-sm text-muted-foreground mt-1">Exportación de servicios</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            Conversión
          </p>
          <p className="text-2xl font-bold text-foreground">A pesos</p>
          <p className="text-sm text-muted-foreground mt-1">Cotización del día</p>
        </div>
      </section>

      {/* Computan para el tope */}
      <section className="mb-12">
        <h2
          id="computan-tope"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Los ingresos del exterior cuentan para el tope del Monotributo?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Sí. Es la duda más frecuente y la respuesta corta es que{" "}
          <strong className="text-foreground">los cobros de clientes del exterior computan para el tope anual
          de tu categoría</strong>, exactamente igual que lo que facturás dentro de Argentina. No existe una
          exención del tope del Monotributo por exportar servicios.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          La confusión muy común viene de mezclar dos cosas distintas:
        </p>
        <ul className="space-y-3 mb-3">
          {[
            {
              title: "El tope impositivo del Monotributo (ARCA)",
              body: "Es el límite de ingresos brutos anuales de tu categoría. Acá sí suma todo: facturación local más exportaciones. No hay liberación por exportar.",
            },
            {
              title: "El régimen de divisas (BCRA / MULC)",
              body: "Son las reglas para ingresar y/o liquidar los dólares de la exportación. Tuvo límites y flexibilizaciones a lo largo del tiempo, pero es un tema independiente del tope del Monotributo.",
            },
          ].map((item) => (
            <li key={item.title} className="rounded-xl border border-border bg-white dark:bg-background p-4 flex gap-3">
              <span className="shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white flex items-center justify-center">
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
        <p className="text-sm text-muted-foreground">
          A junio 2026, según el criterio oficial de ARCA, el monotributista puede exportar servicios siempre
          que el total facturado (local + exterior) no supere el tope de la categoría máxima. Como las reglas
          de divisas del BCRA cambian seguido, conviene confirmar el régimen vigente con tu banco o contador
          antes de cada cobro.
        </p>
      </section>

      {/* Cómo facturar */}
      <section className="mb-12">
        <h2
          id="como-facturar"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Cómo facturar los ingresos del exterior (factura E)
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Para declarar un cobro del exterior tenés que emitir{" "}
          <strong className="text-foreground">factura E</strong>, que es el comprobante específico para
          exportación de bienes y servicios. La factura C es para clientes argentinos; si tu cliente está
          afuera, va factura E (aunque te pague en pesos).
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Se emite desde Comprobantes en Línea de ARCA, con un punto de venta habilitado para exportación,
          informando el país de destino, la moneda (usualmente USD) y la cotización del día. La factura E está
          exenta de IVA. Tenés el detalle completo del trámite en la guía dedicada:
        </p>
        <Link
          href="/monotributo/factura-e"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 transition-colors"
        >
          Ver guía: Factura E paso a paso →
        </Link>
      </section>

      {/* Ad mid-content (native, responsive) */}
      <NativeAd className="my-12" />

      {/* Cómo se computa */}
      <section className="mb-12">
        <h2
          id="como-se-computa"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Cómo se computa el ingreso del exterior para recategorizar
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El Monotributo no mira mes por mes: controla el{" "}
          <strong className="text-foreground">acumulado de los últimos 12 meses corridos</strong>. Para la
          recategorización, sumás el total de todas tus facturas (C del país + E del exterior) emitidas en ese
          período y comparás con el tope de tu categoría.
        </p>
        <div className="relative overflow-hidden rounded-2xl border border-sky-200 dark:border-sky-800/40 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 p-6 shadow-sm mb-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-400/20 to-cyan-400/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              <strong className="text-foreground">La clave es el monto en pesos.</strong> Cuando emitís la
              factura E en dólares, el sistema de ARCA calcula el equivalente en pesos según la cotización del
              día de la factura. Ese importe en pesos es el que cuenta para el tope, no los dólares originales.
            </p>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Como el tipo de cambio se mueve, dos facturas por el mismo monto en dólares pueden sumar montos
              distintos en pesos según la fecha. Por eso conviene llevar el seguimiento en pesos a lo largo del
              año y no asumir un dólar fijo.
            </p>
          </div>
        </div>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Las recategorizaciones tienen dos ventanas al año (las de enero y julio, con vencimiento a comienzos
          de febrero y agosto). En cada una, ARCA evalúa los 12 meses inmediatamente anteriores. Si querés el
          detalle del trámite, mirá la guía de{" "}
          <Link
            href="/monotributo/recategorizacion"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            recategorización paso a paso
          </Link>
          .
        </p>
      </section>

      {/* Si me paso */}
      <section className="mb-12">
        <h2
          id="si-me-paso"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Y si el ingreso del exterior me pasa del tope?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Es un escenario habitual: cobrar en dólares puede hacer que el total anual crezca rápido. Si el
          acumulado de 12 meses (local + exterior, en pesos) supera el tope de tu categoría, pasa lo mismo que
          con cualquier otro ingreso:
        </p>
        <ul className="space-y-3 mb-4">
          {[
            {
              title: "Recategorizás a una categoría superior",
              body: "Si todavía estás por debajo del tope de la categoría más alta (K), simplemente subís de categoría en la próxima ventana.",
            },
            {
              title: "Recategorización de oficio",
              body: "Si te pasaste y no te recategorizaste en término, ARCA puede recategorizarte de oficio, con diferencia de cuota y posibles intereses/multas.",
            },
            {
              title: "Exclusión del régimen",
              body: "Si superás el tope de la categoría máxima, quedás excluido del Monotributo y pasás a Responsable Inscripto.",
            },
          ].map((item) => (
            <li key={item.title} className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/70 to-orange-50/70 dark:from-amber-950/20 dark:to-orange-950/20 p-4">
              <p className="text-sm font-bold text-foreground mb-1">{item.title}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/monotributo/que-pasa-si-me-paso"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
        >
          Ver qué pasa si te pasás del tope →
        </Link>
      </section>

      {/* Paso a paso */}
      <section className="mb-12">
        <h2
          id="paso-a-paso"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Paso a paso para estar en regla
        </h2>
        <ol className="space-y-4">
          {[
            {
              title: "Habilitá la factura E",
              body: "Dá de alta un punto de venta para exportación en ARCA. Sin eso no podés emitir factura E.",
            },
            {
              title: "Facturá cada cobro del exterior",
              body: "Emití factura E por cada operación con cliente no residente, indicando moneda y cotización del día. Guardá el PDF para el cliente y para tu respaldo.",
            },
            {
              title: "Registrá el equivalente en pesos",
              body: "Anotá el monto en pesos de cada factura E (el que calcula ARCA). Es el número que cuenta para el tope, no los dólares.",
            },
            {
              title: "Sumá local + exterior cada 12 meses",
              body: "Antes de cada recategorización, sumá todas las facturas C y E de los últimos 12 meses corridos y compará con el tope de tu categoría.",
            },
            {
              title: "Recategorizate en enero o julio",
              body: "Si el total superó tu categoría, recategorizate en la ventana correspondiente (vencimiento a comienzos de febrero o agosto) para evitar la recategorización de oficio.",
            },
            {
              title: "Guardá el respaldo del cobro internacional",
              body: "Conservá comprobantes de transferencias, plataformas (Payoneer, Wise, etc.) y contratos. Sirven para probar que el cliente está realmente en el exterior.",
            },
          ].map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-white dark:bg-background p-5">
              <span className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold shadow-sm">
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

      {/* Errores comunes */}
      <section className="mb-12">
        <h2
          id="errores-comunes"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Errores comunes al declarar ingresos del exterior
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Creer que el exterior no suma",
              body: "El error más extendido. Pensar que la exportación de servicios queda afuera del tope. Sí computa para el tope del Monotributo.",
            },
            {
              title: "Confundir el tope con las divisas",
              body: "El cupo o flexibilización de dólares del BCRA es otra cosa. No te exime del tope impositivo de ARCA.",
            },
            {
              title: "Emitir factura C en vez de E",
              body: "A un cliente del exterior le corresponde factura E. Usar factura C para una exportación es un error de tipo de comprobante.",
            },
            {
              title: "Calcular en dólares y no en pesos",
              body: "El tope se mide en pesos. Si seguís solo los dólares podés cruzar el límite sin darte cuenta por el tipo de cambio.",
            },
            {
              title: "No facturar el cobro",
              body: "Cobrar por una plataforma y no emitir comprobante deja el ingreso sin declarar. ARCA cruza datos con bancos y plataformas.",
            },
            {
              title: "Olvidar la recategorización",
              body: "Aunque venga del exterior, el ingreso cuenta. No recategorizarte a tiempo habilita la recategorización de oficio.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-rose-200 dark:border-rose-800/40 bg-gradient-to-br from-rose-50/70 to-red-50/70 dark:from-rose-950/20 dark:to-red-950/20 p-5"
            >
              <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Si además te preocupa el cruce de información internacional, mirá cómo funciona el{" "}
          <Link
            href="/monotributo/crs-arca"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            intercambio de datos CRS con ARCA
          </Link>
          .
        </p>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 dark:from-sky-950/40 dark:via-cyan-950/30 dark:to-blue-950/40 border border-sky-200 dark:border-sky-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(14,165,233,0.25)] dark:shadow-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-sky-400/20 to-cyan-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            ¿Cobrás del exterior? Mirá si llegás al tope
          </h2>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
            Sumá tu facturación local más la del exterior (en pesos) y usá la calculadora gratuita para ver en
            qué categoría caés y cuánto margen te queda antes de recategorizar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculadora-monotributo"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all"
            >
              Calcular mi categoría
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/ingresar"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-sky-200 dark:border-sky-800/60 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-sky-700 dark:text-sky-200 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-105"
            >
              Ingresar a GARCA
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground mb-12 max-w-3xl">
        Esta guía es información general actualizada a junio 2026, no asesoramiento contable ni impositivo.
        Las normas de ARCA y del BCRA cambian con frecuencia. Antes de tomar decisiones, consultá con un
        contador o contadora matriculada.
      </p>

      <RelatedGuides currentHref="/monotributo/declarar-ingresos-exterior" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={declararExteriorFaqEntries} />
      </section>
    </div>
  );
}
