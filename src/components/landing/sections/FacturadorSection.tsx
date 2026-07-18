"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { TrackedLandingCtaLink } from "@/components/landing/TrackedLandingCtaLink";
import { ArrowRightIcon } from "@/components/ui/icons";

const FEATURES = [
  {
    icon: <ReceiptIcon />,
    title: "Emití Factura C en segundos",
    body: "Cargá el comprobante y emitilo directo en ARCA, sin dar vueltas por el portal. El CAE y el PDF quedan listos al instante.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: <TemplateIcon />,
    title: "Plantillas reutilizables",
    body: "Guardá tus clientes y conceptos habituales como plantillas y facturá lo de todos los meses en un par de clics.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: <UndoIcon />,
    title: "Deshacé con un clic",
    body: "¿Te equivocaste? Anulá cualquier Factura C emitiendo una Nota de Crédito que la cancela, sin buscar comprobantes asociados a mano.",
    gradient: "from-orange-500 to-rose-500",
  },
];

export function FacturadorSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.15);

  return (
    <section ref={ref} id="facturador" className="relative py-24 md:py-32 overflow-hidden">
      {/* Backdrop: glow verde-teal detrás de la sección */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 h-[26rem] w-[42rem] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-[150px] dark:bg-emerald-500/10"
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-emerald-500/25 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
          >
            ✨ Nuevo · Facturá desde GARCA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-balance mb-4">
            No solo mirás tu facturación: ahora la emitís
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Emití tus <strong className="text-slate-800 dark:text-slate-200">Facturas C</strong> y anulalas con{" "}
            <strong className="text-slate-800 dark:text-slate-200">Notas de Crédito</strong> sin salir de GARCA. Con tu
            categoría y tu tope siempre a la vista mientras facturás.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {FEATURES.map((c, i) => (
            <div
              key={c.title}
              className="group rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-muted/60 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {c.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{c.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <TrackedLandingCtaLink
            href="/facturar"
            target="facturar"
            className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative">Empezar a facturar</span>
            <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
          </TrackedLandingCtaLink>
          <p className="text-xs text-slate-500 dark:text-slate-400">Necesitás ingresar con tu Clave Fiscal de ARCA.</p>
        </div>
      </div>
    </section>
  );
}

function ReceiptIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6m-6-4h6m-8 8V5a1 1 0 011-1h8a1 1 0 011 1v13l-2.5-1.5L14 18l-2-1.5L10 18l-2.5-1.5L5 18z" />
    </svg>
  );
}

function TemplateIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h8m-8 4h5M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v6h6M3 13a9 9 0 103-6.7L3 9" />
    </svg>
  );
}
