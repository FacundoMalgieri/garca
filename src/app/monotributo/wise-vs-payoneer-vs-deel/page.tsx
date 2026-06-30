import type { Metadata } from "next";
import Link from "next/link";

import { NativeAd } from "@/components/ads/NativeAd";
import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { getGuideDateModified, wisePayoneerDeelFaqEntries } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "comparativa-rapida", label: "Comparativa rápida" },
  { id: "wise", label: "Wise en detalle" },
  { id: "payoneer", label: "Payoneer en detalle" },
  { id: "deel", label: "Deel en detalle" },
  { id: "compliance-crs", label: "Compliance: CRS y ARCA" },
  { id: "cual-te-conviene", label: "Cuál te conviene según tu caso" },
];

export const metadata: Metadata = {
  title: "Wise vs Payoneer vs Deel para cobrar del exterior (Monotributo 2026)",
  description:
    "Comparativa honesta de Wise, Payoneer y Deel para cobrar del exterior siendo monotributista en 2026: comisiones, retiro a pesos, cuenta en USD y qué implica cada una bajo CRS para ARCA. Datos a junio 2026.",
  keywords: [
    "wise vs payoneer vs deel",
    "mejor forma de cobrar del exterior argentina 2026",
    "payoneer o wise monotributo",
    "cobrar dolares freelancer argentina",
    "wise payoneer deel comparativa",
    "cobrar del exterior monotributo",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/wise-vs-payoneer-vs-deel` },
  openGraph: {
    title: "Wise vs Payoneer vs Deel — cobrar del exterior (Monotributo 2026)",
    description:
      "Comisiones, retiro a pesos, cuenta en USD y el ángulo CRS/ARCA de cada plataforma para monotributistas. Datos a junio 2026.",
    type: "article",
    url: `${siteUrl}/monotributo/wise-vs-payoneer-vs-deel`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/wise-vs-payoneer-vs-deel.png",
        width: 1200,
        height: 630,
        alt: "Wise vs Payoneer vs Deel para monotributistas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/wise-vs-payoneer-vs-deel.png"],
    title: "Wise vs Payoneer vs Deel — cobrar del exterior (Monotributo 2026)",
    description:
      "Comisiones, retiro a pesos, cuenta en USD y el ángulo CRS/ARCA de cada plataforma. Datos a junio 2026.",
  },
};

export default function WiseVsPayoneerVsDeelPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Wise vs Payoneer vs Deel" },
        ]}
      />

      {/* Respuesta directa para snippet / People Also Ask */}
      <p
        id="respuesta-directa"
        className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-8 -mt-1"
      >
        Para cobrar del exterior siendo monotributista, las tres opciones más usadas en Argentina son{" "}
        <strong className="text-foreground">Wise</strong>, <strong className="text-foreground">Payoneer</strong> y{" "}
        <strong className="text-foreground">Deel</strong>. En grandes números (a junio 2026):{" "}
        <strong className="text-foreground">Wise</strong> es la más barata para recibir y convertir, pero{" "}
        <strong className="text-foreground">no tiene tarjeta en Argentina</strong> y limita el retiro a pesos;{" "}
        <strong className="text-foreground">Payoneer</strong> es la más arraigada para marketplaces y permite cuenta y
        tarjeta, con comisiones intermedias; <strong className="text-foreground">Deel</strong> conviene cuando una{" "}
        <strong className="text-foreground">empresa del exterior te paga como contractor</strong> y querés todo en
        un solo lugar. En los tres casos, si el cliente está afuera, emitís{" "}
        <Link
          href="/monotributo/factura-e"
          className="text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80"
        >
          factura E
        </Link>
        .
      </p>

      <ArticleHero
        image="/og/wise-vs-payoneer-vs-deel.png"
        imageAlt="Wise vs Payoneer vs Deel para cobrar del exterior"
        badgeLabel="Comparativa"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        }
        title="Wise vs Payoneer vs Deel"
        description={
          <>
            Las tres te dejan <strong className="text-white">cobrar en dólares</strong> de clientes del exterior, pero
            funcionan distinto: cambian las comisiones, el retiro a pesos y hasta qué le reportan a{" "}
            <strong className="text-white">ARCA</strong>. Comparativa honesta, con datos{" "}
            <strong className="text-white">a junio 2026</strong> (las tarifas cambian: confirmá siempre en el sitio
            oficial).
          </>
        }
        dateModified={dateModified}
        readingTime="11 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* Aviso de frescura */}
      <div className="mb-10 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
        <strong className="font-semibold">Datos a junio 2026.</strong> Las comisiones, los límites y la
        disponibilidad de cada plataforma cambian seguido. Antes de decidir, verificá los números en el sitio oficial
        de cada una. Esta guía es informativa y no constituye asesoramiento financiero ni impositivo.
      </div>

      {/* TL;DR cards */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5">
            <span className="text-xs uppercase tracking-wide font-semibold text-emerald-700 dark:text-emerald-300">
              Wise
            </span>
            <p className="text-lg font-bold text-foreground mt-1 mb-2">La más barata</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Recibís USD gratis (ACH) y convertís al tipo medio de mercado con comisión baja. Su talón de Aquiles en
              Argentina: <strong className="text-foreground">sin tarjeta</strong> y el cash-out a pesos es engorroso.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200 dark:border-orange-800/40 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-5">
            <span className="text-xs uppercase tracking-wide font-semibold text-orange-700 dark:text-orange-300">
              Payoneer
            </span>
            <p className="text-lg font-bold text-foreground mt-1 mb-2">La más arraigada</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              El estándar de facto para freelancers AR y marketplaces (Upwork, Fiverr). Cuenta, tarjeta y retiro a
              banco local, con <strong className="text-foreground">comisiones intermedias</strong>.
            </p>
          </div>
          <div className="rounded-2xl border border-violet-200 dark:border-violet-800/40 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-5">
            <span className="text-xs uppercase tracking-wide font-semibold text-violet-700 dark:text-violet-300">
              Deel
            </span>
            <p className="text-lg font-bold text-foreground mt-1 mb-2">La de contractors</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Pensada para cuando una <strong className="text-foreground">empresa te contrata como contractor</strong>:
              contrato, factura, billetera USD y tarjeta en un solo lugar. Gratis para vos como contractor.
            </p>
          </div>
        </div>
      </section>

      {/* Comparativa rápida */}
      <section className="mb-12">
        <h2
          id="comparativa-rapida"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Comparativa rápida
        </h2>
        <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-x-auto shadow-sm">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Aspecto</th>
                <th className="text-left px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-300">Wise</th>
                <th className="text-left px-4 py-3 font-semibold text-orange-700 dark:text-orange-300">Payoneer</th>
                <th className="text-left px-4 py-3 font-semibold text-violet-700 dark:text-violet-300">Deel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_td]:text-slate-700 dark:[&_td]:text-slate-300">
              <tr>
                <td className="font-semibold text-foreground">Para qué sirve</td>
                <td>Cuenta multidivisa: te pagan en USD/EUR/GBP</td>
                <td>Cuenta + tarjeta; ideal marketplaces</td>
                <td>Plataforma de contractor: el cliente paga vía Deel</td>
              </tr>
              <tr>
                <td className="font-semibold text-foreground">Recibir USD</td>
                <td>Gratis por ACH; wire ~USD 6,11 fijo</td>
                <td>Gratis en cuenta receptora local; 1% si no es local / ACH</td>
                <td>Sin fee de recepción (pagás al retirar)</td>
              </tr>
              <tr>
                <td className="font-semibold text-foreground">Conversión de moneda</td>
                <td>Tipo medio de mercado + ~0,5%–2%</td>
                <td>0,5% swap interno; 1,2%–4% al retirar con conversión</td>
                <td>Margen ~1%–3% según método</td>
              </tr>
              <tr>
                <td className="font-semibold text-foreground">Retiro a banco argentino</td>
                <td>Sí, convierte a ARS (tope ~USD 18.000/mes); sin tarjeta AR</td>
                <td>Sí, a USD (Santander) o a pesos; varios intermediarios</td>
                <td>Sí, a pesos (tipo oficial) o mantenés USD/tarjeta</td>
              </tr>
              <tr>
                <td className="font-semibold text-foreground">Tarjeta</td>
                <td>No disponible en Argentina</td>
                <td>Sí (USD 29,95/año)</td>
                <td>Sí, Deel Card (USD virtual 5 / física 10)</td>
              </tr>
              <tr>
                <td className="font-semibold text-foreground">Velocidad típica</td>
                <td>Recepción ~1 día; envío a ARS ~2–3 días</td>
                <td>Recepción inmediata; retiro 2–3 días</td>
                <td>Bancaria 1–5 días; tarjeta/cripto instantáneo</td>
              </tr>
              <tr>
                <td className="font-semibold text-foreground">Mejor para</td>
                <td>Volumen alto en USD, prioridad costo</td>
                <td>Marketplaces y cobros recurrentes simples</td>
                <td>Un cliente fijo que ya usa Deel</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Cifras a junio 2026. Las comisiones de conversión son rangos: el porcentaje exacto depende del par de monedas
          y del momento. Confirmá en el sitio oficial.
        </p>
      </section>

      {/* Ad mid-content */}
      <NativeAd className="my-12" />

      {/* Wise */}
      <section className="mb-12">
        <h2 id="wise" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Wise en detalle
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Wise (ex TransferWise) te da una <strong className="text-foreground">cuenta multidivisa</strong>: podés tener
          saldo en USD, EUR, GBP y otras monedas, y obtener datos bancarios de recepción en varias zonas (por ejemplo
          un número de cuenta y routing tipo banco de EE.UU. para que te paguen en dólares). Un residente argentino
          puede abrirla 100% online con DNI o pasaporte.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-5">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">A favor</p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Recibís USD gratis por ACH; wire SWIFT ~USD 6,11 fijo.</li>
              <li>Convierte al tipo medio de mercado, sin markup oculto, con comisión baja (~0,5%–2%).</li>
              <li>Datos de cuenta en USD, EUR, GBP y más zonas.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-rose-200 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-950/20 p-5">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">En contra (Argentina)</p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>La tarjeta de débito Wise no está disponible para residentes argentinos.</li>
              <li>No podés mantener saldo en ARS ni ingresar pesos.</li>
              <li>El envío a banco argentino convierte a ARS (tope ~USD 18.000/mes); según fuentes independientes usa tipo oficial, poco favorable.</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Por eso, en la práctica, muchos usan Wise para <strong className="text-foreground">recibir y guardar USD
          barato</strong> y después sacan a pesos por otro camino (cripto/stablecoins o P2P) en vez de convertir dentro
          de Wise.
        </p>
        <div className="mt-5">
          {/* TODO-AFILIADO: Wise — rel="sponsored" cuando esté el link */}
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            Abrí tu cuenta Wise
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Payoneer */}
      <section className="mb-12">
        <h2 id="payoneer" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Payoneer en detalle
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Payoneer es, históricamente, el estándar de los freelancers argentinos y de los marketplaces (Upwork, Fiverr,
          etc.). Te da <strong className="text-foreground">cuentas receptoras</strong> en USD, EUR y GBP, una tarjeta y
          la posibilidad de retirar a un banco local. La apertura es gratuita y online.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-5">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">A favor</p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Integración directa con marketplaces y plataformas.</li>
              <li>Recibir de otro cliente Payoneer o en cuenta receptora local: gratis.</li>
              <li>Tarjeta disponible (USD 29,95/año) y retiro a banco argentino.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-rose-200 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-950/20 p-5">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">En contra</p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>1% al recibir por ACH o desde banco UE/UK; hasta 3,99% + USD 0,49 por tarjeta.</li>
              <li>Retiro con conversión: rango 1,2%–4% (a veces hasta ~3,5% end-to-end).</li>
              <li>El retiro directo a pesos suele ir al tipo oficial; muchos usan intermediarios para acercarse al MEP.</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          El detalle del retiro a <strong className="text-foreground">pesos vs. dólares</strong> y el tipo de cambio
          aplicable conviene confirmarlo en tu cuenta, porque cambió en los últimos años y las fuentes no coinciden del
          todo.
        </p>
        <div className="mt-5">
          {/* TODO-AFILIADO: Payoneer — rel="sponsored" cuando esté el link */}
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors"
          >
            Abrí tu cuenta Payoneer
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Deel */}
      <section className="mb-12">
        <h2 id="deel" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Deel en detalle
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Deel juega en otra categoría: es una <strong className="text-foreground">plataforma de contratación</strong>.
          El flujo natural es que una empresa del exterior te contrate como contractor, firme un contrato y te pague a
          través de Deel; vos retirás tu saldo. También podés usarlo en modo standalone (vos creás el contrato e
          invitás al cliente). Suma billetera en USD, Deel Card y, desde junio 2026, un stablecoin propio (DLUSD), con
          Argentina como mercado de lanzamiento.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-5">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">A favor</p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Gratis para vos como contractor (el abono lo paga la empresa).</li>
              <li>Contrato, factura y cobro en un solo lugar; útil con un cliente fijo.</li>
              <li>Múltiples salidas: banco local (USD 0), Wise, PayPal, tarjeta, cripto.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-rose-200 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-950/20 p-5">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">En contra</p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Tiene sentido sobre todo si el cliente ya usa (o acepta usar) Deel.</li>
              <li>El costo está en el método de retiro y el margen de conversión (~1%–3%).</li>
              <li>Retiro a pesos al tipo oficial; conviene mantener USD si querés evitarlo.</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Igual que con las otras, si el que te paga está afuera, la operación se respalda con{" "}
          <Link
            href="/monotributo/factura-e"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            factura E
          </Link>{" "}
          de exportación de servicios.
        </p>
        <div className="mt-5">
          {/* TODO-AFILIADO: Deel — rel="sponsored" cuando esté el link */}
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
          >
            Ver Deel
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Compliance CRS */}
      <section className="mb-12">
        <h2 id="compliance-crs" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Compliance: qué implica cada una bajo CRS para ARCA
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El <strong className="text-foreground">CRS</strong> (Common Reporting Standard) es el régimen de intercambio
          automático de información financiera entre países. Argentina participa, así que las entidades financieras de
          jurisdicciones adheridas reportan los saldos de residentes fiscales argentinos a su autoridad local, que los
          intercambia con ARCA. Te lo contamos en detalle en{" "}
          <Link
            href="/monotributo/crs-arca"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            CRS y ARCA
          </Link>
          .
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          La clave es que <strong className="text-foreground">depende de qué entidad y en qué jurisdicción</strong>{" "}
          esté tu saldo, no del nombre de la app:
        </p>
        <ul className="text-base text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 list-disc list-inside mb-4">
          <li>
            <strong className="text-foreground">Jurisdicciones que sí adhieren al CRS</strong> (la UE —Irlanda,
            Bélgica—, Reino Unido, etc.) reportan, en principio, las cuentas de un residente argentino. Un saldo en EUR
            de Payoneer está bajo una entidad irlandesa; uno en GBP, bajo una entidad del Reino Unido. Wise también opera
            con entidades europeas y británicas según el cliente.
          </li>
          <li>
            <strong className="text-foreground">Estados Unidos no participa del CRS</strong>: usa FATCA, que está
            orientado a US persons y es, en la práctica, no recíproco. Por eso un saldo alojado en una entidad/banco
            de EE.UU. (varias de estas apps usan datos de cuenta y bancos estadounidenses para los USD) no se reporta a
            Argentina por la vía del CRS.
          </li>
        </ul>
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-semibold">Importante, sin exagerar.</strong> Que EE.UU. no reporte bajo CRS{" "}
          <strong className="font-semibold">no significa</strong> que el dinero quede &ldquo;invisible&rdquo; ni que no
          tengas que declararlo: como residente fiscal argentino, tus saldos en el exterior se declaran igual ante ARCA
          (por ejemplo, en Bienes Personales). Además, ninguna de las tres plataformas publica de forma clara qué
          entidad concreta titulariza el saldo de un residente argentino, así que las implicancias exactas hay que
          confirmarlas en el acuerdo de cliente y con un contador.
        </div>
      </section>

      <SupportBanner />
      <div className="mb-12" />

      {/* Cuál te conviene */}
      <section className="mb-12">
        <h2 id="cual-te-conviene" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Cuál te conviene según tu caso
        </h2>
        <div className="space-y-4">
          {[
            {
              title: "Cobrás de varios clientes en USD y querés minimizar comisiones",
              body: "Si te pagan por transferencia (ACH/wire) y tu prioridad es el costo, Wise suele ser la más eficiente para recibir y convertir. Asumí que el cash-out a pesos lo vas a resolver por fuera.",
              answer: "Wise",
              answerColor: "text-emerald-700 dark:text-emerald-300",
            },
            {
              title: "Trabajás con marketplaces (Upwork, Fiverr) o querés tarjeta y banco local",
              body: "Payoneer está integrado con casi todas las plataformas y te da tarjeta + retiro a banco argentino. Es la opción más cómoda si ya cobrás por marketplaces.",
              answer: "Payoneer",
              answerColor: "text-orange-700 dark:text-orange-300",
            },
            {
              title: "Una empresa del exterior te contrata como contractor fijo",
              body: "Si tu cliente usa (o acepta usar) Deel, tener contrato, factura, billetera USD y tarjeta en un solo lugar simplifica todo. Es gratis para vos como contractor.",
              answer: "Deel",
              answerColor: "text-violet-700 dark:text-violet-300",
            },
            {
              title: "Querés guardar en dólares y decidir después cómo pasar a pesos",
              body: "Wise o Payoneer para mantener el saldo en USD; el paso a pesos lo hacés cuando te conviene (banco, cripto/stablecoins o P2P), comparando el tipo de cambio.",
              answer: "Wise o Payoneer",
              answerColor: "text-sky-700 dark:text-sky-300",
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
              <div className={`shrink-0 text-sm font-bold ${item.answerColor} whitespace-nowrap`}>→ {item.answer}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Sea cual sea la que elijas, recordá que los ingresos del exterior{" "}
          <strong className="text-foreground">cuentan para el tope</strong> de tu categoría. Mirá cómo encararlo en{" "}
          <Link
            href="/monotributo/cobrar-del-exterior"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            cobrar del exterior siendo monotributista
          </Link>
          .
        </p>
      </section>

      <RelatedGuides currentHref="/monotributo/wise-vs-payoneer-vs-deel" className="mb-12" />

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={wisePayoneerDeelFaqEntries} />
      </section>
    </div>
  );
}
