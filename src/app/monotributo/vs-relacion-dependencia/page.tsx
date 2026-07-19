import type { Metadata } from "next";
import Link from "next/link";

import { NativeAd } from "@/components/ads/NativeAd";
import { TrackedGuideCtaLink } from "@/components/monotributo/TrackedGuideCtaLink";
import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_YEAR } from "@/data/monotributo-categorias";
import { getGuideDateModified, vsRelacionDependenciaFaqEntries } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

export const metadata: Metadata = {
  title: `Monotributo vs Relación de Dependencia ${MONOTRIBUTO_YEAR} — Diferencias, aportes y derechos`,
  description:
    `Diferencias entre Monotributo y relación de dependencia en Argentina ${MONOTRIBUTO_YEAR}: aportes, aguinaldo, vacaciones, ART, jubilación, obra social, si se pueden tener los dos y la relación de dependencia encubierta tras la Ley 27.802.`,
  keywords: [
    "monotributo vs relacion de dependencia",
    "diferencia monotributo empleado",
    "monotributo o empleado en blanco",
    "relacion de dependencia encubierta monotributo",
    `monotributo y empleado a la vez ${MONOTRIBUTO_YEAR}`,
    "que conviene monotributo o relacion de dependencia",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/vs-relacion-dependencia` },
  openGraph: {
    title: `Monotributo vs Relación de Dependencia ${MONOTRIBUTO_YEAR}`,
    description:
      "Aportes, aguinaldo, vacaciones, ART, jubilación y obra social: qué tenés en cada caso y cuándo conviene cada uno.",
    type: "article",
    url: `${siteUrl}/monotributo/vs-relacion-dependencia`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/vs-relacion-dependencia.png",
        width: 1200,
        height: 630,
        alt: "Monotributo vs Relación de Dependencia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/vs-relacion-dependencia.png"],
    title: `Monotributo vs Relación de Dependencia ${MONOTRIBUTO_YEAR}`,
    description:
      "Aportes, aguinaldo, vacaciones, ART, jubilación y obra social: qué tenés en cada caso y cuándo conviene cada uno.",
  },
};

const comparison = [
  {
    label: "Vínculo legal",
    mono: "No hay relación laboral: prestás un servicio y emitís factura. Te regís por las normas tributarias (Monotributo) y el Código Civil y Comercial.",
    rd: "Contrato de trabajo bajo la Ley de Contrato de Trabajo (Ley 20.744). Hay subordinación: el empleador dirige, vos cumplís horario y tareas.",
  },
  {
    label: "Quién paga los aportes",
    mono: "Vos pagás toda la cuota mensual de tu bolsillo: impuesto integrado + aporte jubilatorio (SIPA) + obra social.",
    rd: "El empleador te paga el sueldo, te retiene los aportes del bruto y, además, abona contribuciones patronales que vos no ves.",
  },
  {
    label: "Aguinaldo (SAC)",
    mono: "No corresponde. Solo facturás lo que trabajás.",
    rd: "Sí: medio sueldo extra al año, pagado en dos cuotas (junio y diciembre).",
  },
  {
    label: "Vacaciones y licencias pagas",
    mono: "No tenés vacaciones pagas ni licencias con goce de sueldo. Si no trabajás, no facturás.",
    rd: "Vacaciones pagas, licencia por enfermedad, maternidad, paternidad, etc., con goce de sueldo.",
  },
  {
    label: "Cobertura ante accidentes (ART)",
    mono: "No tenés ART. Conviene contratar un seguro por tu cuenta.",
    rd: "El empleador contrata ART (Ley 24.557), que cubre accidentes y enfermedades laborales.",
  },
  {
    label: "Indemnización y estabilidad",
    mono: "Sin indemnización por despido, sin preaviso, sin seguro de desempleo.",
    rd: "Indemnización por despido sin causa, preaviso y seguro de desempleo.",
  },
  {
    label: "Obra social",
    mono: "Una obra social incluida en la cuota. Sumar familiares cuesta un adicional por integrante.",
    rd: "Grupo familiar primario incluido, aportes mayores y, en general, mejor cobertura efectiva.",
  },
  {
    label: "Jubilación",
    mono: "Aporte fijo y bajo: solés acceder al haber mínimo.",
    rd: "Aporte calculado sobre la remuneración: solés obtener un haber mayor.",
  },
  {
    label: "Flexibilidad",
    mono: "Podés tener varios clientes, manejar tus horarios y, muchas veces, mayor ingreso neto.",
    rd: "Subordinación, horario fijo y un solo empleador, pero con red de protección completa.",
  },
];

export default function VsRelacionDependenciaPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Monotributo vs Relación de Dependencia" },
        ]}
      />

      {/* Respuesta directa para snippet / People Also Ask */}
      <p
        id="respuesta-directa"
        className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-8 -mt-1"
      >
        <strong className="text-foreground">Respuesta directa.</strong> El{" "}
        <Link href="/monotributo" className="text-primary hover:underline">
          Monotributo
        </Link>{" "}
        es un régimen tributario: facturás por tu cuenta y pagás vos toda la cuota mensual (impuesto, jubilación
        y obra social). La <strong className="text-foreground">relación de dependencia</strong> es un contrato
        de trabajo: el empleador te paga el sueldo, te retiene los aportes y aporta contribuciones, y vos tenés
        aguinaldo, vacaciones, ART, indemnización y demás derechos laborales. El monotributista gana flexibilidad
        y, a veces, más ingreso de bolsillo; el empleado gana estabilidad y protección. Se pueden tener los dos a
        la vez (empleado por un lado, monotributista por otra actividad).
      </p>

      <ArticleHero
        image="/og/vs-relacion-dependencia.png"
        imageAlt="Monotributo vs Relación de Dependencia"
        badgeLabel={`Comparativa ${MONOTRIBUTO_YEAR}`}
        title={<>Monotributo vs Relación de Dependencia {MONOTRIBUTO_YEAR}</>}
        description={
          <>
            Son dos formas muy distintas de trabajar en Argentina. El{" "}
            <strong className="text-white">Monotributo</strong> es un régimen tributario donde facturás por tu
            cuenta; la <strong className="text-white">relación de dependencia</strong> es un contrato laboral con
            sueldo, aportes y todos los derechos de la Ley de Contrato de Trabajo.
          </>
        }
        dateModified={dateModified}
        readingTime="8 min de lectura"
      />

      {/* Resumen */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-6">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-xs uppercase tracking-wide font-semibold">Monotributo</p>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Trabajás por tu cuenta</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
            Emitís factura y pagás una cuota mensual única que incluye impuesto, jubilación y obra social. Todo
            corre por tu cuenta, pero ganás flexibilidad.
          </p>
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
            <li>Varios clientes y horarios propios</li>
            <li>A menudo más ingreso de bolsillo</li>
            <li>Sin aguinaldo, vacaciones ni indemnización</li>
            <li>Pagás vos toda la cuota</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" />
            </svg>
            <p className="text-xs uppercase tracking-wide font-semibold">Relación de dependencia</p>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Empleado en blanco</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
            Tenés un contrato bajo la Ley 20.744. El empleador te paga el sueldo, retiene tus aportes y abona
            contribuciones. Ganás estabilidad y la red de protección laboral completa.
          </p>
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
            <li>Aguinaldo, vacaciones y licencias pagas</li>
            <li>ART e indemnización por despido</li>
            <li>Obra social con grupo familiar</li>
            <li>Subordinación y horario fijo</li>
          </ul>
        </div>
      </section>

      {/* Qué es cada uno */}
      <section className="mb-12">
        <h2
          id="que-es-cada-uno"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Qué es cada uno
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          El <strong className="text-foreground">Monotributo</strong> es un régimen tributario simplificado.
          Quien está inscripto factura sus servicios o ventas y paga una{" "}
          <strong className="text-foreground">cuota mensual única</strong> que reúne tres componentes: el impuesto
          integrado, el aporte jubilatorio al SIPA y el aporte a la obra social. No hay empleador detrás: el
          monotributista trabaja por su cuenta y la cuota la paga íntegramente de su bolsillo. Si querés ver cómo
          se arma la cuota y en qué categoría caés según lo que facturás, mirá la{" "}
          <Link href="/monotributo" className="text-primary hover:underline">
            tabla de Monotributo vigente
          </Link>{" "}
          o usá la{" "}
          <TrackedGuideCtaLink
            href="/calculadora-monotributo"
            target="calculadora"
            guide="vs-relacion-dependencia"
            className="text-primary hover:underline"
          >
            calculadora de categoría
          </TrackedGuideCtaLink>
          .
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          La <strong className="text-foreground">relación de dependencia</strong> es un contrato de trabajo
          regido por la Ley de Contrato de Trabajo (Ley 20.744). Hay un empleador que dirige la tarea y un
          trabajador subordinado que cumple un horario. El empleador paga el sueldo, le{" "}
          <strong className="text-foreground">retiene los aportes</strong> al trabajador y, por encima de eso,
          abona <strong className="text-foreground">contribuciones patronales</strong> que el empleado no ve en su
          recibo. A cambio de esa subordinación, el trabajador accede a toda la red de protección laboral.
        </p>
      </section>

      {/* Tabla comparativa */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Tabla comparativa</h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:bg-background shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground w-1/4">Tema</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Monotributo</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Relación de dependencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparison.map((row) => (
                <tr key={row.label} className="align-top">
                  <td className="px-4 py-3 font-semibold text-foreground">{row.label}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.mono}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.rd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ad mid-content (native, responsive) */}
      <NativeAd className="my-12" />

      {/* Qué pagás en cada caso */}
      <section className="mb-12">
        <h2
          id="que-pagas"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Qué pagás (y quién lo paga) en cada caso
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Acá está la diferencia más importante para el bolsillo. Como{" "}
          <strong className="text-foreground">monotributista</strong>, la cuota mensual la pagás vos entera: el
          impuesto integrado, el aporte jubilatorio y la obra social salen de lo que facturás.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          En <strong className="text-foreground">relación de dependencia</strong> el esquema es muy distinto. Al
          empleado se le descuenta del sueldo bruto un porcentaje en concepto de aportes (en general en torno al
          17%: jubilación, PAMI/INSSJP y obra social). Pero además el{" "}
          <strong className="text-foreground">empleador</strong> paga aparte las contribuciones patronales —del
          orden del 24% al 26%, o menos con beneficios para MiPyMEs— que el trabajador no ve en su recibo. Es
          decir: en el empleo hay un tercero (el empleador) cargando con buena parte del costo previsional,
          mientras que el monotributista lo afronta solo.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Los porcentajes y los montos cambian. Verificá los valores vigentes a {MONOTRIBUTO_YEAR} en la{" "}
          <Link href="/monotributo" className="text-primary hover:underline">
            tabla de Monotributo
          </Link>{" "}
          y, para tu actividad independiente, simulá la cuota con la{" "}
          <TrackedGuideCtaLink
            href="/calculadora-monotributo"
            target="calculadora"
            guide="vs-relacion-dependencia"
            className="text-primary hover:underline"
          >
            calculadora
          </TrackedGuideCtaLink>
          .
        </p>
      </section>

      {/* Derechos del empleado */}
      <section className="mb-12">
        <h2
          id="derechos-empleado"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Qué tenés como empleado y no como monotributista
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          La relación de dependencia trae una serie de derechos laborales que el monotributista{" "}
          <strong className="text-foreground">no tiene</strong>:
        </p>
        <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 list-disc pl-5 mb-4">
          <li>
            <strong className="text-foreground">Aguinaldo (SAC):</strong> medio sueldo extra por año, pagado en
            dos cuotas (junio y diciembre).
          </li>
          <li>
            <strong className="text-foreground">Vacaciones pagas</strong> y licencias por enfermedad, maternidad
            y paternidad con goce de sueldo.
          </li>
          <li>
            <strong className="text-foreground">ART</strong> (Ley 24.557), que cubre accidentes y enfermedades
            laborales.
          </li>
          <li>
            <strong className="text-foreground">Indemnización por despido</strong>, preaviso y seguro de
            desempleo.
          </li>
          <li>
            Asignaciones familiares del régimen contributivo.
          </li>
        </ul>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          El monotributista sí puede percibir asignaciones familiares de ANSES según su categoría, pero suelen ser
          más acotadas. Si no trabajás (por enfermedad, vacaciones o falta de clientes), tampoco facturás: no hay
          sueldo garantizado.
        </p>
      </section>

      {/* Jubilación */}
      <section className="mb-12">
        <h2
          id="jubilacion"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Jubilación: cómo cambia el haber futuro
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          En ambos casos hacés aportes jubilatorios y, para jubilarte por el régimen general, necesitás reunir{" "}
          <strong className="text-foreground">30 años de aportes</strong> más la edad mínima (60 años las mujeres
          y 65 los varones). La gran diferencia está en el monto del aporte y, por lo tanto, en el haber futuro:
        </p>
        <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 list-disc pl-5 mb-4">
          <li>
            El <strong className="text-foreground">monotributista</strong> aporta un monto fijo y bajo, por lo que
            en general accede solo al <strong className="text-foreground">haber mínimo</strong>.
          </li>
          <li>
            El <strong className="text-foreground">empleado</strong> aporta sobre su remuneración, así que suele
            alcanzar un haber mayor.
          </li>
        </ul>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Un punto a tener presente a {MONOTRIBUTO_YEAR}: la moratoria previsional amplia (Ley 27.705) caducó.
          Quien no llega a los 30 años de aportes puede quedar fuera de la jubilación común y caer en la PUAM
          (Pensión Universal para el Adulto Mayor), que paga un porcentaje del haber mínimo. Los montos cambian
          seguido: verificá la norma vigente antes de tomar decisiones de largo plazo.
        </p>
      </section>

      {/* Obra social */}
      <section className="mb-12">
        <h2
          id="obra-social"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Obra social y cobertura familiar
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          El Monotributo incluye <strong className="text-foreground">una obra social</strong> dentro de la cuota.
          Sumar al grupo familiar o adherentes tiene un costo adicional por cada integrante. En relación de
          dependencia, el aporte de obra social es mayor, el{" "}
          <strong className="text-foreground">grupo familiar primario suele quedar incluido</strong> y, en la
          práctica, la cobertura efectiva tiende a ser mejor. Si tenés familia a cargo, es un factor importante a
          la hora de comparar.
        </p>
      </section>

      {/* Se pueden tener los dos */}
      <section className="mb-12">
        <h2
          id="los-dos"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Se pueden tener los dos a la vez?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Sí. Podés ser <strong className="text-foreground">empleado en relación de dependencia</strong> por un
          trabajo y, al mismo tiempo, <strong className="text-foreground">monotributista</strong> por otra
          actividad independiente. Es una situación habitual y totalmente legal.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          En ese caso, según ARCA, &ldquo;solo pagás el componente impositivo, porque a tu empleador le
          corresponde abonar los aportes jubilatorios y de obra social&rdquo;. Dicho de otro modo: como ya
          tenés cubiertos la jubilación y la obra social por el empleo,{" "}
          <strong className="text-foreground">no pagás esos dos componentes del Monotributo</strong>, sino
          únicamente el impuesto integrado de tu actividad por cuenta propia.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          La categoría del Monotributo en este caso se determina solo por la{" "}
          <strong className="text-foreground">facturación de la actividad independiente</strong>, no por el
          sueldo. Para ver en qué categoría caés según lo que facturás aparte, usá la{" "}
          <TrackedGuideCtaLink
            href="/calculadora-monotributo"
            target="calculadora"
            guide="vs-relacion-dependencia"
            className="text-primary hover:underline"
          >
            calculadora de categoría
          </TrackedGuideCtaLink>
          .
        </p>
      </section>

      {/* Relación de dependencia encubierta */}
      <section className="mb-12">
        <h2
          id="encubierta"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Relación de dependencia encubierta y la Ley 27.802
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Existe un caso gris muy común: el del{" "}
          <strong className="text-foreground">monotributista que en los hechos trabaja como empleado</strong>.
          Suele darse cuando hay un solo cliente, subordinación, horario impuesto y se usan las herramientas o el
          lugar del &ldquo;empleador&rdquo;. Cuando la realidad es una relación laboral disfrazada de
          facturación, se habla de relación de dependencia encubierta o &ldquo;fraude laboral&rdquo;.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Hay un cambio relevante a tener en cuenta a {MONOTRIBUTO_YEAR}: la{" "}
          <strong className="text-foreground">Ley 27.802 de Modernización Laboral</strong> (publicada en el
          Boletín Oficial el 6 de marzo de 2026) reformó el artículo 23 de la Ley de Contrato de Trabajo. Con la
          nueva redacción, la presunción de contrato de trabajo exige que exista una verdadera situación de
          dependencia y, en particular, <strong className="text-foreground">no opera</strong> cuando se contratan
          servicios profesionales u oficios sin relación de dependencia, se emiten facturas y se cobra por medios
          bancarios. En la práctica, un monotributista que factura formalmente y cobra por transferencia ya no se
          presume empleado de forma automática.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Ahora bien, esto hay que tomarlo con cautela: la protección{" "}
          <strong className="text-foreground">no es absoluta</strong>, la norma es muy reciente, todavía no hay
          jurisprudencia consolidada y el análisis sigue siendo caso por caso. Si igualmente se prueba que hubo
          encubrimiento de una relación laboral, las consecuencias para quien contrató son fuertes: indemnización,
          preaviso, salarios adeudados, vacaciones, aguinaldo, multas y los certificados del artículo 80 de la
          LCT.
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Como esto puede cambiar rápido y depende de cómo lo apliquen los tribunales, verificá la norma vigente y,
          ante una duda concreta, consultá con un profesional. Si querés ordenar tu situación frente al fisco,
          puede ayudarte la guía de{" "}
          <Link href="/monotributo/vs-responsable-inscripto" className="text-primary hover:underline">
            Monotributo vs Responsable Inscripto
          </Link>
          .
        </p>
      </section>

      {/* Cuándo conviene cada uno */}
      <section className="mb-12">
        <h2
          id="cuando-conviene"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Cuándo conviene cada uno?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/30 dark:to-green-950/30 p-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Conviene el Monotributo si…</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
              <li>Tenés (o querés) varios clientes y manejar tus horarios.</li>
              <li>Valorás la flexibilidad y, a menudo, un mayor ingreso de bolsillo.</li>
              <li>Podés afrontar vos las vacaciones, las licencias y los imprevistos.</li>
              <li>Tu actividad es genuinamente independiente, no un empleo disfrazado.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 p-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Conviene la relación de dependencia si…</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
              <li>Priorizás estabilidad, indemnización y seguro de desempleo.</li>
              <li>Querés aguinaldo, vacaciones pagas y licencias con goce de sueldo.</li>
              <li>Tenés familia a cargo y te interesa una mejor obra social.</li>
              <li>Buscás un haber jubilatorio mayor a futuro.</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
          Son criterios orientativos. Muchas veces la mejor opción combina ambos: empleo en blanco más una
          actividad independiente como monotributista.
        </p>
      </section>

      <RelatedGuides currentHref="/monotributo/vs-relacion-dependencia" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={vsRelacionDependenciaFaqEntries} />
      </section>

      {/* Cierre: no es asesoramiento */}
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-border pt-6">
        Esta guía es informativa y refleja la normativa vigente a {MONOTRIBUTO_YEAR}; no constituye asesoramiento
        legal, contable ni impositivo. Los aportes, los porcentajes, los montos jubilatorios y las normas
        laborales cambian con frecuencia (la cuota del Monotributo se actualiza dos veces al año y la Ley 27.802
        es muy reciente). Verificá siempre los valores y las normas vigentes y, ante una situación concreta,
        consultá con un contador o abogado matriculado.
      </p>
    </div>
  );
}
