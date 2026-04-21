import type { Metadata } from "next";
import Link from "next/link";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { facturaCFaqEntries, getGuideDateModified } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "que-es-factura-c", label: "¿Qué es la factura C?" },
  { id: "cuando-emitir-factura-c", label: "¿Cuándo emitir factura C?" },
  { id: "datos-obligatorios", label: "Datos obligatorios de la factura C" },
  { id: "como-emitir-paso-a-paso", label: "Cómo emitirla paso a paso en ARCA" },
  { id: "impacto-categoria", label: "Cómo impacta en tu categoría" },
];

export const metadata: Metadata = {
  title: "Factura C 2026 — Qué es, quién la emite y cómo hacerla en ARCA",
  description:
    "Guía completa de la factura C para monotributistas y responsables exentos: quién la emite, qué datos lleva, cómo emitirla en ARCA paso a paso y diferencias con A y B.",
  keywords: [
    "factura c",
    "factura c monotributo",
    "factura c arca",
    "cómo emitir factura c",
    "factura c vs factura a",
    "factura electrónica monotributo",
    "comprobantes en línea arca",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/factura-c` },
  openGraph: {
    title: "Factura C — Qué es, quién la emite y cómo hacerla (2026)",
    description:
      "Todo sobre la factura C del Monotributo: datos obligatorios, paso a paso en Comprobantes en Línea y diferencias con A y B.",
    type: "article",
    url: `${siteUrl}/monotributo/factura-c`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/factura-c.png",
        width: 1200,
        height: 630,
        alt: "Factura C del Monotributo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/factura-c.png"],
    title: "Factura C — Qué es, quién la emite y cómo hacerla",
    description: "Guía de factura C para monotributistas: datos obligatorios, paso a paso y diferencias.",
  },
};

export default function FacturaCPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Factura C" },
        ]}
      />

      <ArticleHero
        image="/og/factura-c.png"
        imageAlt="Factura C del Monotributo"
        badgeLabel="Facturación"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title="Factura C: qué es y cómo emitirla en 2026"
        description={
          <>
            La <strong className="text-white">factura C</strong> es el comprobante que emiten los{" "}
            <strong className="text-white">monotributistas</strong> y los{" "}
            <strong className="text-white">responsables exentos o no alcanzados por IVA</strong> para respaldar sus
            ventas en el mercado local. No discrimina IVA y se emite directamente desde ARCA con CAE electrónico.
          </>
        }
        dateModified={dateModified}
        readingTime="5 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-purple-600 dark:text-purple-400 mb-2">
            Emite
          </p>
          <p className="text-2xl font-bold text-foreground">Monotributo</p>
          <p className="text-sm text-muted-foreground mt-1">+ Exentos en IVA</p>
        </div>
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Mercado
          </p>
          <p className="text-2xl font-bold text-foreground">Local</p>
          <p className="text-sm text-muted-foreground mt-1">Argentina</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            IVA
          </p>
          <p className="text-2xl font-bold text-foreground">No discrimina</p>
          <p className="text-sm text-muted-foreground mt-1">Total bruto</p>
        </div>
      </section>

      {/* Qué es */}
      <section className="mb-12">
        <h2
          id="que-es-factura-c"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Qué es la factura C?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          La factura C es uno de los tipos de comprobantes previstos por ARCA dentro del régimen de facturación
          electrónica. La emiten los contribuyentes que{" "}
          <strong className="text-foreground">no son responsables inscriptos en IVA</strong>, es decir:
        </p>
        <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 list-disc pl-6 mb-3">
          <li>
            <strong className="text-foreground">Monotributistas</strong> en cualquiera de las 11 categorías (A a K).
          </li>
          <li>
            <strong className="text-foreground">Responsables exentos</strong> del IVA (por ejemplo, asociaciones
            civiles, fundaciones, servicios educativos o prestaciones médicas alcanzadas por exenciones
            específicas del art. 7 de la Ley de IVA).
          </li>
          <li>
            <strong className="text-foreground">Sujetos no alcanzados</strong> por IVA.
          </li>
        </ul>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          A diferencia de las facturas A, B o M, <strong className="text-foreground">la factura C no discrimina
          IVA</strong>: muestra un único importe total, porque quien la emite no cobra IVA al cliente ni puede
          computar crédito fiscal por sus compras.
        </p>
      </section>

      {/* Cuándo */}
      <section className="mb-12">
        <h2
          id="cuando-emitir-factura-c"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Cuándo emitir factura C?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Como monotributista, tenés que emitir factura C por{" "}
          <strong className="text-foreground">todas las ventas o servicios</strong> que prestás en el mercado
          local, independientemente del tipo de cliente (consumidor final, responsable inscripto, otro
          monotributista, exento, etc.). Si el cliente es del exterior (exportación de servicios o bienes),
          corresponde{" "}
          <Link
            href="/monotributo/factura-e"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            factura E
          </Link>
          , no C.
        </p>
        <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Quién vende</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">A quién</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Monotributista</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Cualquier tipo (consumidor, RI, exento...)</td>
                <td className="px-4 py-3 font-semibold text-purple-700 dark:text-purple-300">Factura C</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Monotributista</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Cliente del exterior</td>
                <td className="px-4 py-3 font-semibold text-cyan-700 dark:text-cyan-300">Factura E</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Responsable Inscripto</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Consumidor / exento / monotributista</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Factura B</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Responsable Inscripto</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Otro Responsable Inscripto</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Factura A</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Datos obligatorios */}
      <section className="mb-12">
        <h2
          id="datos-obligatorios"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Datos obligatorios de la factura C
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Cuando emitís una factura C en Comprobantes en Línea de ARCA, el sistema completa muchos campos
          automáticamente. Lo que sí tenés que cargar vos:
        </p>
        <ul className="space-y-3 text-base text-slate-700 dark:text-slate-300">
          {[
            {
              title: "Datos del emisor",
              body: "Tu CUIT, razón social, domicilio fiscal y condición frente al IVA (Monotributo). ARCA los carga solos desde tu perfil.",
            },
            {
              title: "Fecha de emisión",
              body: "Por regla general: para venta de bienes, el día de entrega; para prestación de servicios, el día de finalización o el de cobro (lo que ocurra antes); para servicios continuos, el último día del mes. Al pedir el CAE en Comprobantes en Línea, ARCA admite una ventana de hasta 5 días corridos (antes o después) entre la fecha del comprobante y la solicitud.",
            },
            {
              title: "Datos del cliente",
              body: "CUIT / CUIL / DNI, nombre o razón social, y la condición frente al IVA. Para consumidores finales con consumos bajos alcanza con DNI.",
            },
            {
              title: "Descripción del producto o servicio",
              body: "Detalle claro de lo que estás facturando, con cantidad, precio unitario y total.",
            },
            {
              title: "Importe total",
              body: "No discrimina IVA. Es un único importe final al que puede sumarse percepciones de IIBB si corresponden.",
            },
            {
              title: "CAE y fecha de vencimiento",
              body: "Código de Autorización Electrónica que genera ARCA automáticamente cuando confirmás el comprobante.",
            },
          ].map((item) => (
            <li key={item.title} className="rounded-2xl border border-border bg-white dark:bg-background p-4">
              <p className="font-bold text-foreground mb-1">{item.title}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Paso a paso */}
      <section className="mb-12">
        <h2
          id="como-emitir-paso-a-paso"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Cómo emitir factura C paso a paso en ARCA
        </h2>
        <ol className="space-y-4">
          {[
            {
              title: "Ingresá al portal de ARCA",
              body: "Entrá a arca.gob.ar, autenticate con CUIT y clave fiscal (nivel 3 o superior) y abrí el servicio 'Comprobantes en Línea'. Si no lo tenés habilitado, lo agregás desde Administrador de Relaciones.",
            },
            {
              title: "Seleccioná 'Generar Comprobantes'",
              body: "Dentro del servicio, elegí el punto de venta con el que vas a emitir. Si es la primera vez, tenés que dar de alta un punto de venta electrónico.",
            },
            {
              title: "Elegí tipo de comprobante: Factura C",
              body: "En el selector de tipo, marcá 'Factura C'. ARCA sólo te va a permitir los tipos de comprobantes que corresponden a tu condición frente al IVA.",
            },
            {
              title: "Cargá los datos del receptor",
              body: "Ingresá CUIT o DNI del cliente. El sistema autocompleta nombre y condición frente al IVA desde el padrón de ARCA.",
            },
            {
              title: "Detallá conceptos y montos",
              body: "Describí qué vendés o qué servicio prestás, con cantidades y precios. El total se calcula solo.",
            },
            {
              title: "Confirmá y descargá el CAE",
              body: "ARCA emite el CAE en el momento. Descargá la factura en PDF o pasala al cliente con el número y la fecha de vencimiento del CAE.",
            },
          ].map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-white dark:bg-background p-5">
              <span className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 text-white font-bold shadow-sm">
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

      {/* Impacto en el tope */}
      <section className="mb-12">
        <h2
          id="impacto-categoria"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Cómo impacta la factura C en tu categoría de Monotributo
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El <strong className="text-foreground">importe total de cada factura C</strong> que emitís suma
          directamente a tus ingresos brutos de los últimos 12 meses. Es el dato que ARCA usa para evaluar en
          qué categoría quedás en la próxima recategorización.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Como la factura C{" "}
          <strong className="text-foreground">no discrimina IVA</strong>, el total del comprobante es el que
          cuenta. No hay que restar ningún porcentaje antes de compararlo con el tope anual de tu categoría.
        </p>
      </section>

      <RelatedGuides currentHref="/monotributo/factura-c" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={facturaCFaqEntries} />
      </section>
    </div>
  );
}
