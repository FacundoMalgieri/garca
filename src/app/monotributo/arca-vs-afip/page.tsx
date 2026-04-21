import type { Metadata } from "next";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { arcaVsAfipFaqEntries, getGuideDateModified } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "que-es-arca", label: "¿Qué es ARCA?" },
  { id: "que-cambio-y-que-sigue-igual", label: "Qué cambió y qué sigue igual" },
  { id: "en-la-practica", label: "En la práctica, ¿qué tenés que hacer?" },
  { id: "impacto-garca", label: "¿Cómo impacta esto en GARCA?" },
];

export const metadata: Metadata = {
  title: "ARCA vs AFIP — Qué cambió para el monotributista (2026)",
  description:
    "Cómo AFIP pasó a llamarse ARCA (Agencia de Recaudación y Control Aduanero), qué cambió en la práctica para el monotributista y qué sigue exactamente igual.",
  keywords: [
    "arca vs afip",
    "arca ex afip",
    "qué es arca",
    "agencia de recaudación y control aduanero",
    "arca monotributo",
    "afip cambio de nombre",
    "decreto 953/2024",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/arca-vs-afip` },
  openGraph: {
    title: "ARCA vs AFIP — Qué cambió para el monotributista",
    description:
      "AFIP pasó a llamarse ARCA a fines de 2024. Qué cambió en la práctica y qué sigue igual para el monotributista.",
    type: "article",
    url: `${siteUrl}/monotributo/arca-vs-afip`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/arca-vs-afip.png",
        width: 1200,
        height: 630,
        alt: "Transición de AFIP a ARCA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/arca-vs-afip.png"],
    title: "ARCA vs AFIP — Qué cambió para el monotributista",
    description: "De AFIP a ARCA: qué cambió y qué sigue igual en el día a día del monotributista.",
  },
};

export default function ArcaVsAfipPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "ARCA vs AFIP" },
        ]}
      />

      <ArticleHero
        image="/og/arca-vs-afip.png"
        imageAlt="Transición de AFIP a ARCA para el monotributista"
        badgeLabel="Cambio normativo"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
        title="ARCA vs AFIP: qué cambió para el monotributista"
        description={
          <>
            A fines de 2024, AFIP pasó a llamarse <strong className="text-white">ARCA</strong> (Agencia de
            Recaudación y Control Aduanero) por el <strong className="text-white">Decreto 953/2024</strong>.
            Cambiaron el nombre, el dominio web y el logo, pero las obligaciones y plazos siguieron exactamente
            iguales.
          </>
        }
        dateModified={dateModified}
        readingTime="4 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* TL;DR */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">La versión corta</h2>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-foreground">ARCA es el mismo organismo que era AFIP</strong>, con nuevo
                nombre y absorbiendo también la ex Dirección General de Aduanas. Tus obligaciones como
                monotributista no cambiaron: mismas categorías, mismas cuotas, misma recategorización semestral,
                misma factura C. Lo único que cambia es el dominio del portal (
                <strong className="text-foreground">arca.gob.ar</strong>) y la marca.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Qué es ARCA? */}
      <section className="mb-12">
        <h2
          id="que-es-arca"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Qué es ARCA?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          <strong className="text-foreground">ARCA</strong> es la{" "}
          <strong className="text-foreground">Agencia de Recaudación y Control Aduanero</strong>, creada por el
          Decreto 953/2024 (sancionado el 24 de octubre de 2024 y publicado en el Boletín Oficial el 25 de octubre
          de 2024). Reemplaza a la AFIP (Administración Federal de Ingresos Públicos) y mantiene dos direcciones
          generales:
        </p>
        <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 list-disc pl-6 mb-3">
          <li>
            La <strong className="text-foreground">Dirección General Impositiva (DGI)</strong>, a cargo de los
            impuestos internos, que además <strong className="text-foreground">absorbió las funciones de la ex
            Dirección General de los Recursos de la Seguridad Social (DGRSS)</strong> — aportes jubilatorios y
            contribuciones patronales.
          </li>
          <li>La <strong className="text-foreground">Dirección General de Aduanas (DGA)</strong>, a cargo del comercio exterior.</li>
        </ul>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          En la práctica, <strong className="text-foreground">es el mismo organismo con otro nombre</strong>, una
          estructura interna más compacta y un enfoque declarado en simplificación y digitalización.
        </p>
      </section>

      {/* Qué cambió y qué no */}
      <section className="mb-12">
        <h2
          id="que-cambio-y-que-sigue-igual"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Qué cambió y qué sigue igual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h3 className="font-bold text-base">Qué cambió</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <strong className="text-foreground">Nombre del organismo:</strong> de AFIP a ARCA.
              </li>
              <li>
                <strong className="text-foreground">Dominio web:</strong> de afip.gob.ar a{" "}
                <strong className="text-foreground">arca.gob.ar</strong>. Los links viejos redirigen.
              </li>
              <li>
                <strong className="text-foreground">Logo e identidad visual:</strong> nuevo isotipo y paleta.
              </li>
              <li>
                <strong className="text-foreground">Estructura interna:</strong> se consolidó con Aduanas.
              </li>
              <li>
                <strong className="text-foreground">Reducción de personal:</strong> anunciada al momento de la
                creación de ARCA.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-base">Qué sigue exactamente igual</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <strong className="text-foreground">Categorías del Monotributo:</strong> 11 categorías (A a K).
              </li>
              <li>
                <strong className="text-foreground">Topes y cuotas:</strong> se siguen actualizando enero y julio.
              </li>
              <li>
                <strong className="text-foreground">Recategorización semestral:</strong> misma mecánica,
                mismas fechas.
              </li>
              <li>
                <strong className="text-foreground">Factura C y factura E:</strong> mismos comprobantes, mismo CAE.
              </li>
              <li>
                <strong className="text-foreground">CUIT y clave fiscal:</strong> las mismas de siempre, no hay
                que volver a tramitarlas.
              </li>
              <li>
                <strong className="text-foreground">Servicios del portal:</strong> Monotributo, Comprobantes en
                línea, Mis Aplicaciones Web, etc.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* En la práctica */}
      <section className="mb-12">
        <h2
          id="en-la-practica"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          En la práctica, ¿qué tenés que hacer?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Si ya eras monotributista antes del cambio, <strong className="text-foreground">no tenés que hacer
          ningún trámite especial</strong>. Los datos, la categoría, la clave fiscal, las autorizaciones para
          emitir comprobantes y los talonarios electrónicos existentes migraron automáticamente a ARCA.
        </p>
        <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Antes (AFIP)</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Ahora (ARCA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">afip.gob.ar</td>
                <td className="px-4 py-3 font-semibold text-foreground">arca.gob.ar</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Clave fiscal AFIP</td>
                <td className="px-4 py-3 font-semibold text-foreground">Misma clave fiscal</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Comprobantes en línea</td>
                <td className="px-4 py-3 font-semibold text-foreground">Comprobantes en línea</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Portal Monotributo</td>
                <td className="px-4 py-3 font-semibold text-foreground">Portal Monotributo</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Factura C / Factura E</td>
                <td className="px-4 py-3 font-semibold text-foreground">Factura C / Factura E</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Impacto en GARCA */}
      <section className="mb-12">
        <h2
          id="impacto-garca"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Cómo impacta esto en GARCA?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          GARCA se conecta al portal oficial usando tu CUIT y clave fiscal como lo harías vos manualmente. Como
          el login sigue usando las mismas credenciales, la transición de AFIP a ARCA{" "}
          <strong className="text-foreground">no afectó el funcionamiento</strong>: GARCA usa el dominio nuevo
          (arca.gob.ar) y los datos se descargan igual.
        </p>
      </section>

      <RelatedGuides currentHref="/monotributo/arca-vs-afip" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={arcaVsAfipFaqEntries} />
      </section>
    </div>
  );
}
