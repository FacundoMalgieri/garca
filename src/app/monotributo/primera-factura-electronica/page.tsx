import type { Metadata } from "next";
import Link from "next/link";

import { NativeAd } from "@/components/ads/NativeAd";
import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGuides } from "@/components/ui/RelatedGuides";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { TableOfContents, type TocItem } from "@/components/ui/TableOfContents";
import { MONOTRIBUTO_YEAR } from "@/data/monotributo-categorias";
import { getGuideDateModified, primeraFacturaElectronicaFaqEntries } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = getGuideDateModified();

const tocItems: readonly TocItem[] = [
  { id: "requisitos-previos", label: "Requisitos previos" },
  { id: "alta-punto-de-venta", label: "Alta del punto de venta" },
  { id: "que-comprobante-emito", label: "¿Qué comprobante emito?" },
  { id: "paso-a-paso", label: "Paso a paso en Comprobantes en Línea" },
  { id: "que-es-el-cae", label: "Qué es el CAE" },
  { id: "facturador-alternativa", label: "Facturador y Facturador Móvil" },
  { id: "errores-comunes", label: "Errores y dudas comunes" },
];

export const metadata: Metadata = {
  title: `Mi primera factura electrónica en el Monotributo (${MONOTRIBUTO_YEAR}) — Guía paso a paso ARCA`,
  description:
    "Cómo emitir tu primera factura electrónica siendo monotributista en ARCA: requisitos de clave fiscal, alta del punto de venta, qué comprobante elegir y el paso a paso en Comprobantes en Línea con CAE.",
  keywords: [
    "primera factura electrónica",
    "primera factura monotributo",
    "cómo hacer mi primera factura",
    "comprobantes en línea arca",
    "alta punto de venta arca",
    "factura electrónica monotributo paso a paso",
    "cae arca",
    "facturador móvil arca",
  ],
  alternates: { canonical: `${siteUrl}/monotributo/primera-factura-electronica` },
  openGraph: {
    title: `Mi primera factura electrónica en el Monotributo (${MONOTRIBUTO_YEAR})`,
    description:
      "Requisitos, alta del punto de venta y el paso a paso completo para emitir tu primera factura electrónica en ARCA con CAE.",
    type: "article",
    url: `${siteUrl}/monotributo/primera-factura-electronica`,
    siteName: "GARCA",
    images: [
      {
        url: "/og/primera-factura-electronica.png",
        width: 1200,
        height: 630,
        alt: "Primera factura electrónica del Monotributo en ARCA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/primera-factura-electronica.png"],
    title: "Mi primera factura electrónica en el Monotributo",
    description: "Requisitos, alta del punto de venta y paso a paso en ARCA para emitir tu primera factura con CAE.",
  },
};

export default function PrimeraFacturaElectronicaPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías", href: "/guias" },
          { label: "Primera factura electrónica" },
        ]}
      />

      {/* Respuesta directa para snippet / People Also Ask */}
      <p
        id="respuesta-directa"
        className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-8 -mt-1"
      >
        <strong className="text-foreground">Respuesta directa:</strong> para emitir tu primera factura
        electrónica como monotributista necesitás{" "}
        <strong className="text-foreground">clave fiscal nivel 3</strong>, tener habilitados los servicios{" "}
        <strong className="text-foreground">Comprobantes en Línea</strong> y{" "}
        <strong className="text-foreground">Administración de Puntos de Venta y Domicilios</strong>, y{" "}
        <strong className="text-foreground">dar de alta un punto de venta</strong>. Después entrás a Comprobantes
        en Línea, elegís{" "}
        <Link
          href="/monotributo/factura-c"
          className="text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Factura C
        </Link>
        , cargás los datos y ARCA te devuelve el comprobante con su CAE.
      </p>

      <ArticleHero
        image="/og/primera-factura-electronica.png"
        imageAlt="Primera factura electrónica del Monotributo en ARCA"
        badgeLabel="Facturación"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title={<>Mi primera factura electrónica en el Monotributo ({MONOTRIBUTO_YEAR})</>}
        description={
          <>
            Una guía sin vueltas para emitir tu{" "}
            <strong className="text-white">primera factura electrónica</strong> en ARCA: qué necesitás antes de
            empezar, cómo dar de alta el <strong className="text-white">punto de venta</strong> y el paso a paso
            completo en Comprobantes en Línea hasta obtener el CAE.
          </>
        }
        dateModified={dateModified}
        readingTime="7 min de lectura"
      />

      <TableOfContents items={tocItems} className="mb-10" />

      {/* Requisitos previos */}
      <section className="mb-12">
        <h2
          id="requisitos-previos"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Requisitos previos: lo que tenés que tener listo
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Antes de generar tu primera factura, asegurate de cumplir con estos requisitos. Si te falta alguno, el
          sistema no te va a dejar emitir o directamente no vas a ver el servicio que necesitás.
        </p>
        <ul className="space-y-3 text-base text-slate-700 dark:text-slate-300">
          {[
            {
              title: "CUIT activo e inscripción en el Monotributo",
              body: "Tenés que estar inscripto en el Régimen Simplificado (Monotributo) con tu CUIT activo. La inscripción es lo que define que vas a emitir Factura C.",
            },
            {
              title: "Clave fiscal nivel de seguridad 3",
              body: "No alcanza con el nivel 2. El nivel 3 se obtiene por validación biométrica desde la app móvil de ARCA (foto del DNI y selfie) o de forma presencial en una dependencia. Sin nivel 3 no podés operar Comprobantes en Línea.",
            },
            {
              title: "Servicio 'Comprobantes en Línea' habilitado",
              body: "Es el servicio con el que vas a emitir. Se agrega a tu clave fiscal desde el 'Administrador de Relaciones de Clave Fiscal'.",
            },
            {
              title: "Servicio 'Administración de Puntos de Venta y Domicilios'",
              body: "Es donde vas a dar de alta el punto de venta. También se incorpora desde el Administrador de Relaciones.",
            },
            {
              title: "Domicilio Fiscal Electrónico constituido",
              body: "Es obligatorio. Es la 'casilla' donde ARCA te notifica. Si no lo constituiste, te lo va a pedir al ingresar.",
            },
          ].map((item) => (
            <li key={item.title} className="rounded-2xl border border-border bg-white dark:bg-background p-4">
              <p className="font-bold text-foreground mb-1">{item.title}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Alta del punto de venta */}
      <section className="mb-12">
        <h2
          id="alta-punto-de-venta"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Alta del punto de venta
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          El <strong className="text-foreground">punto de venta</strong> es un número de 5 dígitos, correlativo,
          que arranca en <strong className="text-foreground">00001</strong> e identifica desde dónde emitís. Sin un
          punto de venta dado de alta no vas a poder facturar.
        </p>
        <ol className="list-decimal list-inside space-y-3 text-base text-slate-700 dark:text-slate-300 mb-4">
          <li>
            Entrá al servicio{" "}
            <strong className="text-foreground">Administración de Puntos de Venta y Domicilios</strong>.
          </li>
          <li>
            Andá a <strong className="text-foreground">A/B/M de puntos de venta</strong> y elegí{" "}
            <strong className="text-foreground">Alta</strong>.
          </li>
          <li>
            Para emitir desde Comprobantes en Línea, seleccioná el sistema{" "}
            <strong className="text-foreground">Factura en Línea – Monotributo</strong> (no &quot;Web
            Service&quot;).
          </li>
          <li>
            Asociá un <strong className="text-foreground">domicilio</strong>, que tiene que estar dado de alta
            previamente en el Sistema Registral.
          </li>
        </ol>
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 p-5">
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <strong className="text-foreground">Importante:</strong> cada método de facturación necesita un punto
            de venta <strong className="text-foreground">distinto</strong>. El de Comprobantes en Línea no sirve
            para Web Service ni para el Facturador Móvil. Si más adelante usás otra herramienta, vas a tener que
            dar de alta un punto de venta nuevo para ese método.
          </p>
        </div>
      </section>

      {/* Qué comprobante */}
      <section className="mb-12">
        <h2
          id="que-comprobante-emito"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          ¿Qué comprobante emito siendo monotributista?
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Como monotributista emitís{" "}
          <Link
            href="/monotributo/factura-c"
            className="text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Factura C
          </Link>
          . No discrimina IVA: el importe que ves es el total final que cobrás, porque tu componente impositivo ya
          va incluido en la cuota mensual del Monotributo. La única excepción es la{" "}
          <strong className="text-foreground">exportación</strong> (clientes del exterior), que se factura con{" "}
          <Link
            href="/monotributo/factura-e"
            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold underline-offset-2"
          >
            Factura E
          </Link>{" "}
          y requiere un punto de venta de &quot;Comprobantes de exportación&quot;.
        </p>
        <div className="rounded-2xl border border-border bg-white dark:bg-background overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Comprobante</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Quién a quién</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">IVA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Factura A</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">RI a RI</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Discriminado</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">Factura B</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">RI a consumidor final / monotributista</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">No discriminado</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-sky-700 dark:text-sky-300">Factura C</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Monotributistas y exentos</td>
                <td className="px-4 py-3 font-semibold text-sky-700 dark:text-sky-300">Sin IVA</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
          Para profundizar en la diferencia entre C y E mirá{" "}
          <Link
            href="/monotributo/factura-c-vs-factura-e"
            className="text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Factura C vs Factura E
          </Link>
          .
        </p>
      </section>

      {/* Ad mid-content */}
      <NativeAd className="my-12" />

      {/* Paso a paso */}
      <section className="mb-12">
        <h2
          id="paso-a-paso"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Paso a paso en Comprobantes en Línea
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Con los requisitos cumplidos y el punto de venta dado de alta, ya podés generar tu primera factura.
          Estos son los pasos dentro del servicio Comprobantes en Línea:
        </p>
        <ol className="space-y-4">
          {[
            {
              title: "Ingresá con CUIT y clave fiscal",
              body: "Entrá al servicio Comprobantes en Línea y elegí la empresa (tu CUIT) con la que vas a emitir.",
            },
            {
              title: "Confirmá los datos del emisor (solo la primera vez)",
              body: "La primera vez que entrás, el sistema te pide revisar y confirmar tus datos como emisor (domicilio, condición frente al IVA, etc.).",
            },
            {
              title: "Generar Comprobantes",
              body: "Elegí 'Generar Comprobantes', seleccioná tu punto de venta y el tipo de comprobante: Factura C.",
            },
            {
              title: "Fecha y concepto",
              body: "Cargá la fecha del comprobante y el concepto: Productos, Servicios, o Productos y Servicios. Si incluís Servicios, el sistema te pide el período facturado (desde / hasta).",
            },
            {
              title: "Datos del receptor",
              body: "Ingresá CUIT, CUIL o DNI del cliente. Si el CUIT es válido, ARCA autocompleta los datos desde el padrón.",
            },
            {
              title: "Condición frente al IVA del receptor (obligatorio)",
              body: "Desde el 01/07/2025 (RG 5616/2024) es un campo obligatorio. Tenés que indicar la condición del cliente: IVA Responsable Inscripto, Responsable Monotributo, IVA Sujeto Exento, Consumidor Final, etc.",
            },
            {
              title: "Detalle de lo que facturás",
              body: "Cargá descripción, cantidad y precio unitario. En la Factura C el importe es total, sin discriminar IVA.",
            },
            {
              title: "Condición de venta / forma de pago",
              body: "Indicá cómo cobrás: contado, tarjeta, transferencia, etc.",
            },
            {
              title: "Confirmá y generá el comprobante",
              body: "Al confirmar, ARCA muestra 'Comprobante Generado' con el CAE y su fecha de vencimiento. Una vez confirmado, el comprobante NO se modifica. Descargá el PDF con el CAE para entregárselo a tu cliente.",
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

      {/* CAE */}
      <section className="mb-12">
        <h2
          id="que-es-el-cae"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Qué es el CAE
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          El <strong className="text-foreground">CAE (Código de Autorización Electrónico)</strong> es el código
          que ARCA le asigna a cada comprobante para darle validez fiscal. En palabras del propio organismo: &quot;
          <em>Los comprobantes electrónicos no tendrán efectos fiscales frente a terceros hasta que este Organismo
          otorgue el CAE.</em>&quot;
        </p>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Es decir: una factura sin CAE no vale. Una vez que ARCA te lo asigna, tenés que entregar el comprobante
          al comprador dentro de los <strong className="text-foreground">10 días corridos</strong>.
        </p>
      </section>

      {/* Facturador alternativa */}
      <section className="mb-12">
        <h2
          id="facturador-alternativa"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Facturador y Facturador Móvil: una alternativa más simple
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          Además de Comprobantes en Línea, ARCA ofrece dos herramientas pensadas para emitir más rápido:
        </p>
        <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 list-disc pl-6 mb-3">
          <li>
            El <strong className="text-foreground">Facturador</strong> (web, facturador.afip.gob.ar), que también
            podés instalar como aplicación (PWA).
          </li>
          <li>
            El <strong className="text-foreground">Facturador Móvil</strong>, la app para Android.
          </li>
        </ul>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Desde la RG 5602/2024 el Facturador está habilitado para todos los monotributistas. Son útiles para
          facturar al instante, pero <strong className="text-foreground">no reemplazan</strong> a Comprobantes en
          Línea como vía completa, y recordá que cada uno usa su propio punto de venta.
        </p>
      </section>

      {/* Errores comunes */}
      <section className="mb-12">
        <h2
          id="errores-comunes"
          className="scroll-mt-24 text-2xl md:text-3xl font-bold text-foreground mb-4"
        >
          Errores y dudas comunes
        </h2>
        <ul className="space-y-3 text-base text-slate-700 dark:text-slate-300">
          {[
            {
              title: "Me equivoqué en una factura, ¿la borro?",
              body: "No. Una factura con CAE no se anula ni se borra. Si te equivocaste, la corregís emitiendo una Nota de Crédito C asociada por el mismo importe (idealmente antes del día 10 del mes siguiente) y, si corresponde, emitís la factura correcta.",
            },
            {
              title: "Error: 'No posee puntos de venta...'",
              body: "Significa que no diste de alta un punto de venta para el método que estás usando. Dalo de alta en Administración de Puntos de Venta y Domicilios; el alta puede impactar recién al día siguiente.",
            },
            {
              title: "¿Puedo usar talonario de papel?",
              body: "La factura electrónica es obligatoria. El talonario manual solo vale excepcionalmente como resguardo ante una caída del sistema y con autorización previa.",
            },
            {
              title: "¿Tengo que identificar al consumidor final?",
              body: `Por encima de cierto umbral hay que identificarlo con CUIT o DNI. A ${MONOTRIBUTO_YEAR} ese umbral es de $10.000.000 (RG 5700/2025), pero se actualiza, así que verificá el monto vigente. Si el cliente pide la factura para deducir Ganancias, consignás su CUIT sin importar el monto.`,
            },
          ].map((item) => (
            <li key={item.title} className="rounded-2xl border border-border bg-white dark:bg-background p-4">
              <p className="font-bold text-foreground mb-1">{item.title}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <RelatedGuides currentHref="/monotributo/primera-factura-electronica" className="mb-12" />

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={primeraFacturaElectronicaFaqEntries} />
      </section>

      {/* Aviso informativo */}
      <section className="mb-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Esta guía es informativa y de divulgación, no constituye asesoramiento contable ni legal. Los importes y
          normas pueden cambiar; ante una duda concreta consultá a tu contador o verificá los datos vigentes en el
          sitio oficial de ARCA. Para entender cómo tu facturación impacta en tu categoría, mirá el{" "}
          <Link
            href="/monotributo"
            className="text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80"
          >
            hub de Monotributo
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
