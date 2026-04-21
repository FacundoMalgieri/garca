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
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-blue-900/30 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-6 md:p-10 mb-10 shadow-[0_20px_60px_-20px_rgba(59,130,246,0.25)] dark:shadow-[0_0_80px_-20px_rgba(99,102,241,0.3)]">
        {/* Subtle grid pattern overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Ambient gradient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-56 w-56 bg-gradient-to-br from-blue-400/25 to-indigo-500/25 dark:from-blue-500/30 dark:to-indigo-600/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-full blur-3xl translate-y-1/2"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-0 h-28 w-28 bg-gradient-to-br from-purple-400/15 to-pink-400/15 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-2xl -translate-x-1/2"
        />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-10">
          {/*
            Avatar sourced from GitHub so it stays in sync when Facundo updates it there:
            github.com/<user>.png redirects to the current avatar on avatars.githubusercontent.com.
            Both hosts are whitelisted in the img-src CSP in next.config.ts.
          */}
          <div className="relative flex-shrink-0 group">
            {/* Soft colored halo glow behind avatar */}
            <div
              aria-hidden
              className="absolute -inset-3 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 opacity-25 dark:opacity-40 blur-2xl group-hover:opacity-40 dark:group-hover:opacity-60 transition-opacity duration-500"
            />
            {/* Conic gradient border ring */}
            <div
              aria-hidden
              className="absolute -inset-0.5 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#3b82f6_0deg,#6366f1_90deg,#a855f7_180deg,#06b6d4_270deg,#3b82f6_360deg)] opacity-60 dark:opacity-75 blur-[2px]"
            />
            {/* Avatar image */}
            <div className="relative h-32 w-32 sm:h-44 sm:w-44 md:h-48 md:w-48 rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-950 shadow-2xl shadow-blue-500/20 dark:shadow-indigo-900/50 bg-slate-100 dark:bg-slate-800">
              <img
                src="https://github.com/FacundoMalgieri.png?size=400"
                alt="Facundo Malgieri"
                width={192}
                height={192}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Argentina flag badge (bottom-right) */}
            <div
              aria-label="Argentina"
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 h-7 w-7 sm:h-9 sm:w-9 rounded-full ring-2 sm:ring-4 ring-white dark:ring-slate-950 shadow-md overflow-hidden"
            >
              <div className="h-full w-full flex flex-col">
                <div className="flex-1 bg-[#74ACDF]" />
                <div className="flex-1 bg-white flex items-center justify-center">
                  <svg className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-[#F6B40E]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                </div>
                <div className="flex-1 bg-[#74ACDF]" />
              </div>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-white/5 ring-1 ring-slate-200 dark:ring-white/15 text-slate-700 dark:text-slate-100 text-xs font-semibold mb-3 backdrop-blur-sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sobre el autor
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5">
              Facundo Malgieri
            </h1>
            <p className="text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Software Engineer
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 justify-center sm:justify-start text-sm text-slate-700 dark:text-slate-200 mb-5">
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 text-slate-500 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Argentina
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 text-slate-500 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                10+ años en productos digitales
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 text-slate-500 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Tech Lead @{" "}
                <a
                  href="https://lumenalta.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Lumenalta
                </a>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-sm">
              <a
                href="https://github.com/FacundoMalgieri"
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md hover:-translate-y-0.5 transition-all text-slate-800 dark:text-slate-100 font-medium"
              >
                <svg className="h-4 w-4 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.3 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .5z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/facundo-malgieri/"
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#0A66C2] dark:hover:border-[#70B5F9] hover:shadow-md hover:-translate-y-0.5 transition-all text-slate-800 dark:text-slate-100 font-medium"
              >
                <svg className="h-4 w-4 text-[#0A66C2] dark:text-[#70B5F9]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="https://fmalgieri.com"
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md hover:-translate-y-0.5 transition-all text-slate-800 dark:text-slate-100 font-medium"
              >
                <svg className="h-4 w-4 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
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
            Soy <strong>Facundo Malgieri</strong>, desarrollador argentino con más de 10 años
            construyendo productos digitales. Trabajo como tech lead en{" "}
            <a
              href="https://lumenalta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lumenalta
            </a>{" "}
            y dedico parte de mi tiempo libre a proyectos propios como GARCA. Mi stack de todos los
            días es React, Next.js, TypeScript e infraestructura web.
          </p>
          <p>
            Soy monotributista y viví en primera persona la fricción de entrar al portal de ARCA
            (ex AFIP) a consultar facturas, calcular mi tope anual y decidir si me tenía que
            recategorizar. Esa necesidad concreta fue el origen de GARCA: una herramienta rápida y
            privada para resolver ese problema sin rodeos.
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
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose auto-rows-fr">
            <li className="h-full rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5">
              <div className="text-emerald-600 dark:text-emerald-400 mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Privacidad por diseño</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tus credenciales viajan cifradas (AES-256) al servidor, se usan solo para consultar
                ARCA y se descartan ni bien se completa la consulta. No hay base de datos.
              </p>
            </li>
            <li className="h-full rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5">
              <div className="text-blue-600 dark:text-blue-400 mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Código abierto</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
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
            <li className="h-full rounded-2xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5">
              <div className="text-purple-600 dark:text-purple-400 mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Datos oficiales</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
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
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Qué NO es GARCA
            </h2>
          </div>
          <div className="space-y-3 text-slate-700 dark:text-slate-300">
            <p>
              GARCA es <strong>una herramienta, no asesoría contable ni fiscal</strong>. Los datos
              que mostramos (categorías, cuotas, topes) son los oficiales de ARCA, pero las
              decisiones sobre tu situación fiscal las tomás vos — idealmente con un contador
              matriculado.
            </p>
            <p>
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
