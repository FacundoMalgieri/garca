import type { Metadata } from "next";
import Link from "next/link";

import { NativeAd } from "@/components/ads/NativeAd";
import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { cobrarExteriorFaqEntries, getGuideDateModified } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "como-funciona", label: "Cómo funciona (en una frase)" },
  { id: "paso-a-paso", label: "Paso a paso para cobrar del exterior" },
  { id: "factura-e", label: "Factura E: el comprobante" },
  { id: "ingresar-las-divisas", label: "Cómo se ingresan los dólares (BCRA 2026)" },
  { id: "plataformas", label: "Plataformas para recibir USD" },
  { id: "cuentas-usd-eeuu", label: "Cuentas en USD en EE.UU." },
  { id: "tope-monotributo", label: "Cómo impacta en el tope del Monotributo" },
  { id: "crs", label: "Qué cambió con CRS 2.0" },
];

export const metadata: Metadata = {
  title: "Cómo cobrar del exterior siendo monotributista (2026)",
  description:
    "Guía 2026 para cobrar del exterior como monotributista en Argentina: factura E, cómo ingresar los dólares según el BCRA, plataformas (Wise, Payoneer, Deel), cómo cuenta para el tope y qué cambió con CRS 2.0.",
  keywords: [
    "como cobrar del exterior monotributo",
    "cobrar en dolares freelancer argentina 2026",
    "recibir pagos del exterior monotributo",
    "exportacion de servicios monotributo",
    "factura e exterior",
    "liquidar divisas exportacion servicios bcra",
    "cobrar dolares freelancer argentina",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/cobrar-del-exterior` },
  openGraph: {
    title: "Cómo cobrar del exterior siendo monotributista (2026)",
    description:
      "Factura E, cómo ingresar los dólares según el BCRA, plataformas para recibir USD y cómo impacta en el tope del Monotributo. Guía 2026.",
    type: "article",
    url: `${siteUrl}/monotributo/cobrar-del-exterior`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/cobrar-del-exterior.png",
        width: 1200,
        height: 630,
        alt: "Cómo cobrar del exterior siendo monotributista en Argentina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/cobrar-del-exterior.png"],
    title: "Cómo cobrar del exterior siendo monotributista (2026)",
    description:
      "Factura E, cómo ingresar los dólares según el BCRA, plataformas para recibir USD y cómo cuenta para el tope del Monotributo.",
  },
};

export default function CobrarDelExteriorPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Cobrar del exterior" },
        ]}
      />

      {/* Arriba del título: respuesta directa para búsquedas tipo "como cobrar del exterior monotributo" /
          "cobrar en dolares freelancer argentina" / PAA (mismo patrón que factura-e / arca-vs-afip) */}
      <p
        id="respuesta-directa"
        className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-8 -mt-1"
      >
        Para <strong className="text-foreground">cobrar del exterior siendo monotributista</strong> el circuito legal es:{" "}
        emitís una{" "}
        <Link
          href="/monotributo/factura-e"
          className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
        >
          factura E
        </Link>{" "}
        por la exportación de servicios, recibís el pago en dólares (transferencia, Wise, Payoneer, Deel, etc.) e{" "}
        <strong className="text-foreground">ingresás las divisas al país dentro del plazo que fija el BCRA</strong>. A
        junio de 2026 ya <strong className="text-foreground">no hace falta liquidarlas al dólar oficial</strong>: podés
        conservarlas en dólares. Eso sí, el total facturado <strong className="text-foreground">cuenta para el tope</strong>{" "}
        de tu categoría.
      </p>

      <ArticleHero
        image="/og/cobrar-del-exterior.png"
        imageAlt="Cómo cobrar del exterior siendo monotributista en Argentina"
        badgeLabel="Cobros del exterior"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        title="Cómo cobrar del exterior siendo monotributista"
        description={
          <>
            La guía completa para <strong className="text-white">recibir pagos de clientes del exterior</strong> de forma
            legal en 2026: factura E, cómo ingresar los dólares según el BCRA, las plataformas más usadas y cómo impacta
            en tu categoría de Monotributo.
          </>
        }
        dateModified={dateModified}
        readingTime="9 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl border border-sky-200 dark:border-sky-800/40 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-sky-600 dark:text-sky-400 mb-2">
            Comprobante
          </p>
          <p className="text-2xl font-bold text-foreground">Factura E</p>
          <p className="text-sm text-muted-foreground mt-1">Exportación de servicios</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            Liquidar al oficial
          </p>
          <p className="text-2xl font-bold text-foreground">Ya no</p>
          <p className="text-sm text-muted-foreground mt-1">A junio 2026 (BCRA)</p>
        </div>
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-amber-600 dark:text-amber-400 mb-2">
            Tope Monotributo
          </p>
          <p className="text-2xl font-bold text-foreground">Sí computa</p>
          <p className="text-sm text-muted-foreground mt-1">Por total facturado</p>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mb-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-foreground">Esta guía es informativa, no es asesoramiento contable ni
          impositivo.</strong>{" "}
          La normativa cambiaria del BCRA y las reglas de ARCA se actualizan seguido. Los datos están al día a{" "}
          <strong className="text-foreground">junio de 2026</strong>. Antes de tomar decisiones sobre cobros del
          exterior, consultá con un contador matriculado.
        </p>
      </div>

      {/* Cómo funciona */}
      <section className="mb-12">
        <h2 id="como-funciona" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Cómo funciona (en una frase)
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Si trabajás para una empresa o cliente del exterior (desarrollo, diseño, marketing, consultoría, contenido,
          etc.), lo que hacés es una <strong className="text-foreground">exportación de servicios</strong>. El circuito
          legal tiene tres patas:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              n: "1",
              title: "Facturás",
              body: "Emitís factura E en ARCA por cada cobro del exterior, en dólares (o la moneda que corresponda).",
            },
            {
              n: "2",
              title: "Cobrás",
              body: "Recibís el pago por transferencia bancaria, Wise, Payoneer, Deel u otra plataforma habilitada.",
            },
            {
              n: "3",
              title: "Ingresás",
              body: "Traés las divisas al sistema financiero argentino dentro del plazo del BCRA. Hoy podés mantenerlas en USD.",
            },
          ].map((item) => (
            <div
              key={item.n}
              className="rounded-2xl border border-sky-200 dark:border-sky-800/40 bg-gradient-to-br from-sky-50/70 to-cyan-50/70 dark:from-sky-950/20 dark:to-cyan-950/20 p-5"
            >
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold shadow-sm mb-3">
                {item.n}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Ojo: el cliente tiene que estar <strong className="text-foreground">afuera del país</strong>. Si te paga un
          cliente argentino, aunque sea en dólares, corresponde factura C, no E.
        </p>
      </section>

      {/* Paso a paso */}
      <section className="mb-12">
        <h2 id="paso-a-paso" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Paso a paso para cobrar del exterior
        </h2>
        <ol className="space-y-4">
          {[
            {
              title: "Dadte de alta en el Monotributo (o verificá tu categoría)",
              body: "Para facturar legalmente al exterior tenés que estar inscripto. Si ya sos monotributista, asegurate de tener una actividad de servicios declarada acorde a lo que hacés.",
            },
            {
              title: "Habilitá un punto de venta para factura E",
              body: "En ARCA, desde 'Administración de puntos de venta y domicilios', creás un punto de venta específico para comprobantes de exportación (factura E). Es distinto del que usás para la factura C local.",
            },
            {
              title: "Acordá la forma de cobro con tu cliente",
              body: "Definí si te van a pagar por transferencia internacional (SWIFT), por una plataforma (Wise, Payoneer, Deel) o como contractor a través de un EOR. Pedile que use el medio que mejor te convenga por costos.",
            },
            {
              title: "Emití la factura E por cada cobro",
              body: "En 'Comprobantes en Línea' cargás la operación: tipo factura E, datos del cliente del exterior, país, moneda (usualmente USD) e importe. ARCA genera el CAE y el PDF que le mandás al cliente.",
            },
            {
              title: "Recibí el pago",
              body: "El dinero entra a tu cuenta de la plataforma o a tu cuenta bancaria en el exterior/local. Guardá siempre el comprobante del cobro (extracto, captura de la plataforma).",
            },
            {
              title: "Ingresá las divisas al país en plazo",
              body: "Tenés que ingresar los fondos al sistema financiero argentino dentro del plazo que fija el BCRA. A junio 2026 no estás obligado a venderlos a pesos al dólar oficial: podés conservarlos en dólares.",
            },
            {
              title: "Guardá todo el respaldo",
              body: "Factura E, contrato o acuerdo, comprobante de cobro y de ingreso de divisas. Es lo que te cubre ante una eventual fiscalización de ARCA o un pedido del banco.",
            },
          ].map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-border bg-white dark:bg-background p-5"
            >
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

      {/* Ad mid-content (native, responsive) */}
      <NativeAd className="my-12" />

      {/* Factura E */}
      <section className="mb-12">
        <h2 id="factura-e" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Factura E: el comprobante de la exportación
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          La <strong className="text-foreground">factura E</strong> es el comprobante que respalda toda venta de
          servicios (o bienes) a un cliente del exterior. Es el corazón del circuito: sin factura E, el cobro del
          exterior no tiene respaldo formal y el ingreso de divisas queda “colgado”.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Se emite en dólares u otra moneda extranjera; el sistema la convierte a pesos para el registro impositivo,
          usando la cotización del tipo de cambio que corresponda (en general, el del Banco Nación del día previo). La
          exportación está <strong className="text-foreground">exenta de IVA</strong>, así que la factura E no
          discrimina IVA, igual que la factura C.
        </p>
        <p className="text-sm text-muted-foreground">
          Tenés el detalle del paso a paso de emisión, los datos del cliente extranjero y los requisitos en la guía
          dedicada:{" "}
          <Link
            href="/monotributo/factura-e"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            Factura E para monotributistas
          </Link>
          .
        </p>
      </section>

      {/* Ingresar las divisas */}
      <section className="mb-12">
        <h2 id="ingresar-las-divisas" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Cómo se ingresan los dólares al país (reglas BCRA, a junio 2026)
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Esta es la parte que más cambió y la que más se desactualiza en internet. Te lo dejamos con fecha. A{" "}
          <strong className="text-foreground">junio de 2026</strong>, el régimen para exportadores de servicios
          (personas humanas) que fija el BCRA quedó así:
        </p>
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5">
            <h3 className="text-base font-bold text-foreground mb-1">No hay tope de monto</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              En septiembre de 2025 el BCRA (Comunicación “A” 8330) eliminó el viejo límite de USD 36.000 anuales para
              acceder al beneficio de no liquidar. La Comunicación “A” 8417 (2026) consolidó esa flexibilidad. Ya no hay
              monto máximo.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5">
            <h3 className="text-base font-bold text-foreground mb-1">No estás obligado a liquidar al dólar oficial</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Una vez ingresadas las divisas, podés conservarlas en dólares en tu cuenta y disponer de ellas libremente.
              No hay obligación de venderlas a pesos al tipo de cambio oficial.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5">
            <h3 className="text-base font-bold text-foreground mb-1">Sí hay que ingresarlas al país, en plazo</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              La obligación de ingresar las divisas al sistema financiero local sigue vigente: el plazo informado es de{" "}
              <strong className="text-foreground">20 días hábiles</strong> desde que cobrás o se acreditan en una cuenta
              del exterior. “No liquidar” no es lo mismo que “no ingresar”.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background p-5">
            <h3 className="text-base font-bold text-foreground mb-1">¿Y el dólar MEP / CCL?</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              El MEP y el CCL son mecanismos del mercado de capitales para comprar o vender dólares vía bonos/acciones,
              no son la vía por la que ingresa el cobro de tu factura E. En el régimen viejo había una restricción de 90
              días para operar MEP/CCL si querías el beneficio de no liquidar; con las comunicaciones de 2025-2026 esa
              restricción cruzada se eliminó. Aun así, el tratamiento cambiario se actualiza seguido: confirmalo con tu
              contador antes de operar.
            </p>
          </div>
        </div>
      </section>

      {/* Plataformas */}
      <section className="mb-12">
        <h2 id="plataformas" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Plataformas para recibir dólares del exterior
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          A grandes rasgos, estas son las vías más usadas por freelancers argentinos en 2026. Ninguna te exime de
          facturar ni de ingresar las divisas: son el “cómo te llega la plata”, no un atajo legal. Los costos cambian,
          así que verificá las comisiones vigentes en cada plataforma.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Transferencia bancaria (SWIFT)",
              body: "El cliente transfiere a tu cuenta. Es lo más directo para empresas formales, pero puede tener costos y demoras según los bancos intermediarios.",
            },
            {
              title: "Wise",
              body: "Conocida por tipos de cambio competitivos y comisiones transparentes. Muy usada para recibir y mover USD/EUR.",
            },
            {
              title: "Payoneer",
              body: "Muy extendida con plataformas de freelancing y marketplaces. Cobra comisiones por retiro y conversión que conviene revisar.",
            },
            {
              title: "Deel y otros EOR",
              body: "Si tu cliente te contrata como contractor vía Deel (u otro), gestionás contrato y cobro desde la plataforma y retirás a tu banco, Wise, Payoneer u otros.",
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
        <div className="mt-6 rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-blue-50/70 dark:bg-blue-950/20 p-5">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            ¿Buscás abrir una cuenta para recibir USD?{" "}
            <a
              href="https://wise.com/invite/irhc/facundom58"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
            >
              Abrí tu cuenta en Wise
            </a>{" "}
            o compará todas las opciones en{" "}
            <Link
              href="/monotributo/wise-vs-payoneer-vs-deel"
              className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
            >
              nuestra comparativa
            </Link>
            .
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Enlace de afiliado: si abrís tu cuenta desde acá, GARCA puede ganar una comisión, sin costo extra para vos.
          </p>
        </div>
      </section>

      {/* Cuentas en USD en EE.UU. */}
      <section className="mb-12">
        <h2 id="cuentas-usd-eeuu" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Cuentas en USD en EE.UU. (GrabrFi y Utoppia)
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Además de Wise o Payoneer, hay una categoría aparte: las{" "}
          <strong className="text-foreground">cuentas en dólares domiciliadas en Estados Unidos</strong> pensadas para
          freelancers latinoamericanos. Te dan tu propio <strong className="text-foreground">número de cuenta y routing
          de EE.UU.</strong> (como una cuenta local estadounidense) para recibir ACH/wire, una tarjeta para gastar en
          USD y, en general, la opción de transferir a tu banco argentino. Las dos más conocidas en Argentina a junio de
          2026 son <strong className="text-foreground">GrabrFi</strong> y <strong className="text-foreground">Utoppia</strong>;
          ambas no son bancos en sí: la cuenta la provee <strong className="text-foreground">Regent Bank (miembro
          FDIC)</strong>.
        </p>

        <div className="mb-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background p-5">
          <h3 className="text-base font-bold text-foreground mb-2">El matiz fiscal: FATCA, no CRS</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            Por ser cuentas radicadas en EE.UU. caen bajo <strong className="text-foreground">FATCA</strong>, el régimen
            estadounidense, y <strong className="text-foreground">no bajo el CRS de la OCDE</strong>. Estados Unidos no
            participa del CRS y FATCA es, en la práctica, mayormente{" "}
            <strong className="text-foreground">no recíproco</strong>: el IRS pide datos de cuentas de estadounidenses en
            el exterior, pero EE.UU. casi no informa automáticamente sobre cuentas de extranjeros a sus países de
            residencia. Por eso una cuenta en EE.UU. <strong className="text-foreground">no se reporta a ARCA por la vía
            automática del CRS</strong> como sí puede pasar con una fintech europea o del Reino Unido.
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Atención: esto es solo sobre el <em>reporte automático</em>, no sobre tu obligación. Si sos{" "}
            <strong className="text-foreground">residente fiscal argentino</strong>, igual tenés que{" "}
            <strong className="text-foreground">declarar tus cuentas e ingresos del exterior</strong> y, como
            monotributista, facturar e ingresar las divisas en regla. Esto no es una vía para ocultar plata. Tenés el
            detalle del intercambio de información en{" "}
            <Link
              href="/monotributo/crs-arca"
              className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
            >
              CRS 2.0 y ARCA
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/70 to-green-50/70 dark:from-emerald-950/20 dark:to-green-950/20 p-5">
            <h3 className="text-lg font-bold text-foreground mb-2">GrabrFi</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              Wallet con cuenta de EE.UU. (routing + número de cuenta), tarjeta Mastercard en dólares y conversión a
              stablecoins. Apuntada a freelancers que cobran de Upwork, Deel o Toptal por depósito directo.
            </p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 mb-4">
              <li>• Apertura y mantenimiento sin costo; se hace online con pasaporte o DNI, sin viajar a EE.UU.</li>
              <li>• ACH entrante sin cargo; podés retirar a tu banco en Argentina (verificá la comisión vigente en el sitio oficial).</li>
              <li>• Disponible para Argentina a junio 2026; la cuenta la provee Regent Bank (FDIC).</li>
            </ul>
            <a
              href="https://app.grabrfi.com/sign-up?invite-code=1hWp7ogShTqm"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Abrí tu cuenta en GrabrFi
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div className="rounded-2xl border border-sky-200 dark:border-sky-800/40 bg-gradient-to-br from-sky-50/70 to-cyan-50/70 dark:from-sky-950/20 dark:to-cyan-950/20 p-5">
            <h3 className="text-lg font-bold text-foreground mb-2">Utoppia</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              Neobanco fundado por argentinos, con cuenta en dólares de EE.UU. a tu nombre, tarjeta Visa física y virtual,
              stablecoins y pago de servicios. Disponible en Argentina y otros ~18 países.
            </p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 mb-4">
              <li>• Apertura y mantenimiento sin costo; recibís USD por ACH, ACH same-day, SWIFT y wire.</li>
              <li>• Tarjeta Visa para comprar y extraer en el exterior (verificá comisiones de cambio/extracción en el sitio oficial).</li>
              <li>• La cuenta la provee Regent Bank (FDIC), vía la plataforma Synctera.</li>
            </ul>
            <a
              href="https://utoppia.page.link/JoinUtoppia"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
            >
              Abrí tu cuenta en Utoppia
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Con el código <strong className="text-foreground">UTOPPIA-CHFV</strong> sumás un bono de USD 10 al abrir tu
              cuenta.
            </p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              A tener en cuenta: en marzo de 2023 Utoppia recibió una orden de cese (<em>cease-and-desist</em>) de la
              FDIC por declaraciones engañosas sobre el seguro de depósitos; posteriormente ajustó su comunicación.
              Confirmá los términos de cobertura vigentes en su sitio.
            </p>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Enlace de afiliado: si abrís tu cuenta desde acá, GARCA puede ganar una comisión, sin costo extra para vos.
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Datos a junio de 2026. Las comisiones y la disponibilidad por país cambian: confirmá siempre los costos
          vigentes en el sitio oficial de cada plataforma antes de abrir tu cuenta. Esto es informativo, no
          asesoramiento.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background p-5">
          <h3 className="text-base font-bold text-foreground mb-2">Seguridad y respaldo de los fondos</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            Antes de mover plata, conviene entender qué estás usando. Ni GrabrFi ni Utoppia son bancos: son{" "}
            <strong className="text-foreground">fintech que corren por encima de un banco socio</strong>. La plata no la
            tienen ellas, sino el banco. Según las propias plataformas (a junio de 2026), GrabrFi declara que la cuenta
            la provee <strong className="text-foreground">Regent Bank (miembro FDIC)</strong>; Utoppia menciona en
            distintas partes de su sitio tanto a <strong className="text-foreground">Regent Bank</strong> como a{" "}
            <strong className="text-foreground">Lead Bank</strong>, ambos miembros FDIC, así que conviene chequear en su
            sitio cuál es el banco vigente para tu cuenta.
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            El seguro de la FDIC acá funciona por <strong className="text-foreground">&quot;pass-through&quot;</strong>{" "}
            (traspaso): tus dólares se depositan a tu nombre en el banco socio y, en teoría, quedan cubiertos hasta{" "}
            <strong className="text-foreground">USD 250.000 por titular</strong>. Pero ese traspaso{" "}
            <strong className="text-foreground">no es automático</strong>: la FDIC exige que la cuenta esté estructurada
            como custodia y que existan <strong className="text-foreground">registros que identifiquen a cada
            beneficiario</strong> y su saldo. Si esos registros fallan, la cobertura individual puede no aplicar como se
            espera. Además, el seguro <strong className="text-foreground">solo cubre la quiebra del banco</strong>, no
            problemas de la fintech o del intermedio tecnológico, y en general{" "}
            <strong className="text-foreground">no cubre saldos en stablecoins ni cripto</strong> (en Utoppia, lo cripto
            lo opera un tercero, BVNK, fuera de la cobertura FDIC).
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            El riesgo real de este modelo es la <strong className="text-foreground">dependencia del banco y del
            intermediario</strong>. El caso testigo es el colapso de <strong className="text-foreground">Synapse</strong>{" "}
            en 2024: una plataforma BaaS quebró y más de 100.000 personas en EE.UU. quedaron sin acceso a sus fondos por
            descalces entre los registros de la fintech y el banco; parte de esa plata tardó en aparecer. GrabrFi
            justamente <strong className="text-foreground">era una de las fintech sobre Synapse y, según sus
            comunicados, anunció con anticipación su migración a Regent Bank/Synctera y dio a los usuarios la opción de
            retirar el saldo antes del cierre</strong>. No encontramos evidencia de que los fondos de GrabrFi quedaran
            congelados como en los casos más graves de Synapse, pero el episodio muestra que el eslabón débil suele ser
            el banco o el intermediario, no la fintech en sí.
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            En resumen, a junio de 2026: confirmá en el sitio oficial de cada plataforma quién es el banco socio y los
            términos exactos de cobertura FDIC <em>antes</em> de depositar, y como regla práctica{" "}
            <strong className="text-foreground">no tengas ahí más plata de la que necesitás para operar</strong>. Esto
            es informativo, no asesoramiento financiero.
          </p>
        </div>
      </section>

      {/* Tope */}
      <section className="mb-12">
        <h2 id="tope-monotributo" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Cómo impacta en el tope del Monotributo
        </h2>
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              Hay un mito muy difundido de que <strong className="text-foreground">los cobros del exterior no cuentan</strong>{" "}
              para el tope del Monotributo. Según ARCA, el monotributista puede exportar servicios{" "}
              <strong className="text-foreground">sin superar los límites de facturación de su categoría máxima</strong>:
              es decir, esa facturación <strong className="text-foreground">sí computa</strong> para el tope anual y para
              la recategorización.
            </p>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              El monto que se compara con el tope es el <strong className="text-foreground">total facturado convertido a
              pesos</strong> (según la cotización del día de cada factura E). Lo único que no sumás es IVA, porque la
              exportación está exenta. Si tu facturación al exterior crece mucho, mirá también{" "}
              <Link
                href="/monotributo/vs-responsable-inscripto"
                className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
              >
                Monotributo vs Responsable Inscripto
              </Link>
              .
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Más detalle en{" "}
          <Link
            href="/monotributo/declarar-ingresos-exterior"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            cómo declarar ingresos del exterior
          </Link>
          .
        </p>
      </section>

      {/* CRS */}
      <section className="mb-12">
        <h2 id="crs" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Qué cambió con CRS 2.0
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El CRS 2.0 es la versión ampliada del estándar de intercambio automático de información financiera de la OCDE.
          Argentina adhirió, y a partir de él ARCA puede recibir datos de cuentas, billeteras y plataformas del exterior
          (incluidas fintech y operadores de criptoactivos). La recolección de datos bajo las nuevas reglas arranca a
          comienzos de 2026 y el intercambio efectivo de esa información llega después.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          ¿Qué significa para vos? Que los saldos y movimientos en plataformas como Payoneer, Wise o exchanges pueden
          terminar siendo visibles para ARCA. Si cobrás del exterior, lo más prolijo es facturar e ingresar las divisas
          en regla: así lo que reporten esas plataformas coincide con lo que declarás.
        </p>
        <p className="text-sm text-muted-foreground">
          Tenés el detalle en{" "}
          <Link
            href="/monotributo/crs-arca"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            CRS 2.0 y ARCA
          </Link>
          .
        </p>
      </section>

      <RelatedGuides currentHref="/monotributo/cobrar-del-exterior" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={cobrarExteriorFaqEntries} />
      </section>
    </div>
  );
}
