import { NativeAd } from "@/components/ads/NativeAd";
import { HeroDemoButton } from "@/components/landing/HeroDemoButton";
import { HeroParallax } from "@/components/landing/HeroParallax";
import { HomeSections } from "@/components/landing/HomeSections";
import { PanelMockup } from "@/components/landing/PanelMockup";
import { TrackedLandingCtaLink } from "@/components/landing/TrackedLandingCtaLink";
import { ArrowRightIcon } from "@/components/ui/icons";

// Homepage is a Server Component: the hero markup (logo, h1, subtitles,
// LCP <p>, primary CTA Link) ships as pre-rendered HTML so Chrome can paint
// it without waiting for React hydration. Only the small interactive pieces
// (scroll parallax, "Ver demo" flow, all below-the-fold sections with scroll
// effects) are carved out into Client Components.
export default function Home() {
  return (
    <div className="relative overflow-x-clip bg-background">
      {/* ========== HERO SECTION (server-rendered HTML) ========== */}
      {/* En desktop el hero queda pegado (sticky) bajo el navbar y la sección
          siguiente sube por encima tapándolo (overlap progresivo). overflow-x-clip
          en el wrapper —no hidden— para no romper el sticky. */}
      <section className="relative z-0 -mt-16 flex items-center overflow-hidden min-h-[100svh] pt-16 lg:sticky lg:top-0">
        {/* Atmósfera de marca: gradiente navy + glows cyan/coral + grid con máscara radial */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/80 via-transparent to-transparent dark:from-[#1b2347] dark:via-[#111]/0 dark:to-transparent" />
          {/* Glow ancho arriba-centro: le da color al frosted del navbar sobre el hero */}
          <div className="absolute -top-40 left-1/2 h-[30rem] w-[70rem] -translate-x-1/2 rounded-full bg-[#64D3DE]/15 blur-[130px] dark:bg-[#2E3A66]/70" />
          {/* Glow detrás del titular (izquierda) — mata el vacío negro en desktop */}
          <div className="absolute -left-40 -top-24 h-[44rem] w-[44rem] rounded-full bg-[#64D3DE]/15 blur-[150px] dark:bg-[#2E3A66]/70" />
          {/* Glow cyan arriba-derecha */}
          <div className="absolute -right-24 -top-24 h-[44rem] w-[44rem] rounded-full bg-[#64D3DE]/30 blur-[140px] dark:bg-[#64D3DE]/22" />
          {/* Glow coral abajo, hacia el centro */}
          <div className="absolute bottom-[-12rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-[#FF6B5C]/12 blur-[150px] dark:bg-[#FF6B5C]/12" />
          <div className="absolute inset-0 text-slate-900 opacity-[0.05] dark:text-white dark:opacity-[0.09] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        </div>
        <HeroParallax>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-stretch">
            {/* Columna izquierda: copy + CTAs, centrada verticalmente vs. la derecha */}
            <div className="flex flex-col justify-center text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-balance mb-4 text-slate-900 dark:text-white animate-hero-entry-1">
                Monitoreá tu facturación{" "}
                <span className="bg-gradient-to-r from-[#262F55] to-[#0f7d8c] dark:from-white dark:to-[#64D3DE] bg-clip-text text-transparent">
                  sin esfuerzo
                </span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-slate-600 dark:text-slate-300 mb-5 leading-relaxed animate-hero-entry-3">
                Conocé tu categoría, cuánto llevás facturado y cuánto te falta para alcanzar el
                límite.{" "}
                <span className="font-semibold text-slate-800 dark:text-white">Gratis, privado y seguro.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4 animate-hero-entry-4">
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
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-800 dark:text-white shadow-sm hover:bg-white/80 dark:hover:bg-white/20 hover:border-slate-300 dark:hover:border-white/25 transition-all duration-300 cursor-pointer"
                >
                  <span>Ingresar con ARCA</span>
                  <ArrowRightIcon className="group-hover:translate-x-1 transition-transform duration-300" />
                </TrackedLandingCtaLink>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 animate-hero-entry-5">
                No esperes a que ARCA te avise cuando ya es tarde.
              </p>
            </div>

            {/* Columna derecha: mockup del panel + CTA demo, misma altura que la izquierda */}
            <div className="flex flex-col justify-center items-center lg:items-end gap-4 animate-hero-entry-3">
              <PanelMockup />
              <div className="w-full max-w-md">
                <HeroDemoButton widthClassName="w-full" />
              </div>
            </div>
          </div>
        </HeroParallax>
      </section>

      {/* Lámina opaca que sube por encima del hero sticky (overlap). */}
      <div className="relative z-10 bg-background">
        <HomeSections />

        {/* Ad de cierre (native, responsive) — al fondo, fuera del flujo de conversión. */}
        <div className="mx-auto max-w-5xl px-4 md:px-6 pb-12">
          <NativeAd />
        </div>
      </div>
    </div>
  );
}
