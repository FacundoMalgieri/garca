"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { GitHubIcon, LockIcon, ShieldCheckIcon } from "@/components/ui/icons";

const PILLARS = [
  {
    icon: <LockIcon />,
    title: "Cifrado en tu navegador",
    body: "Tus credenciales de ARCA se cifran con AES-256 antes de salir de tu equipo. Se usan sólo para la consulta y se descartan al terminar.",
  },
  {
    icon: <ShieldCheckIcon />,
    title: "Sin base de datos",
    body: "No guardamos credenciales ni comprobantes en ningún servidor. Tus datos viven sólo en tu navegador (localStorage) y los borrás cuando quieras.",
  },
  {
    icon: <GitHubIcon className="h-6 w-6" />,
    title: "Open source",
    body: "Todo el código es público y auditable en GitHub. No tenés que confiar: podés revisar exactamente qué hace GARCA con tus datos.",
  },
];

export function PrivacySection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.25);

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 overflow-hidden bg-primary/5 dark:bg-white/[0.03] border-y border-slate-200 dark:border-white/10"
    >
      {/* Backdrop: glow emerald (sección de confianza) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-[140px] dark:bg-emerald-500/10"
      />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
            <ShieldCheckIcon />
            Privacidad por diseño
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Tus datos no salen de tu navegador
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            GARCA está construido para que no tengas que confiar ciegamente. Esto es lo que lo hace
            distinto de cualquier planilla o servicio que guarda tu información.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-muted/60 p-6 transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 text-white shadow-lg shadow-emerald-500/25">
                {p.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{p.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
