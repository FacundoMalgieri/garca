"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { TrackedLandingCtaLink } from "@/components/landing/TrackedLandingCtaLink";
import { ArrowRightIcon } from "@/components/ui/icons";

// Proceso real de emisión (secuencia → la numeración informa el orden).
const PASOS = [
  { n: "01", t: "Cargás los datos", d: "Desde cero o con una plantilla guardada de tus clientes habituales." },
  { n: "02", t: "Previsualizás", d: "Ves exactamente lo que ARCA va a emitir, con tu tope de categoría a la vista." },
  { n: "03", t: "Emitís", d: "CAE y PDF al instante. Queda registrada en tu panel." },
];

export function FacturadorSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.15);
  const enter = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 700ms ease, transform 700ms ease",
    transitionDelay: `${delay}ms`,
  });

  return (
    <section ref={ref} id="facturador" className="relative py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Panel de contraste: rompe con las secciones neutrales de alrededor,
            impacta igual en light y dark porque el slab es oscuro siempre. */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-400/20 bg-[linear-gradient(135deg,#0a1512_0%,#0c1b16_45%,#07130f_100%)] px-6 py-12 md:px-12 md:py-16 shadow-2xl shadow-emerald-950/40">
          {/* Glows internos */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.22),transparent_70%)]" />
            <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.14),transparent_70%)]" />
          </div>

          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
            {/* ---- Copy ---- */}
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300"
                style={enter(0)}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> NUEVO · EMISIÓN DE COMPROBANTES
              </span>

              <h2
                className="mt-5 text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight text-balance text-white"
                style={enter(60)}
              >
                De monitorear tu facturación a{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">emitirla</span>.
              </h2>

              <p className="mt-4 max-w-lg text-base md:text-lg leading-relaxed text-slate-300" style={enter(120)}>
                Emití <strong className="font-semibold text-white">Factura C</strong> en segundos y, si algo sale mal,
                deshacela con una <strong className="font-semibold text-white">Nota de Crédito</strong>. Todo desde acá,
                sin pisar el portal de ARCA.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={enter(180)}>
                <TrackedLandingCtaLink
                  href="/facturar"
                  target="facturar"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm md:text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-300 transition-colors cursor-pointer"
                >
                  Empezar a facturar
                  <ArrowRightIcon className="group-hover:translate-x-1 transition-transform duration-300" />
                </TrackedLandingCtaLink>
                <span className="text-xs text-slate-400">Entrás con tu Clave Fiscal de ARCA.</span>
              </div>
            </div>

            {/* ---- Artefacto: comprobante "emitido" ---- */}
            <div className="relative" style={enter(260)}>
              {/* Comprobante */}
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 shadow-xl">
                <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-slate-400">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-slate-200">FACTURA C</span>
                  <span>PV 00003</span>
                </div>
                <div className="mt-4 text-sm text-slate-400">Receptor</div>
                <div className="text-slate-100">Consumidor Final</div>

                <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-white/10 pt-4 text-sm">
                  <span className="text-slate-300">Servicio de diseño · jun 2026</span>
                  <span className="font-mono text-slate-200">$180.000</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Total</span>
                  <span className="font-mono text-2xl font-bold text-white">$180.000</span>
                </div>

                {/* Sello CAE */}
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[11px] font-bold text-emerald-950">✓</span>
                  <span className="text-sm text-emerald-200">Emitida</span>
                  <span className="ml-auto font-mono text-xs text-emerald-300/80">CAE 86294389…</span>
                </div>
              </div>

              {/* Chip "Deshacer" — el superpoder del undo fiscal */}
              <div className="absolute -bottom-4 -left-3 sm:-left-5 flex items-center gap-2 rounded-full border border-white/15 bg-[#0c1b16] px-3.5 py-1.5 text-xs font-medium text-slate-200 shadow-lg">
                <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14 4 9l5-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h11a5 5 0 0 1 0 10h-3" />
                </svg>
                Deshacer <span className="text-slate-400">→ Nota de Crédito</span>
              </div>
            </div>
          </div>

          {/* ---- Proceso en 3 pasos ---- */}
          <div className="relative mt-14 grid gap-6 sm:grid-cols-3 border-t border-white/10 pt-8">
            {PASOS.map((p, i) => (
              <div key={p.n} style={enter(340 + i * 90)}>
                <div className="font-mono text-sm text-emerald-400/80">{p.n}</div>
                <div className="mt-1 font-semibold text-white">{p.t}</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
