import Image from "next/image";
import Link from "next/link";

import { HeroDemoButton } from "@/components/landing/HeroDemoButton";
import { HeroParallax } from "@/components/landing/HeroParallax";
import { HomeSections } from "@/components/landing/HomeSections";
import { ArrowRightIcon, SparklesIcon } from "@/components/ui/icons";

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
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <HeroParallax>
          <div className="text-center">
            <div className="relative inline-block mb-8 animate-hero-entry">
              <Image
                src="/logo-full.svg"
                alt="GARCA - Gestor Automático de Recuperación de Comprobantes de ARCA"
                width={144}
                height={144}
                priority
                className="relative h-28 w-28 md:h-36 md:w-36"
              />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white animate-hero-entry-1">
              Bienvenido a GARCA
            </h1>

            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-4 font-medium animate-hero-entry-2">
              Gestor Automático de Recuperación de Comprobantes de ARCA
            </p>

            <p className="max-w-xl mx-auto text-sm md:text-base text-slate-600 dark:text-slate-400 mb-10 leading-relaxed animate-hero-entry-3">
              La herramienta más{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">simple</span> y{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">segura</span>{" "}
              para visualizar tus comprobantes de ARCA y calcular tu categoría de Monotributo
              2026.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-hero-entry-4">
              <Link
                href="/ingresar"
                className="group relative w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_70%)]" />
                <span className="relative">Comenzar ahora</span>
                <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              <HeroDemoButton />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-muted/50 backdrop-blur-sm border border-slate-200 dark:border-border text-xs text-slate-600 dark:text-muted-foreground hover:scale-105 transition-transform duration-300 animate-hero-entry-5">
              <SparklesIcon />
              <span>Probá con datos ficticios sin loguearte</span>
            </div>
          </div>
        </HeroParallax>
      </section>

      <HomeSections />
    </div>
  );
}
