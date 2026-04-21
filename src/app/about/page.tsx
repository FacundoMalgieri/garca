import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const dateModified = MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString().split("T")[0];

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export const metadata: Metadata = {
  title: "Sobre el autor — Quién está detrás de GARCA",
  description:
    "GARCA lo mantiene Facundo Malgieri, software engineer argentino con más de 10 años de experiencia. Herramienta independiente, open source, no afiliada a ARCA.",
  keywords: [
    "quién hizo garca",
    "autor garca",
    "facundo malgieri",
    "sobre garca",
    "monotributo open source",
    "garca argentina",
  ],
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    title: "Sobre el autor — Quién está detrás de GARCA",
    description:
      "Herramienta open source mantenida por Facundo Malgieri, software engineer con 10+ años de experiencia. 100% privada, sin afiliación con ARCA.",
    type: "profile",
    url: `${siteUrl}/about`,
    siteName: "GARCA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre el autor — Quién está detrás de GARCA",
    description:
      "GARCA lo mantiene Facundo Malgieri, software engineer argentino. Open source, privado y sin afiliación con ARCA.",
  },
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Sobre el autor" },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-indigo-950/40 border border-slate-200 dark:border-blue-800/30 p-6 md:p-10 mb-10 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.2)] dark:shadow-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-400/15 to-blue-400/15 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Monogram avatar */}
          <div
            aria-hidden
            className="flex-shrink-0 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/25 ring-4 ring-white/70 dark:ring-slate-900/40"
          >
            FM
          </div>

          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold mb-3 shadow shadow-blue-500/25">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sobre el autor
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Facundo Malgieri
            </h1>
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mb-3">
              Software Engineer · Argentina · 10+ años construyendo productos digitales.
            </p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm">
              <a
                href="https://github.com/FacundoMalgieri"
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.3 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .5z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/facundo-malgieri/"
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8 17v-7H5v7h3zM6.5 8.7a1.7 1.7 0 110-3.4 1.7 1.7 0 010 3.4zM19 17v-3.8c0-2-.4-3.5-2.8-3.5-1.1 0-1.9.6-2.2 1.2V10H11v7h3v-3.5c0-.9.2-1.8 1.3-1.8s1.2 1 1.2 1.8V17h3z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="https://fmalgieri.com"
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.102-1.101m-.758-4.899a4 4 0 015.656 0l3 3a4 4 0 01-.225 5.865" />
                </svg>
                fmalgieri.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quién soy */}
      <section className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Quién soy
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-slate-700 dark:text-slate-300">
          <p>
            Soy <strong>Facundo Malgieri</strong>, desarrollador argentino con más de 10 años diseñando
            y construyendo productos digitales. Trabajo como tech lead en{" "}
            <a
              href="https://lumenalta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lumenalta
            </a>{" "}
            y mantengo proyectos propios como éste en mi tiempo libre. Mi día a día gira alrededor de
            React, Next.js, TypeScript e infraestructura web.
          </p>
          <p>
            Soy monotributista desde hace años y viví en carne propia la fricción de entrar al portal
            de ARCA (ex AFIP) a consultar facturas, calcular tope anual y decidir si recategorizarme.
            GARCA salió de esa necesidad concreta, y lo mantengo con el mismo foco con el que lo usé:
            que sea rápido, privado y útil.
          </p>
        </div>
      </section>

      {/* Por qué existe GARCA */}
      <section className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Por qué existe GARCA
        </h2>
        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          <p>
            GARCA es un proyecto{" "}
            <strong>independiente, gratuito y open source</strong>. No está afiliado a ARCA ni a
            ninguna empresa de software contable. Lo construí con tres principios:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
            <li className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5">
              <div className="text-emerald-600 dark:text-emerald-400 mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Privacidad por diseño</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tus credenciales y comprobantes nunca tocan un servidor nuestro. Todo se procesa en tu
                navegador.
              </p>
            </li>
            <li className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5">
              <div className="text-blue-600 dark:text-blue-400 mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Código abierto</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Todo el código está en{" "}
                <a
                  href="https://github.com/FacundoMalgieri/garca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  GitHub
                </a>
                . Cualquiera puede auditarlo, reportar bugs o contribuir.
              </p>
            </li>
            <li className="rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5">
              <div className="text-purple-600 dark:text-purple-400 mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Datos oficiales</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Las categorías, topes y cuotas se toman directo de las resoluciones vigentes de ARCA y
                se actualizan cada semestre.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Disclaimer YMYL */}
      <section className="mb-10">
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Qué NO es GARCA
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                GARCA es <strong>una herramienta, no asesoría contable ni fiscal</strong>. Los datos
                que mostramos (categorías, cuotas, topes) son los oficiales de ARCA, pero las
                decisiones sobre tu situación fiscal las tomás vos — idealmente con un contador
                matriculado.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Si estás en una situación compleja —{" "}
                <Link href="/monotributo/recategorizacion" className="text-amber-700 dark:text-amber-400 hover:underline">
                  recategorización
                </Link>
                ,{" "}
                <Link href="/monotributo/que-pasa-si-me-paso" className="text-amber-700 dark:text-amber-400 hover:underline">
                  exclusión del régimen
                </Link>
                , multas, actividad internacional, combinación de regímenes — consultá con un
                profesional. GARCA te ayuda a ver tu situación con claridad; no la reemplaza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Actualización */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-10">
        Última actualización de contenido:{" "}
        <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>. GARCA se
        mantiene activamente — las categorías se refrescan cada semestre tras cada actualización
        oficial de ARCA.
      </p>

      <SupportBanner />

      <div className="mt-10 text-center text-sm text-slate-600 dark:text-slate-400">
        <p>
          Si tenés dudas o encontrás un bug, abrí un issue en{" "}
          <a
            href="https://github.com/FacundoMalgieri/garca/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
