import type { Metadata } from "next";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { facturaCvsEFaqEntries, getGuideDateModified } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "comparativa-detallada", label: "Comparativa detallada" },
  { id: "casos-practicos", label: "Casos prácticos" },
  { id: "impacto-tope", label: "Cómo impactan en el tope del Monotributo" },
];

export const metadata: Metadata = {
  title: "Factura C vs Factura E — Cuándo usar cada una (Monotributo 2026)",
  description:
    "Comparativa clara entre factura C y factura E: cuándo corresponde cada una, diferencias en IVA, impacto en el tope del Monotributo y ejemplos concretos.",
  keywords: [
    "factura c vs factura e",
    "diferencia factura c y e",
    "factura e o c monotributo",
    "cuando facturar e o c",
    "exportacion monotributo factura",
    "factura extranjero monotributo",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/factura-c-vs-factura-e` },
  openGraph: {
    title: "Factura C vs Factura E — Cuándo usar cada una",
    description:
      "Comparativa rápida entre factura C (mercado local) y factura E (exportación) para monotributistas.",
    type: "article",
    url: `${siteUrl}/monotributo/factura-c-vs-factura-e`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/factura-c-vs-factura-e.png",
        width: 1200,
        height: 630,
        alt: "Comparativa factura C vs factura E",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/factura-c-vs-factura-e.png"],
    title: "Factura C vs Factura E — Cuándo usar cada una",
    description: "Cuál emitir según el cliente: mercado local (C) o exterior (E).",
  },
};

export default function FacturaCvsEPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Factura C vs Factura E" },
        ]}
      />

      <ArticleHero
        image="/og/factura-c-vs-factura-e.png"
        imageAlt="Factura C vs Factura E — comparativa"
        badgeLabel="Comparativa"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        }
        title="Factura C vs Factura E"
        description={
          <>
            Las dos son comprobantes electrónicos que emitís con CAE desde el portal de ARCA, y las dos aplican a
            monotributistas. La diferencia fundamental es el{" "}
            <strong className="text-white">destinatario de la operación</strong>:{" "}
            <strong className="text-white">factura C</strong> para clientes en Argentina,{" "}
            <strong className="text-white">factura E</strong> para clientes del exterior.
          </>
        }
        dateModified={dateModified}
        readingTime="4 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* TL;DR */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 p-5">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
              <span className="text-xs uppercase tracking-wide font-semibold">Factura C</span>
            </div>
            <p className="text-xl font-bold text-foreground mb-2">Mercado local</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Vendés a <strong className="text-foreground">cualquier cliente en Argentina</strong>: consumidor
              final, responsable inscripto, exento, otro monotributista. No discrimina IVA.
            </p>
          </div>
          <div className="rounded-2xl border border-sky-200 dark:border-sky-800/40 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 p-5">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 mb-2">
              <span className="text-xs uppercase tracking-wide font-semibold">Factura E</span>
            </div>
            <p className="text-xl font-bold text-foreground mb-2">Exportación</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Vendés a un <strong className="text-foreground">cliente fuera de Argentina</strong>: servicios o
              bienes exportados. Operación exenta de IVA por tratarse de exportación.
            </p>
          </div>
        </div>
      </section>

      {/* Tabla comparativa */}
      <section className="mb-12">
        <h2
          id="comparativa-detallada"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Comparativa detallada
        </h2>
        <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Aspecto</th>
                <th className="text-left px-4 py-3 font-semibold text-purple-700 dark:text-purple-300">Factura C</th>
                <th className="text-left px-4 py-3 font-semibold text-sky-700 dark:text-sky-300">Factura E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Emisor</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Monotributista o exento de IVA</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Cualquier contribuyente (incl. monotributistas)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Destinatario</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Cliente residente en Argentina</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Cliente del exterior (no residente)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">IVA</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">No se discrimina</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Exento por exportación</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Moneda</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Pesos argentinos</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Moneda extranjera (USD, EUR, etc.) con cotización</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Punto de venta</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Puede compartirse con otros comprobantes locales</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Punto de venta específico para exportación</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">CAE</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Sí, obligatorio</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Sí, obligatorio</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Impacta tope Monotributo</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Sí, por el total bruto</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Sí, por el total convertido a pesos</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Datos extra del receptor</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">CUIT / DNI</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">País, Tax ID extranjero (cuando corresponda)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Casos prácticos */}
      <section className="mb-12">
        <h2
          id="casos-practicos"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Casos prácticos
        </h2>
        <div className="space-y-4">
          {[
            {
              title: "Freelance para empresa de EE.UU.",
              body: "Si programás para una empresa con domicilio fiscal en EE.UU. y te pagan en dólares a una cuenta en el exterior o vía plataforma, corresponde factura E.",
              answer: "Factura E",
              answerColor: "text-sky-700 dark:text-sky-300",
            },
            {
              title: "Consultoría para una PyME argentina",
              body: "Le vendés un servicio a una empresa responsable inscripta con domicilio en Argentina. Aunque te pague en dólares MEP o transferencia, el cliente es local.",
              answer: "Factura C",
              answerColor: "text-purple-700 dark:text-purple-300",
            },
            {
              title: "Cliente argentino residiendo en el exterior",
              body: "Le hacés un servicio a una persona que tiene CUIL/CUIT argentino pero vive afuera. Si el servicio se presta y consume desde Argentina hacia un cliente con domicilio real en el exterior, por lo general es factura E, pero conviene validarlo con el contador según el caso.",
              answer: "Usualmente E",
              answerColor: "text-amber-700 dark:text-amber-300",
            },
            {
              title: "Contenido en YouTube, Twitch o Spotify",
              body: "Los pagos vienen de plataformas globales (Google, Twitch, Spotify) con domicilio fuera de Argentina. Al ser un servicio prestado a empresas extranjeras, corresponde factura E.",
              answer: "Factura E",
              answerColor: "text-sky-700 dark:text-sky-300",
            },
            {
              title: "Venta minorista en un local físico",
              body: "Vendés productos a consumidores finales en un local o por redes sociales dentro del país. Todas las ventas se respaldan con factura C.",
              answer: "Factura C",
              answerColor: "text-purple-700 dark:text-purple-300",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-white dark:bg-background p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
              </div>
              <div className={`shrink-0 text-sm font-bold ${item.answerColor} whitespace-nowrap`}>
                → {item.answer}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impacto Monotributo */}
      <section className="mb-12">
        <h2
          id="impacto-tope"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Cómo impactan en el tope del Monotributo
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          En ambas facturas, el <strong className="text-foreground">total facturado en pesos</strong> suma al
          acumulado de los últimos 12 meses que ARCA usa en la recategorización. No hay distinción entre
          facturación local y exportación para el tope del Monotributo.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          La factura E se convierte a pesos con la cotización del día en que se emite. Si después el dólar sube o
          baja, <strong className="text-foreground">lo que queda registrado es el monto en pesos del día de la
          emisión</strong>.
        </p>
      </section>

      <RelatedGuides currentHref="/monotributo/factura-c-vs-factura-e" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={facturaCvsEFaqEntries} />
      </section>
    </div>
  );
}
