import type { Metadata } from "next";
import Link from "next/link";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { facturaEFaqEntries, getGuideDateModified } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "que-es-factura-e", label: "¿Qué es la factura E?" },
  { id: "cuando-corresponde-factura-e", label: "¿Cuándo corresponde factura E?" },
  { id: "como-emitir-factura-e", label: "Cómo emitirla paso a paso" },
  { id: "impacto-categoria", label: "Impacto en tu categoría de Monotributo" },
];

export const metadata: Metadata = {
  title: "Factura E 2026 — Exportación de servicios para monotributistas",
  description:
    "Cómo emitir factura E como monotributista en 2026: requisitos, paso a paso en ARCA, impacto en el tope anual y uso para exportación de servicios a clientes del exterior.",
  keywords: [
    "factura e",
    "factura e monotributo",
    "factura e exportacion",
    "exportacion de servicios monotributo",
    "factura e arca",
    "facturar al exterior monotributo",
    "monotributo dolares",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/factura-e` },
  openGraph: {
    title: "Factura E — Exportación de servicios para monotributistas",
    description:
      "Cómo emitir factura E en ARCA: requisitos, paso a paso y qué cuenta dentro del tope de Monotributo.",
    type: "article",
    url: `${siteUrl}/monotributo/factura-e`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/factura-e.png",
        width: 1200,
        height: 630,
        alt: "Factura E — exportación de servicios desde Argentina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/factura-e.png"],
    title: "Factura E — Exportación de servicios para monotributistas",
    description:
      "Emitir factura E como monotributista: requisitos, paso a paso y cómo impacta en el tope anual.",
  },
};

export default function FacturaEPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Factura E" },
        ]}
      />

      <ArticleHero
        image="/og/factura-e.png"
        imageAlt="Factura E — exportación de servicios desde Monotributo"
        badgeLabel="Exportación"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="Factura E: exportación de servicios desde Monotributo"
        description={
          <>
            La <strong className="text-white">factura E</strong> es el comprobante que emitís cuando vendés
            servicios o bienes a un cliente del exterior. Los monotributistas pueden emitirla con CAE electrónico y
            los ingresos <strong className="text-white">sí cuentan</strong> para el tope anual de la categoría.
          </>
        }
        dateModified={dateModified}
        readingTime="6 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl border border-sky-200 dark:border-sky-800/40 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-sky-600 dark:text-sky-400 mb-2">
            Destinatario
          </p>
          <p className="text-2xl font-bold text-foreground">Exterior</p>
          <p className="text-sm text-muted-foreground mt-1">Cliente no residente</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            IVA
          </p>
          <p className="text-2xl font-bold text-foreground">Exento</p>
          <p className="text-sm text-muted-foreground mt-1">Exportación</p>
        </div>
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-amber-600 dark:text-amber-400 mb-2">
            Tope Monotributo
          </p>
          <p className="text-2xl font-bold text-foreground">Sí computa</p>
          <p className="text-sm text-muted-foreground mt-1">Por total facturado</p>
        </div>
      </section>

      {/* Qué es */}
      <section className="mb-12">
        <h2
          id="que-es-factura-e"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Qué es la factura E?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          La <strong className="text-foreground">factura E</strong> es un tipo de comprobante electrónico
          específico para respaldar <strong className="text-foreground">operaciones de exportación</strong>:
          ventas de bienes que salen del país o servicios prestados a clientes no residentes en Argentina
          (personas o empresas del exterior).
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Para el monotributista argentino, la factura E es clave cuando{" "}
          <strong className="text-foreground">presta servicios profesionales a empresas del exterior</strong>:
          programación para una empresa de EE.UU., diseño para un cliente en España, traducciones para una
          plataforma internacional, etc. Los cobros suelen venir en dólares u otra moneda extranjera y se
          liquidan a través del Mercado Único y Libre de Cambios (MULC) o regímenes específicos para servicios
          (según la normativa vigente del BCRA).
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          En materia tributaria, la exportación está{" "}
          <strong className="text-foreground">exenta de IVA</strong>. Como el monotributista tampoco paga IVA por
          su actividad local, el efecto práctico es el mismo: la factura E no discrimina IVA.
        </p>
      </section>

      {/* Cuándo */}
      <section className="mb-12">
        <h2
          id="cuando-corresponde-factura-e"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Cuándo corresponde factura E?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Hay factura E siempre que el destinatario de la operación esté afuera del país. Algunos ejemplos típicos
          para monotributistas:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Desarrollo de software remoto",
              body: "Trabajás como freelancer para una empresa de EE.UU., Canadá, Europa o Asia, y cobrás en dólares o euros.",
            },
            {
              title: "Diseño, edición o traducción",
              body: "Prestás servicios creativos a clientes no residentes, con entregas digitales por internet.",
            },
            {
              title: "Consultoría internacional",
              body: "Asesorás a empresas del exterior en cualquier disciplina (marketing, finanzas, ingeniería, etc.).",
            },
            {
              title: "Contenido para plataformas",
              body: "Recibís pagos desde plataformas globales (YouTube, Twitch, Patreon, Spotify, etc.) por contenido consumido o monetizado afuera.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-sky-200 dark:border-sky-800/40 bg-gradient-to-br from-sky-50/70 to-cyan-50/70 dark:from-sky-950/20 dark:to-cyan-950/20 p-5"
            >
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Si vendés a un cliente argentino, aunque te pague en dólares, corresponde{" "}
          <Link
            href="/monotributo/factura-c"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            factura C
          </Link>
          , no E.
        </p>
      </section>

      {/* Paso a paso */}
      <section className="mb-12">
        <h2
          id="como-emitir-factura-e"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Cómo emitir factura E paso a paso
        </h2>
        <ol className="space-y-4">
          {[
            {
              title: "Verificá que tengas habilitado el servicio",
              body: "En 'Comprobantes en Línea' de ARCA, tenés que tener dado de alta un punto de venta con factura E. Si no lo tenés, lo creás desde 'Administración de puntos de venta y domicilios'.",
            },
            {
              title: "Ingresá a Comprobantes en Línea",
              body: "Autenticate con CUIT y clave fiscal, abrí el servicio y elegí 'Generar Comprobantes'. Seleccioná el punto de venta habilitado para exportación.",
            },
            {
              title: "Elegí tipo de comprobante: Factura E",
              body: "En el listado de tipos, marcá 'Factura E'. ARCA te va a pedir datos específicos de exportación que no aparecen en la factura C.",
            },
            {
              title: "Cargá los datos del cliente del exterior",
              body: "Como el cliente no tiene CUIT argentino, indicás el país de destino y, cuando corresponda, el ID tributario del exterior (Tax ID, VAT, CPF, etc.). También se informa la moneda y cotización.",
            },
            {
              title: "Indicá el destino y la operación",
              body: "Seleccioná si se trata de exportación de bienes o exportación de servicios (y el subtipo correspondiente). En servicios, el lugar efectivo de prestación determina si es realmente exportación.",
            },
            {
              title: "Detallá conceptos e importe en moneda extranjera",
              body: "Cargá la descripción del servicio prestado, la moneda (usualmente USD) y el importe. El sistema calcula el equivalente en pesos usando la cotización indicada.",
            },
            {
              title: "Confirmá y obtené el CAE",
              body: "ARCA emite el CAE igual que en la factura C. Descargá el PDF para enviarle al cliente del exterior como respaldo contable de la operación.",
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

      {/* Impacto tope */}
      <section className="mb-12">
        <h2
          id="impacto-categoria"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Impacto en tu categoría de Monotributo
        </h2>
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              Es un error común pensar que <strong className="text-foreground">los ingresos de exportación no
              cuentan</strong> para el tope del Monotributo. Sí cuentan: la factura E suma al mismo tope anual
              que la factura C.
            </p>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Lo que no hay que hacer es sumar IVA (porque la exportación está exenta). Pero el{" "}
              <strong className="text-foreground">total facturado en pesos</strong> (según la cotización del día
              de la factura) es el número que se compara con el tope de tu categoría a la hora de recategorizarte.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Si tenés volumen alto de exportación y se te complica mantenerte en Monotributo, mirá también{" "}
          <Link
            href="/monotributo/vs-responsable-inscripto"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            Monotributo vs Responsable Inscripto
          </Link>
          .
        </p>
      </section>

      <RelatedGuides currentHref="/monotributo/factura-e" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={facturaEFaqEntries} />
      </section>
    </div>
  );
}
