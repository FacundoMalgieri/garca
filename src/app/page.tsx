"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import {
  ArrowRightIcon,
  LoadingSpinner,
  PayPalIcon,
  PlayIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/components/ui/icons";
// Removed CurrencyPill import - now rendered inline with scroll-controlled animations
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { mockInvoices } from "@/test/mocks/invoices";

const STORAGE_KEY = "garca_invoices";
const COMPANY_STORAGE_KEY = "garca_company";

const DEMO_COMPANY = {
  cuit: "20345678901",
  razonSocial: "Tecnología Innovadora SRL (Demo)",
};

// Currency pill colors
const currencyColors: Record<string, string> = {
  blue: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  green: "from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50",
  amber: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
  red: "from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50",
};

// Helper to calculate scroll progress within a section
function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateProgress = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Progress: 0 when section bottom is at viewport bottom, 1 when section top is at viewport top
      // This gives us a smooth 0-1 range as we scroll through the section
      const sectionHeight = rect.height;
      const visibleStart = windowHeight; // Section enters when its top crosses bottom of viewport
      const visibleEnd = -sectionHeight; // Section exits when its bottom crosses top of viewport
      
      // Calculate how far through the visibility range we are
      const currentPosition = rect.top;
      const totalRange = visibleStart - visibleEnd;
      const progressValue = (visibleStart - currentPosition) / totalRange;
      
      setProgress(Math.max(0, Math.min(1, progressValue)));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [ref]);

  return progress;
}

// Hook to detect when section enters/exits viewport (resets on exit for repeatable animations)
function useSectionVisible(ref: React.RefObject<HTMLElement | null>, threshold = 0.3) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        // Set visible when entering, reset when exiting
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isVisible;
}

export default function Home() {
  const router = useRouter();
  const { state, loadFromStorage } = useInvoiceContext();
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Section refs for dynamic parallax
  const currencySectionRef = useRef<HTMLElement>(null);
  const privacySectionRef = useRef<HTMLElement>(null);
  const supportSectionRef = useRef<HTMLElement>(null);

  // All sections use scroll progress for enter + exit effects
  const currencyProgress = useSectionProgress(currencySectionRef);
  const privacyProgress = useSectionProgress(privacySectionRef);
  const supportProgress = useSectionProgress(supportSectionRef);

  // Visibility triggers for entry animations (badges, buttons)
  const currencyVisible = useSectionVisible(currencySectionRef, 0.4);
  const supportVisible = useSectionVisible(supportSectionRef, 0.4);

  // Initial page load animation for Hero
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Normal scroll tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trigger hero animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.invoices.length > 0) {
      router.push("/panel");
    }
  }, [state.invoices.length, router]);

  const handleLoadDemo = () => {
    setIsLoadingDemo(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInvoices));
      localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(DEMO_COMPANY));
      loadFromStorage();
      router.push("/panel");
    } catch (error) {
      console.error("Error loading demo data:", error);
      setIsLoadingDemo(false);
    }
  };

  if (state.invoices.length > 0) {
    return null;
  }

  return (
    <div className="relative overflow-x-hidden bg-background">
      {/* ========== HERO SECTION ========== */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
      

        <div 
          className="relative w-full max-w-4xl mx-auto px-6 py-12 md:py-16"
          style={{
            transform: `translateY(${scrollY * -0.8}px)`,
            opacity: Math.max(0, 1 - scrollY / 800),
          }}
        >
          <div className="text-center">
            {/* Logo - first to appear */}
            <div 
              className="relative inline-block mb-8 transition-all duration-700 ease-out"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(40px)",
              }}
            >
              <img
                src="/logo-full.svg"
                alt="GARCA Logo"
                className="relative h-28 w-28 md:h-36 md:w-36"
              />
            </div>

            {/* Title - second to appear */}
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-slate-800 dark:text-white transition-all duration-700 ease-out"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(40px)",
                transitionDelay: "100ms",
              }}
            >
              Bienvenido a GARCA
            </h1>

            {/* Subtitle - third to appear */}
            <p 
              className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-4 font-medium transition-all duration-700 ease-out"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(40px)",
                transitionDelay: "200ms",
              }}
            >
              Gestor Automático de Recuperación de Comprobantes de ARCA
            </p>

            {/* Description - fourth to appear */}
            <p 
              className="max-w-xl mx-auto text-sm md:text-base text-slate-500 dark:text-slate-500 mb-10 leading-relaxed transition-all duration-700 ease-out"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(40px)",
                transitionDelay: "300ms",
              }}
            >
              La herramienta más <span className="font-semibold text-slate-700 dark:text-slate-300">simple</span> y{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">segura</span> para visualizar tus
              comprobantes.
            </p>

            {/* CTA Buttons - fifth to appear */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 transition-all duration-700 ease-out"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(40px)",
                transitionDelay: "400ms",
              }}
            >
              <Link
                href="/ingresar"
                className="group relative w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_70%)]" />
                <span className="relative">Comenzar ahora</span>
                <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              <button
                onClick={handleLoadDemo}
                disabled={isLoadingDemo}
                className="group w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-border bg-white/80 dark:bg-white/5 backdrop-blur-sm px-6 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {isLoadingDemo ? (
                  <>
                    <LoadingSpinner />
                    Cargando...
                  </>
                ) : (
                  <>
                    <PlayIcon className="group-hover:scale-125 transition-transform duration-300" />
                    Ver demo
                  </>
                )}
              </button>
            </div>

            {/* Demo badge - last to appear */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-muted/50 backdrop-blur-sm border border-slate-200 dark:border-border text-xs text-slate-600 dark:text-muted-foreground hover:scale-105 transition-all duration-700 ease-out"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(40px)",
                transitionDelay: "500ms",
              }}
            >
              <SparklesIcon />
              <span>Probá con datos ficticios sin loguearte</span>
            </div>
          </div>
        </div>

      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Entire section content with parallax entry/exit */}
        <div 
          className="relative max-w-6xl mx-auto px-6"
          style={{
            // Entry: emerge from below (scroll 0-400)
            // Exit: lift up and fade (scroll > 1100)
            transform: `translateY(${
              scrollY < 400
                ? Math.max(0, (400 - scrollY) * 0.15) // Entry - starts 60px below
                : scrollY > 1100
                  ? (scrollY - 1100) * -0.8 // Exit - same speed as Hero
                  : 0
            }px)`,
            opacity:
              scrollY < 200
                ? Math.max(0.3, scrollY / 200) // Fade in starting at 30%
                : scrollY > 1100
                  ? Math.max(0, 1 - (scrollY - 1100) / 400) // Fade out
                  : 1,
          }}
        >
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow duration-300">
              <SparklesIcon />
              Funcionalidades
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
              Todo lo que necesitás
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Herramientas poderosas para gestionar tu facturación de forma eficiente
            </p>
          </div>

          {/* Features grid */}
          <FeaturesGrid scrollY={scrollY} />
        </div>
      </section>

      {/* ========== CURRENCIES SECTION ========== */}
      <section ref={currencySectionRef} className="relative py-32 md:py-40 overflow-hidden">
        <div 
          className="relative max-w-4xl mx-auto px-6 text-center"
          style={{
            // Entry: emerge from below (progress 0->0.25)
            // Exit: lift up fast like Hero (progress 0.6->1)
            transform: `translateY(${
              currencyProgress < 0.25
                ? (1 - currencyProgress / 0.25) * 80 // Enter from 80px below
                : currencyProgress > 0.6
                  ? -((currencyProgress - 0.6) / 0.4) * 200 // Exit - lift up 200px
                  : 0
            }px)`,
            opacity: 
              currencyProgress < 0.25
                ? currencyProgress / 0.25 // Fade in
                : currencyProgress > 0.6
                  ? Math.max(0, 1 - (currencyProgress - 0.6) / 0.5) // Fade out slower
                  : 1,
          }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-green-500/25">
            Multi-moneda
          </span>

          {/* Title */}
          <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white mb-8">
            Soporta múltiples monedas
          </h2>

          {/* Currency pills - animate in from sides when visible */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {[
              { currency: "ARS", label: "Peso", color: "blue", fromLeft: true, delay: 0 },
              { currency: "USD", label: "Dólar", color: "green", fromLeft: false, delay: 100 },
              { currency: "EUR", label: "Euro", color: "amber", fromLeft: true, delay: 200 },
              { currency: "JPY", label: "Yen", color: "red", fromLeft: false, delay: 300 },
            ].map(({ currency, label, color, fromLeft, delay }) => (
              <div
                key={currency}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${currencyColors[color]} border backdrop-blur-sm cursor-default hover:scale-110 hover:shadow-lg transition-all duration-700 ease-out`}
                style={{
                  opacity: currencyVisible ? 1 : 0,
                  transform: currencyVisible 
                    ? "translateX(0) translateY(0) rotate(0deg)" 
                    : `translateX(${fromLeft ? "-80px" : "80px"}) translateY(30px) rotate(${fromLeft ? "-15deg" : "15deg"})`,
                  transitionDelay: `${delay}ms`,
                }}
              >
                <span className="font-bold">{currency}</span>
                <span className="text-xs opacity-70">{label}</span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-slate-400 dark:text-slate-500">
            y más...
          </p>
        </div>
      </section>

      {/* ========== PRIVACY SECTION ========== */}
      <section ref={privacySectionRef} className="relative py-32 md:py-40 overflow-hidden">
        <div 
          className="relative max-w-3xl mx-auto px-6"
          style={{
            // Entry: emerge from below (progress 0->0.25)
            // Exit: lift up fast like Hero (progress 0.6->1)
            transform: `translateY(${
              privacyProgress < 0.25
                ? (1 - privacyProgress / 0.25) * 80 // Enter from 80px below
                : privacyProgress > 0.6
                  ? -((privacyProgress - 0.6) / 0.4) * 200 // Exit - lift up 200px
                  : 0
            }px)`,
            opacity: 
              privacyProgress < 0.25
                ? privacyProgress / 0.25 // Fade in
                : privacyProgress > 0.6
                  ? Math.max(0, 1 - (privacyProgress - 0.6) / 0.5) // Fade out slower
                  : 1,
          }}
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/30 p-8 md:p-10 overflow-hidden shadow-[0_8px_40px_-8px_rgba(16,185,129,0.25)] dark:shadow-none hover:shadow-[0_12px_50px_-8px_rgba(16,185,129,0.35)] transition-shadow duration-500">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/30 to-green-400/30 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-400/30 to-cyan-400/30 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

            <div className="relative flex flex-col md:flex-row items-start gap-5">
              {/* Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  Privacidad Garantizada
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  GARCA funciona{" "}
                  <strong className="text-slate-800 dark:text-white">completamente en tu navegador</strong>. No
                  almacenamos tus credenciales ni enviamos tus datos a ningún servidor externo.
                </p>
                <a
                  href="https://github.com/FacundoMalgieri/garca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
                >
                  Ver código en GitHub
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SUPPORT SECTION ========== */}
      <section ref={supportSectionRef} className="relative py-32 md:py-40 overflow-hidden">
        <div 
          className="relative max-w-2xl mx-auto px-6 text-center"
          style={{
            // Entry: emerge from below (progress 0->0.25)
            // Exit: lift up fast like Hero (progress 0.6->1)
            transform: `translateY(${
              supportProgress < 0.25
                ? (1 - supportProgress / 0.25) * 80 // Enter from 80px below
                : supportProgress > 0.6
                  ? -((supportProgress - 0.6) / 0.4) * 200 // Exit - lift up 200px
                  : 0
            }px)`,
            opacity: 
              supportProgress < 0.25
                ? supportProgress / 0.25 // Fade in
                : supportProgress > 0.6
                  ? Math.max(0, 1 - (supportProgress - 0.6) / 0.5) // Fade out slower
                  : 1,
          }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-amber-500/25">
            Open Source
          </span>

          {/* Title */}
          <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Apoyá el proyecto
          </h2>

          {/* Description */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            GARCA es gratis y open source. Si te ahorra tiempo, considerá apoyar el desarrollo.
          </p>

          {/* Buttons - animate in from sides when visible */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://paypal.me/facundomalgieri"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0070ba] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#0070ba]/20 hover:shadow-2xl hover:shadow-[#0070ba]/40 transition-all duration-700 ease-out cursor-pointer overflow-hidden hover:scale-105"
              style={{
                opacity: supportVisible ? 1 : 0,
                transform: supportVisible 
                  ? "translateX(0) rotate(0deg)" 
                  : "translateX(-100px) rotate(-10deg)",
              }}
            >
              <div className="absolute inset-0 bg-[#005ea6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_70%)]" />
              <PayPalIcon className="relative h-5 w-5" />
              <span className="relative">Donar con PayPal</span>
            </a>
            <a
              href="https://buymeacoffee.com/facundo.malgieri"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFDD00] px-6 py-4 text-sm font-semibold text-black shadow-xl shadow-[#FFDD00]/20 hover:shadow-2xl hover:shadow-[#FFDD00]/40 transition-all duration-700 ease-out cursor-pointer overflow-hidden hover:scale-105"
              style={{
                opacity: supportVisible ? 1 : 0,
                transform: supportVisible 
                  ? "translateX(0) rotate(0deg)" 
                  : "translateX(100px) rotate(10deg)",
                transitionDelay: "100ms",
              }}
            >
              <div className="absolute inset-0 bg-[#e5c700] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_70%)]" />
              <img src="/icons/bmc-logo.svg" alt="BMC" className="relative h-5 w-5" />
              <span className="relative">Buy me a coffee</span>
            </a>
          </div>

          {/* GitHub note */}
          <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
            También podés dejar una ⭐ en{" "}
            <a
              href="https://github.com/FacundoMalgieri/garca"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
