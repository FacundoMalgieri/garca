import Image from "next/image";

import { NativeAd } from "@/components/ads/NativeAd";
import { HeroDemoButton } from "@/components/landing/HeroDemoButton";
import { HeroParallax } from "@/components/landing/HeroParallax";
import { HomeSections } from "@/components/landing/HomeSections";
import { PanelMockup } from "@/components/landing/PanelMockup";
import { TrackedLandingCtaLink } from "@/components/landing/TrackedLandingCtaLink";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/ui/icons";

// Homepage is a Server Component: the hero markup (logo, h1, subtitles,
// LCP <p>, primary CTA Link) ships as pre-rendered HTML so Chrome can paint
// it without waiting for React hydration. Only the small interactive pieces
// (scroll parallax, "Ver demo" flow, all below-the-fold sections with scroll
// effects) are carved out into Client Components.
export default function Home() {
  return (
    <div className="relative overflow-x-hidden bg-background">
      {/* ========== HERO SECTION (server-rendered HTML) ========== */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <HeroParallax>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
            {/* Columna izquierda: copy + CTAs + privacidad */}
            <div className="text-center lg:text-left">
              <div className="relative inline-block mb-6 animate-hero-entry">
                <Image
                  src="/logo-full.svg"
                  alt="GARCA - Gestor Automático de Recuperación de Comprobantes de ARCA"
                  width={96}
                  height={96}
                  priority
                  className="relative h-16 w-16 md:h-20 md:w-20"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-balance mb-4 text-slate-900 dark:text-white animate-hero-entry-1">
                Tus comprobantes de ARCA, claros en segundos
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed animate-hero-entry-3">
                Visualizá tu facturación, calculá tu categoría de Monotributo 2026 y planificá para
                no pasarte de tope. <span className="font-semibold text-slate-700 dark:text-slate-300">Simple, privado y gratis.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-6 animate-hero-entry-4">
                <TrackedLandingCtaLink
                  href="/calculadora-monotributo"
                  target="calculadora"
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative">Probar la calculadora</span>
                  <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
                </TrackedLandingCtaLink>

                <TrackedLandingCtaLink
                  href="/ingresar"
                  target="ingresar"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-border bg-white/80 dark:bg-white/5 backdrop-blur-sm px-7 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <span>Ingresar con ARCA</span>
                  <ArrowRightIcon className="group-hover:translate-x-1 transition-transform duration-300" />
                </TrackedLandingCtaLink>
              </div>

              {/* Señal de privacidad (visible sin scroll) */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-medium text-emerald-700 dark:text-emerald-300 animate-hero-entry-5">
                <ShieldCheckIcon />
                <span>100% en tu navegador · credenciales cifradas AES-256 · nada se guarda</span>
              </div>
            </div>

            {/* Columna derecha: mockup del panel + CTA demo, misma altura que la izquierda */}
            <div className="flex flex-col justify-center items-center lg:items-end gap-5 animate-hero-entry-3">
              <PanelMockup />
              <div className="w-full max-w-md">
                <HeroDemoButton widthClassName="w-full" />
              </div>
            </div>
          </div>
        </HeroParallax>
      </section>

      <HomeSections />

      {/* Ad de cierre (native, responsive) — al fondo, fuera del flujo de conversión. */}
      <div className="mx-auto max-w-5xl px-4 md:px-6 pb-12">
        <NativeAd />
      </div>
    </div>
  );
}
