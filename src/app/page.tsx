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
      <section className="relative flex lg:items-center overflow-hidden lg:min-h-[calc(100vh-64px)]">
        {/* Atmósfera de marca: gradiente navy + glows cyan/coral + grid con máscara radial */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/70 via-transparent to-transparent dark:from-[#262F55]/40 dark:via-transparent dark:to-transparent" />
          <div className="absolute -right-32 -top-28 h-[32rem] w-[32rem] rounded-full bg-[#64D3DE]/30 blur-[120px] dark:bg-[#64D3DE]/20" />
          <div className="absolute -left-28 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#FF6B5C]/15 blur-[130px] dark:bg-[#FF6B5C]/12" />
          <div className="absolute left-1/2 top-1/3 hidden h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#262F55]/50 blur-[150px] dark:block" />
          <div className="absolute inset-0 text-slate-900 opacity-[0.04] dark:text-white dark:opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
        </div>
        <HeroParallax>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
            {/* Columna izquierda: copy + CTAs + privacidad */}
            <div className="text-center lg:text-left">
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f7d8c] dark:text-[#64D3DE] animate-hero-entry">
                Monotributo 2026
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-balance mb-4 text-slate-900 dark:text-white animate-hero-entry-1">
                Sabé en qué categoría estás{" "}
                <span className="bg-gradient-to-r from-[#262F55] to-[#0f7d8c] dark:from-white dark:to-[#64D3DE] bg-clip-text text-transparent">
                  antes que ARCA
                </span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed animate-hero-entry-3">
                GARCA lee tus comprobantes de ARCA, calcula tu categoría de Monotributo 2026 y te
                muestra cuánto te queda para no pasarte.{" "}
                <span className="font-semibold text-slate-800 dark:text-white">Simple, privado y gratis.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-6 animate-hero-entry-4">
                <TrackedLandingCtaLink
                  href="/calculadora-monotributo"
                  target="calculadora"
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative">Probar la calculadora</span>
                  <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
                </TrackedLandingCtaLink>

                <TrackedLandingCtaLink
                  href="/ingresar"
                  target="ingresar"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-border bg-white/80 dark:bg-white/5 backdrop-blur-sm px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <span>Ingresar con ARCA</span>
                  <ArrowRightIcon className="group-hover:translate-x-1 transition-transform duration-300" />
                </TrackedLandingCtaLink>
              </div>

              {/* Señal de privacidad (visible sin scroll) */}
              <div className="flex w-full justify-center sm:inline-flex sm:w-auto items-center gap-2 px-4 py-2.5 rounded-2xl sm:rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-300 leading-snug animate-hero-entry-5">
                <ShieldCheckIcon />
                <span className="sm:hidden">100% en tu navegador · AES-256 · nada se guarda</span>
                <span className="hidden sm:inline">
                  100% en tu navegador · credenciales cifradas AES-256 · nada se guarda
                </span>
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
