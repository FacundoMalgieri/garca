import type { Metadata } from "next";
import Link from "next/link";

import { NativeAd } from "@/components/ads/NativeAd";
import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { crsArcaFaqEntries, getGuideDateModified } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "que-es-crs", label: "¿Qué es el CRS y el CRS 2.0?" },
  { id: "que-es-carf", label: "¿Y el CARF (cripto)?" },
  { id: "timeline", label: "Fechas: cuándo arranca y cuándo llega a ARCA" },
  { id: "que-datos", label: "Qué datos se reportan" },
  { id: "fatca-vs-crs", label: "El punto clave: EE.UU. usa FATCA, no CRS" },
  { id: "plataformas", label: "¿Wise, Payoneer y PayPal reportan a ARCA?" },
  { id: "que-hacer", label: "Qué te conviene hacer" },
];

export const metadata: Metadata = {
  title: "CRS 2.0 y ARCA 2026: qué cuentas y billeteras del exterior se reportan",
  description:
    "Qué es el CRS 2.0, qué datos de tus cuentas y billeteras del exterior recibe ARCA y desde cuándo. El punto clave: EE.UU. usa FATCA (no CRS), así que si Wise, Payoneer o PayPal reportan depende de la entidad que tiene tu cuenta. Guía a junio 2026.",
  keywords: [
    "crs 2.0 argentina",
    "wise payoneer reporta arca",
    "arca billeteras virtuales exterior",
    "crs 2.0 freelancers",
    "crs vs fatca argentina",
    "arca cuentas en el exterior",
    "carf cripto argentina",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/crs-arca` },
  openGraph: {
    title: "CRS 2.0 y ARCA: qué cuentas y billeteras del exterior se reportan (2026)",
    description:
      "Qué es el CRS 2.0, qué datos recibe ARCA y por qué que Wise, Payoneer o PayPal reporten depende de la entidad legal de tu cuenta (EE.UU. usa FATCA, no CRS).",
    type: "article",
    url: `${siteUrl}/monotributo/crs-arca`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/crs-arca.png",
        width: 1200,
        height: 630,
        alt: "CRS 2.0: intercambio de información financiera con ARCA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/crs-arca.png"],
    title: "CRS 2.0 y ARCA 2026: qué se reporta de tus cuentas del exterior",
    description:
      "EE.UU. usa FATCA (no CRS). Que Wise, Payoneer o PayPal reporten a ARCA depende de la entidad legal de tu cuenta. Guía a junio 2026.",
  },
};

export default function CrsArcaPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "CRS 2.0 y ARCA" },
        ]}
      />

      {/* Arriba del título: respuesta directa para PAA / búsquedas tipo
          "wise payoneer reporta arca" / "crs 2.0 argentina" */}
      <p
        id="respuesta-directa"
        className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-8 -mt-1"
      >
        El <strong className="text-foreground">CRS 2.0</strong> es la versión actualizada del estándar de la
        OCDE por el que los países intercambian datos de cuentas financieras. Argentina adhirió{" "}
        <strong className="text-foreground">hacia mediados de 2025</strong>: las plataformas{" "}
        <strong className="text-foreground">recolectan datos desde el 1/1/2026</strong> y ARCA los recibiría en
        el <strong className="text-foreground">primer intercambio de 2027</strong>. El detalle clave:{" "}
        <strong className="text-foreground">EE.UU. no participa del CRS</strong> (usa FATCA, en gran medida no
        recíproco), así que <strong className="text-foreground">que una billetera como Wise, Payoneer o PayPal
        reporte a ARCA depende de la entidad legal que tiene tu cuenta</strong>, no de la marca.
      </p>

      <ArticleHero
        image="/og/crs-arca.png"
        imageAlt="CRS 2.0 — intercambio de información financiera entre países y ARCA"
        badgeLabel="Explicador normativo"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        }
        title="CRS 2.0: qué sabrá ARCA de tus cuentas y billeteras del exterior"
        description={
          <>
            El <strong className="text-white">CRS 2.0</strong> amplía el intercambio automático de información
            financiera a billeteras digitales y cripto. Pero{" "}
            <strong className="text-white">EE.UU. no participa del CRS</strong>: que tu plataforma reporte a ARCA
            depende de la <strong className="text-white">entidad legal</strong> con la que firmaste, no de su nombre
            comercial.
          </>
        }
        dateModified={dateModified}
        readingTime="9 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* Disclaimer destacado */}
      <section className="mb-10">
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-foreground">Esto es información general, no asesoramiento fiscal ni
              legal.</strong> La normativa de intercambio de información es internacional, cambia seguido y la
              implementación local de ARCA todavía se está definiendo. Los datos de esta guía están actualizados a{" "}
              <strong className="text-foreground">junio de 2026</strong>. Antes de tomar decisiones sobre tus
              cobros del exterior, consultá con un contador o asesor de confianza.
            </p>
          </div>
        </div>
      </section>

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
              <ul className="space-y-2 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-5">
                <li>
                  El <strong className="text-foreground">CRS</strong> es el estándar multilateral de la OCDE para
                  que los países se manden datos de cuentas financieras de no residentes. El{" "}
                  <strong className="text-foreground">CRS 2.0</strong> lo amplía a billeteras digitales, dinero
                  electrónico y cripto.
                </li>
                <li>
                  Es <strong className="text-foreground">hacia adelante, no retroactivo</strong>: datos desde{" "}
                  <strong className="text-foreground">2026</strong>, primer intercambio a ARCA en{" "}
                  <strong className="text-foreground">2027</strong>.
                </li>
                <li>
                  <strong className="text-foreground">EE.UU. no participa del CRS.</strong> Usa FATCA, un sistema
                  bilateral y en gran parte <strong className="text-foreground">no recíproco</strong>: en general
                  no devuelve a Argentina datos de saldos de cuentas en EE.UU.
                </li>
                <li>
                  Por eso, <strong className="text-foreground">si Wise, Payoneer o PayPal reportan a ARCA depende
                  de qué entidad legal te abrió la cuenta</strong> (una entidad de EE.UU. se rige por FATCA; una
                  de la UE/Reino Unido, por CRS).
                </li>
                <li>
                  La conclusión práctica no es entrar en pánico: es{" "}
                  <strong className="text-foreground">declarar bien tus ingresos</strong> y tener los respaldos en
                  orden.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Qué es el CRS? */}
      <section className="mb-12">
        <h2 id="que-es-crs" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          ¿Qué es el CRS y el CRS 2.0?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El <strong className="text-foreground">CRS</strong> (Common Reporting Standard) es el estándar de la{" "}
          <strong className="text-foreground">OCDE</strong> para el{" "}
          <strong className="text-foreground">intercambio automático de información financiera</strong> (AEOI, por
          sus siglas en inglés) entre países. La lógica es simple: los bancos y entidades financieras de cada país
          identifican a los titulares <strong className="text-foreground">no residentes</strong> y reportan sus
          datos al fisco local, que después se los pasa al fisco del país donde esa persona es residente. Lo
          adoptaron más de 100 jurisdicciones, Argentina incluida (que ya intercambia bajo CRS desde hace años).
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El <strong className="text-foreground">CRS 2.0</strong> es la actualización de ese estándar. Técnicamente
          son las enmiendas a la CRS más un <em>Addendum</em> al acuerdo multilateral entre autoridades
          competentes (el MCAA). Lo importante para vos: <strong className="text-foreground">amplía qué se
          considera &ldquo;cuenta financiera&rdquo;</strong> para alcanzar productos que antes quedaban en una zona
          gris:
        </p>
        <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 list-disc pl-6 mb-3">
          <li>
            <strong className="text-foreground">Billeteras digitales y dinero electrónico</strong> (e-money) de
            plataformas de pago internacionales.
          </li>
          <li>
            <strong className="text-foreground">Monedas digitales de bancos centrales</strong> (CBDC).
          </li>
          <li>
            <strong className="text-foreground">Ciertos cripto-activos</strong> mantenidos en custodia y productos
            derivados o indirectos vinculados a cripto.
          </li>
        </ul>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          En criollo: el CRS &ldquo;clásico&rdquo; miraba sobre todo cuentas bancarias tradicionales; el CRS 2.0
          también mira las <strong className="text-foreground">billeteras de tipo fintech</strong> donde un
          freelance argentino suele cobrar del exterior.
        </p>
      </section>

      {/* CARF */}
      <section className="mb-12">
        <h2 id="que-es-carf" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          ¿Y el CARF (el marco específico de cripto)?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El <strong className="text-foreground">CARF</strong> (Crypto-Asset Reporting Framework) es{" "}
          <strong className="text-foreground">otro marco de la OCDE, separado del CRS</strong>, pensado
          específicamente para el reporte de cripto-activos por parte de exchanges y proveedores de servicios
          cripto. Suele anunciarse en el mismo paquete que el CRS 2.0 porque van de la mano, pero{" "}
          <strong className="text-foreground">no son lo mismo</strong>: el CRS 2.0 modifica el estándar de cuentas
          financieras, y el CARF crea un régimen propio para el ecosistema cripto.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          A junio de 2026, las jurisdicciones comprometidas con el CARF tienen previsto empezar a intercambiar
          recién en <strong className="text-foreground">2027, 2028 o 2029</strong> según el caso (las primeras, con
          datos del período 2026 y un plazo de reporte hacia mediados de 2027). Es un calendario{" "}
          <strong className="text-foreground">fragmentado entre países</strong>, así que conviene no asumir fechas
          únicas para todos.
        </p>
      </section>

      {/* Ad mid-content */}
      <NativeAd className="my-12" />

      {/* Timeline */}
      <section className="mb-12">
        <h2 id="timeline" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Fechas: cuándo arranca y cuándo llega a ARCA
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
          Lo más importante para bajar la ansiedad: <strong className="text-foreground">esto mira hacia adelante,
          no es retroactivo</strong>. La recolección de datos arranca en 2026 y el primer intercambio efectivo a
          ARCA recién ocurriría en 2027.
        </p>
        <ol className="space-y-4">
          {[
            {
              t: "~Julio 2025 — Argentina adhiere al CRS 2.0",
              b: "Hacia mediados de 2025, Argentina firmó el Addendum que la suma al CRS 2.0. (El mes exacto puede variar según la fuente; lo seguro es que fue durante 2025.)",
            },
            {
              t: "1 de enero de 2026 — Empieza la recolección de datos",
              b: "Desde esta fecha, las entidades alcanzadas (bancos y plataformas en jurisdicciones que adhirieron) empiezan a recolectar e identificar la información de los titulares no residentes, incluyendo argentinos.",
            },
            {
              t: "31 de diciembre de 2026 — Foto de cierre",
              b: "El saldo al cierre del año fiscal 2026 es uno de los datos típicos que se reporta. El primer período informado es, justamente, 2026.",
            },
            {
              t: "Durante 2027 — Primer intercambio hacia ARCA",
              b: "Las autoridades fiscales de los países adheridos se mandan la información del período 2026. Es el primer momento en que ARCA recibiría datos bajo CRS 2.0.",
            },
          ].map((step, i) => (
            <li key={step.t} className="flex gap-4 rounded-2xl border border-border bg-white dark:bg-background p-5">
              <span className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold shadow-sm">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">{step.t}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step.b}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground mt-4">
          Nota: además del intercambio internacional CRS, ARCA tiene{" "}
          <strong className="text-foreground">regímenes de información locales</strong> (sobre proveedores de
          pagos que operan en Argentina y cobros del exterior). Son <em>distintos</em> del CRS y a veces se
          mezclan en las notas periodísticas. Si una billetera local te informa a ARCA, no es por CRS sino por
          esos regímenes domésticos.
        </p>
      </section>

      {/* Qué datos */}
      <section className="mb-12">
        <h2 id="que-datos" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Qué datos se reportan
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Bajo CRS 2.0, la información que se intercambia sobre cada titular suele incluir:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Identificación del titular",
              body: "Nombre, domicilio, fecha de nacimiento, residencia fiscal y número de identificación tributaria (en Argentina, tu CUIT/CUIL).",
            },
            {
              title: "Identificación de la cuenta",
              body: "Número o identificador de la cuenta y la entidad que la mantiene (banco, plataforma de pago, custodio cripto).",
            },
            {
              title: "Saldo al cierre del año",
              body: "El balance de la cuenta al 31 de diciembre del período informado (o al cierre, si la cuenta se cerró antes).",
            },
            {
              title: "Rentas y movimientos relevantes",
              body: "Ingresos reportables del período (intereses, dividendos, montos brutos acreditados) y, según el caso, movimientos relevantes de la cuenta.",
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
          Un detalle del CRS 2.0: para cuentas nuevas de personas físicas{" "}
          <strong className="text-foreground">no hay un mínimo (de minimis)</strong> general, así que el alcance es
          amplio. Los umbrales puntuales que circulan en algunas notas (por ejemplo, ciertos montos para dinero
          electrónico o cripto) conviene verificarlos contra el texto oficial, porque pueden cambiar.
        </p>
      </section>

      {/* FATCA vs CRS — el punto crítico */}
      <section className="mb-12">
        <h2 id="fatca-vs-crs" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          El punto clave: EE.UU. usa FATCA, no CRS
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Acá está el malentendido más común. <strong className="text-foreground">Estados Unidos no participa del
          CRS.</strong> En lugar de eso usa su propio régimen, <strong className="text-foreground">FATCA</strong>{" "}
          (Foreign Account Tax Compliance Act), que funciona mediante acuerdos bilaterales (IGA) y es, en gran
          medida, <strong className="text-foreground">no recíproco</strong>: EE.UU. está diseñado para{" "}
          <em>recibir</em> información del mundo sobre sus contribuyentes, pero por lo general{" "}
          <strong className="text-foreground">no devuelve</strong> a otros países el mismo nivel de detalle sobre
          las cuentas que sus residentes tienen en suelo estadounidense.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Argentina y EE.UU. firmaron un acuerdo FATCA (IGA Modelo 1) en{" "}
          <strong className="text-foreground">diciembre de 2022</strong>, con vigencia desde 2023; el{" "}
          <strong className="text-foreground">primer intercambio efectivo</strong> hacia la administración fiscal
          argentina ocurrió en <strong className="text-foreground">septiembre de 2024</strong> (con datos de 2023).
          Pero ese flujo es <strong className="text-foreground">asimétrico</strong>: lo que EE.UU. manda a
          Argentina se limita esencialmente a <strong className="text-foreground">rentas de fuente
          estadounidense</strong> (intereses de depósitos, dividendos de origen EE.UU.) por encima de cierto
          umbral, y <strong className="text-foreground">excluye</strong> saldos de cuenta, movimientos y detalle de
          transacciones.
        </p>

        <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-hidden shadow-sm mt-5">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">&nbsp;</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">CRS 2.0 (OCDE)</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">FATCA (EE.UU.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Tipo</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Multilateral (100+ países)</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Bilateral (acuerdos IGA)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">¿Recíproco con Argentina?</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Sí, entre países adheridos</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">En gran medida, no</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">¿Reporta saldos?</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Sí, saldo al cierre</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">En general no hacia Argentina</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Qué llega a ARCA</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  Identificación + saldo + rentas/movimientos
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  Sobre todo rentas de fuente EE.UU. sobre cierto umbral
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Conclusión: una cuenta en una entidad <strong className="text-foreground">estadounidense</strong> se rige
          por FATCA (poco detalle hacia Argentina); una cuenta en una entidad de la{" "}
          <strong className="text-foreground">UE o el Reino Unido</strong> se rige por CRS (detalle amplio hacia
          ARCA). Por eso lo que define todo no es la marca, sino la jurisdicción.
        </p>
      </section>

      {/* Plataformas */}
      <section className="mb-12">
        <h2 id="plataformas" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          ¿Wise, Payoneer y PayPal reportan a ARCA?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          La respuesta honesta es: <strong className="text-foreground">depende de la entidad legal que figura en
          tu cuenta</strong>, no del nombre de la app. Muchas de estas plataformas son grupos globales con varias
          sociedades en distintos países. La que aparece en tus <em>Términos y Condiciones</em> (la que
          efectivamente te abrió la cuenta) es la que determina el régimen:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <h3 className="font-bold text-base">Entidad de la UE / Reino Unido → CRS</h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Si tu cuenta la contrató una sociedad domiciliada en la Unión Europea o el Reino Unido (jurisdicciones
              CRS), esa cuenta queda <strong className="text-foreground">dentro del alcance del CRS 2.0</strong> y
              puede reportarse a ARCA con identificación, saldo y rentas.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-800/30 p-5">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85" />
              </svg>
              <h3 className="font-bold text-base">Entidad de EE.UU. → FATCA</h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Si tu cuenta la contrató una sociedad estadounidense, esa cuenta se rige por{" "}
              <strong className="text-foreground">FATCA</strong>, que (al ser poco recíproco) en general{" "}
              <strong className="text-foreground">no manda a ARCA</strong> tus saldos ni movimientos, salvo rentas
              puntuales de fuente EE.UU.
            </p>
          </div>
        </div>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Llevado a las plataformas concretas, y siendo claros con la incertidumbre:
        </p>
        <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 list-disc pl-6 mb-4">
          <li>
            <strong className="text-foreground">Wise:</strong> opera bajo licencias europeas / del Reino Unido. Las
            cuentas contratadas a través de esas entidades caerían bajo CRS. (Las fuentes difieren sobre la entidad
            exacta, UK o europea.)
          </li>
          <li>
            <strong className="text-foreground">Payoneer:</strong> grupo con entidades en distintas jurisdicciones.
            Según la fuente, se cita Irlanda o incluso otras sedes; la entidad concreta que te contrata define si
            reporta vía CRS. <strong className="text-foreground">No asumas que sí o que no sin chequear tus T&amp;C.</strong>
          </li>
          <li>
            <strong className="text-foreground">PayPal:</strong> estructura híbrida (entidades en EE.UU. y en la
            UE). Que reporte vía CRS depende de qué entidad del grupo te brinda el servicio y el producto puntual.
          </li>
          <li>
            <strong className="text-foreground">Deel, Wallbit, Coinbase u otras de base EE.UU.:</strong> al ser
            estadounidenses se rigen por FATCA, no por CRS. Esto <em>no</em> significa que tus ingresos sean
            invisibles: significa que el canal de reporte automático a ARCA es distinto (y más limitado).
          </li>
        </ul>
        <div className="rounded-2xl border border-rose-200 dark:border-rose-800/40 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 p-5">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-foreground">Importante:</strong> el mapeo &ldquo;plataforma → país&rdquo; cambia
            con el tiempo y entre fuentes. El dato confiable es <strong className="text-foreground">tu</strong>{" "}
            contrato: revisá en los Términos y Condiciones qué sociedad te abrió la cuenta y en qué país está
            constituida. Ese país es el que define el régimen. Si te interesa comparar plataformas para cobrar del
            exterior, mirá la guía de{" "}
            <Link
              href="/monotributo/wise-vs-payoneer-vs-deel"
              className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
            >
              Wise vs Payoneer vs Deel
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Qué hacer */}
      <section className="mb-12">
        <h2 id="que-hacer" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4">
          Qué te conviene hacer (sin pánico)
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          El CRS 2.0 no inventa impuestos nuevos: hace más visible lo que ya tenés que declarar. La movida
          inteligente es de <strong className="text-foreground">cumplimiento</strong>, no de esconder:
        </p>
        <ul className="space-y-3 text-base text-slate-700 dark:text-slate-300 list-disc pl-6 mb-4">
          <li>
            <strong className="text-foreground">Declarás bien tus ingresos del exterior.</strong> Si sos
            monotributista y exportás servicios, esos cobros suman al tope de tu categoría. Repasá cómo se factura
            con la{" "}
            <Link
              href="/monotributo/factura-e"
              className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
            >
              factura E
            </Link>{" "}
            y cómo{" "}
            <Link
              href="/monotributo/declarar-ingresos-exterior"
              className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
            >
              declarar ingresos del exterior
            </Link>
            .
          </li>
          <li>
            <strong className="text-foreground">Guardás los respaldos.</strong> Comprobantes de cobro,
            transferencias, contratos. Si el saldo informado por una plataforma no coincide con lo que declaraste,
            poder explicar la diferencia te ahorra dolores de cabeza.
          </li>
          <li>
            <strong className="text-foreground">Sabés en qué entidad está cada cuenta.</strong> Conocer la
            jurisdicción de tus billeteras te dice qué se reporta y qué no. Mirá también cómo{" "}
            <Link
              href="/monotributo/cobrar-del-exterior"
              className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
            >
              cobrar del exterior
            </Link>{" "}
            de forma prolija.
          </li>
          <li>
            <strong className="text-foreground">Consultás con un contador</strong> si tenés saldos altos en el
            exterior, cripto, o una situación que no encaja en el monotributo simple. La normativa cambia seguido.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          ¿Todavía te confunde el cambio de organismo? Repasá{" "}
          <Link
            href="/monotributo/arca-vs-afip"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            por qué AFIP ahora es ARCA
          </Link>
          .
        </p>
      </section>

      <RelatedGuides currentHref="/monotributo/crs-arca" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={crsArcaFaqEntries} />
      </section>
    </div>
  );
}
