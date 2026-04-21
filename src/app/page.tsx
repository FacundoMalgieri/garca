"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ArrowRightIcon,
  GitHubSponsorsIcon,
  LoadingSpinner,
  PayPalIcon,
  PlayIcon,
  SparklesIcon,
} from "@/components/ui/icons";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { mockInvoices } from "@/test/mocks/invoices";
import type { MonotributoAFIPInfo } from "@/types/afip-scraper";

const STORAGE_KEY = "garca_invoices";
const COMPANY_STORAGE_KEY = "garca_company";
const MONOTRIBUTO_STORAGE_KEY = "garca_monotributo";

const DEMO_COMPANY = {
  cuit: "20345678901",
  razonSocial: "Tecnología Innovadora SRL (Demo)",
};

// Helper to get next recategorization date (January or July)
const getNextRecategorizacion = (): string => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();
  
  // Recategorization periods: January (0) and July (6)
  if (currentMonth < 6) {
    // Before July -> next is July of current year
    return `Julio ${currentYear}`;
  } else {
    // July or later -> next is January of next year
    return `Enero ${currentYear + 1}`;
  }
};

// Demo Monotributo info - simulates data scraped from AFIP
const DEMO_MONOTRIBUTO_INFO: MonotributoAFIPInfo = {
  categoria: "G",
  tipoActividad: "servicios",
  actividadDescripcion: "LOCACIONES DE SERVICIOS",
  proximaRecategorizacion: getNextRecategorizacion(),
  nombreCompleto: "TECNOLOGÍA INNOVADORA SRL",
  cuit: "20345678901",
};

// FAQ data
const FAQ_ITEMS = [
  {
    question: "¿Para qué sirve GARCA?",
    answer: "GARCA te permite consultar y exportar los comprobantes que tenés en 'Comprobantes en línea' de ARCA de forma rápida y sencilla. También calcula automáticamente tu categoría de Monotributo según tus ingresos acumulados, ayudándote a saber si tenés que recategorizarte.",
  },
  {
    question: "¿Es seguro ingresar mis credenciales de ARCA?",
    answer: "Sí. Tus credenciales se cifran en el navegador con AES-256 antes de viajar al backend de GARCA, que las usa únicamente para conectarse a ARCA (ex AFIP) en tu nombre durante esa sesión. Nunca quedan guardadas en ningún servidor ni base de datos y los comprobantes que devuelve la consulta se almacenan solo en el navegador (localStorage). Podés verificar el código fuente en GitHub.",
  },
  {
    question: "¿Guardan mis datos o contraseñas?",
    answer: "No. GARCA no tiene base de datos que almacene credenciales ni comprobantes: las credenciales viajan cifradas y se descartan al terminar la consulta; los comprobantes se guardan localmente en tu navegador. Cuando cerrás la sesión, podés borrar todos los datos.",
  },
  {
    question: "¿Por qué tarda en cargar mis comprobantes?",
    answer: "ARCA no tiene una API pública, así que GARCA usa web scraping para navegar por el portal y extraer tus datos, similar a como lo harías manualmente. Dependiendo de la cantidad de comprobantes y la velocidad de ARCA, puede tomar entre 30 segundos y 2 minutos.",
  },
  {
    question: "¿Funciona con cualquier tipo de contribuyente?",
    answer: "Actualmente GARCA está optimizado para Monotributistas. Lee únicamente los comprobantes disponibles en 'Comprobantes en línea' de ARCA. Si tenés otro tipo de situación fiscal, puede que algunas funciones no estén disponibles.",
  },
  {
    question: "¿Cómo puedo planificar mi facturación para no cambiar de categoría?",
    answer: "GARCA incluye una herramienta de Proyección Inteligente que te permite calcular cuánto podés facturar cada mes para mantenerte en tu categoría objetivo. Podés simular diferentes escenarios, configurar un margen de seguridad y ver en tiempo real cómo impactan en tu próxima recategorización.",
  },
  {
    question: "¿Puedo exportar los datos para mi contador?",
    answer: "¡Sí! Podés exportar tus comprobantes a Excel (CSV), JSON o PDF. El PDF incluye gráficos y un resumen de tu situación en Monotributo, ideal para compartir con tu contador.",
  },
  {
    question: "¿Es gratis?",
    answer: "Sí, GARCA es 100% gratis y open source. Si te resulta útil y querés apoyar el desarrollo, podés hacer una donación voluntaria o dejar una estrella en GitHub.",
  },
  {
    question: "¿Qué pasa si AFIP cambia su página?",
    answer: "Como GARCA depende de la estructura del portal de AFIP, cambios en su sitio pueden afectar el funcionamiento. El proyecto se mantiene activamente, así que ante cualquier problema, revisá si hay actualizaciones o reportá el issue en GitHub.",
  },
  {
    question: "¿Necesito instalar algo?",
    answer: "No, GARCA es 100% web. Funciona directamente desde el navegador sin necesidad de instalar ningún programa, extensión o aplicación. Solo necesitás una conexión a internet.",
  },
  {
    question: "¿Funciona en celular?",
    answer: "Sí, GARCA está optimizado para funcionar en dispositivos móviles. Podés consultar y exportar tus comprobantes desde tu celular o tablet sin problemas.",
  },
  {
    question: "¿Puedo usar GARCA para varias empresas?",
    answer: "Sí, podés ingresar con diferentes CUITs. Sin embargo, los datos se guardan por sesión, así que si querés cambiar de empresa tenés que volver a ingresar con las credenciales correspondientes.",
  },
  {
    question: "¿Qué hago si me da error?",
    answer: "Primero verificá que tus credenciales de ARCA sean correctas. Si el error persiste, puede ser que ARCA esté experimentando problemas (suele pasar). Esperá unos minutos e intentá de nuevo. Si sigue fallando, podés reportar el problema en GitHub.",
  },
];

// Monotributo guides featured on the homepage resources section.
// Three hand-picked reads that work as an "editorial highlights" — the full
// catalogue lives at /guias, so this is just a teaser.
const MONOTRIBUTO_GUIDES = [
  {
    href: "/monotributo/recategorizacion",
    category: "Trámite",
    title: "Recategorización paso a paso",
    description: "Cuándo corresponde, qué mira ARCA y qué pasa si no la hacés en enero o julio.",
    readingTime: "5 min de lectura",
    accent: "from-indigo-500 to-blue-500",
    accentText: "text-indigo-700 dark:text-indigo-300",
    chip: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-200 ring-indigo-200 dark:ring-indigo-800/60",
  },
  {
    href: "/monotributo/vs-responsable-inscripto",
    category: "Comparativa",
    title: "Monotributo vs Responsable Inscripto",
    description: "IVA, Ganancias, obligaciones formales y cuándo conviene dar el salto de régimen.",
    readingTime: "7 min de lectura",
    accent: "from-teal-500 to-cyan-500",
    accentText: "text-teal-700 dark:text-teal-300",
    chip: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-200 ring-teal-200 dark:ring-teal-800/60",
  },
  {
    href: "/monotributo/que-pasa-si-me-paso",
    category: "Caso límite",
    title: "¿Qué pasa si me paso del tope?",
    description: "Recategorización de oficio, exclusión del régimen y cómo volver si ya te excluyeron.",
    readingTime: "6 min de lectura",
    accent: "from-amber-500 to-orange-500",
    accentText: "text-amber-700 dark:text-amber-300",
    chip: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-200 ring-amber-200 dark:ring-amber-800/60",
  },
];

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
  const featuresSectionRef = useRef<HTMLElement>(null);
  const calcSectionRef = useRef<HTMLElement>(null);
  const monotribSectionRef = useRef<HTMLElement>(null);
  const currencySectionRef = useRef<HTMLElement>(null);
  const supportSectionRef = useRef<HTMLElement>(null);
  const faqSectionRef = useRef<HTMLElement>(null);

  // All sections use scroll progress for enter + exit effects
  const featuresProgress = useSectionProgress(featuresSectionRef);
  const calcProgress = useSectionProgress(calcSectionRef);
  const monotribProgress = useSectionProgress(monotribSectionRef);
  const currencyProgress = useSectionProgress(currencySectionRef);
  const supportProgress = useSectionProgress(supportSectionRef);
  const faqProgress = useSectionProgress(faqSectionRef);

  // Visibility triggers for entry animations (badges, buttons)
  const calcVisible = useSectionVisible(calcSectionRef, 0.3);
  const monotribVisible = useSectionVisible(monotribSectionRef, 0.2);
  const currencyVisible = useSectionVisible(currencySectionRef, 0.4);
  const supportVisible = useSectionVisible(supportSectionRef, 0.4);
  const faqVisible = useSectionVisible(faqSectionRef, 0.2);

  // FAQ accordion state - null means all closed, number is the open index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Detect if mobile for responsive parallax behavior
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Normal scroll tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasInvoices = state.invoices.length > 0;
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  const handleDemoClick = () => {
    if (hasInvoices) {
      setShowDemoConfirm(true);
    } else {
      handleLoadDemo();
    }
  };

  const handleLoadDemo = () => {
    setIsLoadingDemo(true);
    try {
      // Adjust demo invoice dates to be relative to today
      // The mock data covers Jan-Nov 2025, we shift it so the latest invoice is recent
      const adjustedInvoices = mockInvoices.map((invoice) => {
        // Parse DD/MM/YYYY format
        const [day, month, year] = invoice.fecha.split("/");
        const originalDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        // Calculate how many months to shift (from Nov 2025 to current month)
        const today = new Date();
        const lastMockDate = new Date(2025, 10, 28); // Nov 28, 2025
        const monthDiff = (today.getFullYear() - lastMockDate.getFullYear()) * 12 + 
                          (today.getMonth() - lastMockDate.getMonth());
        
        // Shift the date by the calculated months
        const adjustedDate = new Date(originalDate);
        adjustedDate.setMonth(adjustedDate.getMonth() + monthDiff);
        
        // Format back to DD/MM/YYYY
        const newFecha = `${String(adjustedDate.getDate()).padStart(2, "0")}/${String(adjustedDate.getMonth() + 1).padStart(2, "0")}/${adjustedDate.getFullYear()}`;
        
        return {
          ...invoice,
          fecha: newFecha,
          xmlData: invoice.xmlData ? { ...invoice.xmlData, fecha: newFecha } : undefined,
        };
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adjustedInvoices));
      localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(DEMO_COMPANY));
      localStorage.setItem(MONOTRIBUTO_STORAGE_KEY, JSON.stringify(DEMO_MONOTRIBUTO_INFO));
      loadFromStorage();
      router.push("/panel");
    } catch (error) {
      console.error("Error loading demo data:", error);
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className="relative overflow-x-hidden bg-background">
      <ConfirmDialog
        isOpen={showDemoConfirm}
        onClose={() => setShowDemoConfirm(false)}
        onConfirm={() => { setShowDemoConfirm(false); handleLoadDemo(); }}
        title="¿Cargar datos de demo?"
        description="Se reemplazarán los datos de tu reporte actual con datos ficticios. Para recuperar tus datos reales tendrás que volver a ingresar con tu clave fiscal."
        confirmText="Sí, cargar demo"
        cancelText="Cancelar"
        variant="destructive"
      />

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

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white animate-hero-entry-1">
              Bienvenido a GARCA
            </h1>

            {/* Subtitle - third to appear */}
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-4 font-medium animate-hero-entry-2">
              Gestor Automático de Recuperación de Comprobantes de ARCA
            </p>

            {/* Description - fourth to appear */}
            <p className="max-w-xl mx-auto text-sm md:text-base text-slate-600 dark:text-slate-400 mb-10 leading-relaxed animate-hero-entry-3">
              La herramienta más <span className="font-semibold text-slate-700 dark:text-slate-300">simple</span> y{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">segura</span> para visualizar tus
              comprobantes de ARCA y calcular tu categoría de Monotributo 2026.
            </p>

            {/* CTA Buttons - fifth to appear */}
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

              <button
                onClick={handleDemoClick}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-muted/50 backdrop-blur-sm border border-slate-200 dark:border-border text-xs text-slate-600 dark:text-muted-foreground hover:scale-105 transition-transform duration-300 animate-hero-entry-5">
              <SparklesIcon />
              <span>Probá con datos ficticios sin loguearte</span>
            </div>
          </div>
        </div>

      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section ref={featuresSectionRef} className="relative py-32 md:py-40 overflow-hidden bg-background">
        {/* Entire section content with parallax entry/exit */}
        <div 
          className="relative max-w-6xl mx-auto px-6"
          style={
            isMobile
              ? {
                  // Mobile: use progress-based parallax (responsive to section height)
                  transform: `translateY(${
                    featuresProgress < 0.1
                      ? (1 - featuresProgress / 0.1) * 60
                      : featuresProgress > 0.9
                        ? -((featuresProgress - 0.9) / 0.1) * 150
                        : 0
                  }px)`,
                  opacity:
                    featuresProgress === 0
                      ? 1
                      : featuresProgress < 0.1
                        ? Math.max(0.3, featuresProgress / 0.1)
                        : featuresProgress > 0.9
                          ? Math.max(0, 1 - (featuresProgress - 0.9) / 0.15)
                          : 1,
                }
              : {
                  // Desktop/Tablet: use hardcoded scrollY values (original behavior)
                  transform: `translateY(${
                    scrollY < 400
                      ? Math.max(0, (400 - scrollY) * 0.15)
                      : scrollY > 1100
                        ? (scrollY - 1100) * -0.8
                        : 0
                  }px)`,
                  opacity:
                    scrollY === 0
                      ? 1
                      : scrollY < 200
                        ? Math.max(0.3, scrollY / 200)
                        : scrollY > 1100
                          ? Math.max(0, 1 - (scrollY - 1100) / 400)
                          : 1,
                }
          }
        >
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow duration-300">
              <SparklesIcon />
              Funcionalidades
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Todo lo que necesitás
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-400 max-w-lg mx-auto">
              Herramientas poderosas para gestionar tu facturación de forma eficiente
            </p>
          </div>

          {/* Features grid */}
          <FeaturesGrid scrollY={scrollY} />
        </div>
      </section>

      {/* ========== CURRENCIES SECTION ========== */}
      <section ref={currencySectionRef} className="relative pt-0 pb-24 md:pb-32 -mt-16 md:-mt-24 overflow-hidden">
        <div
          className="relative max-w-4xl mx-auto px-6 text-center"
          style={{
            transform: `translateY(${
              currencyProgress < 0.25
                ? (1 - currencyProgress / 0.25) * 80
                : currencyProgress > 0.6
                  ? -((currencyProgress - 0.6) / 0.4) * 200
                  : 0
            }px)`,
            opacity:
              currencyProgress < 0.25
                ? currencyProgress / 0.25
                : currencyProgress > 0.6
                  ? Math.max(0, 1 - (currencyProgress - 0.6) / 0.5)
                  : 1,
          }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-green-500/25">
            Multi-moneda
          </span>

          {/* Title */}
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
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
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${currencyColors[color]} border backdrop-blur-sm cursor-default hover:scale-110 hover:shadow-lg transition-all duration-700 ease-out`}
                style={{
                  width: "114px",
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

          <p className="text-sm text-slate-600 dark:text-slate-400">
            y más...
          </p>
        </div>
      </section>

      {/* ========== CALCULATOR CTA SECTION ========== */}
      <section ref={calcSectionRef} className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="relative max-w-3xl mx-auto px-6"
          style={{
            transform: `translateY(${
              calcProgress < 0.25
                ? (1 - calcProgress / 0.25) * 80
                : calcProgress > 0.6
                  ? -((calcProgress - 0.6) / 0.4) * 200
                  : 0
            }px)`,
            opacity:
              calcProgress < 0.25
                ? calcProgress / 0.25
                : calcProgress > 0.6
                  ? Math.max(0, 1 - (calcProgress - 0.6) / 0.5)
                  : 1,
          }}
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-8 md:p-10 overflow-hidden shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none hover:shadow-[0_12px_50px_-8px_rgba(59,130,246,0.35)] transition-shadow duration-500">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

            <div className="relative text-center">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-blue-500/25 transition-all duration-700"
                style={{
                  opacity: calcVisible ? 1 : 0,
                  transform: calcVisible ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <path d="M8 6h8M8 10h8M8 14h3M8 18h3M14 14h2M14 18h2" />
                </svg>
                Herramienta gratuita
              </span>

              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Calculadora de Monotributo 2026
              </h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
                Ingresá tu facturación mes a mes y descubrí en qué categoría vas a quedar en tu próxima recategorización.
                Planificá cuánto podés facturar para no pasarte de categoría. <strong className="text-slate-800 dark:text-slate-200">Sin login, sin registrarte.</strong>
              </p>

              <div
                className="flex items-center justify-center transition-all duration-700"
                style={{
                  opacity: calcVisible ? 1 : 0,
                  transform: calcVisible ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: "200ms",
                }}
              >
                <Link
                  href="/calculadora-monotributo"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative">Abrir calculadora</span>
                  <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                {["Tabla de categorías actualizada", "Cuota mensual por actividad", "Proyección inteligente"].map(text => (
                  <span key={text} className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {text}
                  </span>
                ))}
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
            transform: `translateY(${
              supportProgress < 0.25
                ? (1 - supportProgress / 0.25) * 80
                : supportProgress > 0.6
                  ? -((supportProgress - 0.6) / 0.4) * 200
                  : 0
            }px)`,
            opacity:
              supportProgress < 0.25
                ? supportProgress / 0.25
                : supportProgress > 0.6
                  ? Math.max(0, 1 - (supportProgress - 0.6) / 0.5)
                  : 1,
          }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-amber-500/25">
            Open Source
          </span>

          {/* Title */}
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Apoyá el proyecto
          </h2>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            GARCA es gratis y open source. Si te ahorra tiempo, considerá apoyar el desarrollo.
          </p>

          {/* Buttons - animate in when visible */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/sponsors/FacundoMalgieri"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ea4aaa] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#ea4aaa]/20 hover:shadow-2xl hover:shadow-[#ea4aaa]/40 transition-all duration-700 ease-out cursor-pointer overflow-hidden hover:scale-105"
              style={{
                opacity: supportVisible ? 1 : 0,
                transform: supportVisible
                  ? "translateX(0) rotate(0deg)"
                  : "translateX(-100px) rotate(-10deg)",
              }}
            >
              <div className="absolute inset-0 bg-[#d63f99] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_70%)]" />
              <GitHubSponsorsIcon className="relative h-5 w-5" />
              <span className="relative">Sponsor</span>
            </a>
            <a
              href="https://paypal.me/facundomalgieri"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0070ba] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#0070ba]/20 hover:shadow-2xl hover:shadow-[#0070ba]/40 transition-all duration-700 ease-out cursor-pointer overflow-hidden hover:scale-105"
              style={{
                opacity: supportVisible ? 1 : 0,
                transform: supportVisible
                  ? "translateX(0) rotate(0deg)"
                  : "translateX(0px)",
                transitionDelay: "100ms",
              }}
            >
              <div className="absolute inset-0 bg-[#005ea6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_70%)]" />
              <PayPalIcon className="relative h-5 w-5" />
              <span className="relative">PayPal</span>
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
                transitionDelay: "200ms",
              }}
            >
              <div className="absolute inset-0 bg-[#e5c700] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_70%)]" />
              <img src="/icons/bmc-logo.svg" alt="BMC" className="relative h-5 w-5" />
              <span className="relative">Buy me a coffee</span>
            </a>
          </div>

          {/* GitHub note */}
          <p className="mt-6 text-xs text-slate-600 dark:text-slate-400">
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

      {/* ========== MONOTRIBUTO RESOURCES SECTION ========== */}
      <section
        ref={monotribSectionRef}
        id="monotributo-guias"
        className="relative py-24 md:py-32 overflow-hidden"
      >
        <div
          className="relative max-w-5xl mx-auto px-6"
          style={{
            transform: `translateY(${
              monotribProgress < 0.2
                ? (1 - monotribProgress / 0.2) * 60
                : monotribProgress > 0.75
                  ? -((monotribProgress - 0.75) / 0.25) * 150
                  : 0
            }px)`,
            opacity:
              monotribProgress < 0.2
                ? monotribProgress / 0.2
                : monotribProgress > 0.75
                  ? Math.max(0, 1 - (monotribProgress - 0.75) / 0.35)
                  : 1,
          }}
        >
          <div className="text-center mb-12">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-indigo-500/25 transition-all duration-700"
              style={{
                opacity: monotribVisible ? 1 : 0,
                transform: monotribVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Guías y recursos
            </span>
            <h2
              className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-all duration-700"
              style={{
                opacity: monotribVisible ? 1 : 0,
                transform: monotribVisible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: "100ms",
              }}
            >
              Todo sobre Monotributo 2026
            </h2>
            <p
              className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-all duration-700"
              style={{
                opacity: monotribVisible ? 1 : 0,
                transform: monotribVisible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: "200ms",
              }}
            >
              Artículos y guías para entender el régimen, planificar tu año y resolver las dudas más
              comunes. Datos tomados directo de ARCA y actualizados cada semestre.
            </p>
          </div>

          {/* Featured reference card — `/monotributo` is the canonical entry
              point for the topic (highest search-volume keyword) and the page
              with the comprehensive categorías table. It gets a hero-style
              treatment to sit above the short-reads list below. */}
          <Link
            href="/monotributo"
            className="group relative overflow-hidden block rounded-3xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 p-6 md:p-8 mb-8 md:mb-10 hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-0.5 transition-all shadow-[0_8px_40px_-8px_rgba(59,130,246,0.20)] dark:shadow-none"
            style={{
              opacity: monotribVisible ? 1 : 0,
              transform: monotribVisible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out, box-shadow 300ms ease-out",
              transitionDelay: "250ms",
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-400/25 to-indigo-400/25 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" aria-hidden />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2 pointer-events-none" aria-hidden />

            <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[11px] font-bold uppercase tracking-wider mb-3 shadow-sm">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Fundamentos
                </span>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                  Monotributo 2026: categorías, cuotas y topes
                </h3>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4 max-w-2xl">
                  La página de referencia completa: las 11 categorías vigentes de la A a la K con sus
                  cuotas mensuales, topes de facturación anual y desglose de aportes. Datos oficiales de ARCA.
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                    11 categorías
                  </span>
                  <span className="text-slate-300 dark:text-slate-600" aria-hidden>·</span>
                  <span>de la A a la K</span>
                  <span className="text-slate-300 dark:text-slate-600" aria-hidden>·</span>
                  <span>actualizado cada semestre</span>
                </div>
              </div>
              <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all shrink-0 self-start md:self-center whitespace-nowrap">
                Abrir guía completa
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Short-reads section label — signals these are curated articles that
              complement the main reference page above. */}
          <div
            className="flex items-center gap-3 mb-4"
            style={{
              opacity: monotribVisible ? 1 : 0,
              transform: monotribVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "320ms",
            }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              Lecturas cortas
            </p>
            <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700/60" aria-hidden />
          </div>

          {/* Editorial list layout — intentionally different from the features grid
              above. Each row reads like an article preview in a premium magazine. */}
          <ol className="flex flex-col gap-3 mb-8">
            {MONOTRIBUTO_GUIDES.map((guide, index) => {
              const number = String(index + 1).padStart(2, "0");
              return (
                <li
                  key={guide.href}
                  style={{
                    opacity: monotribVisible ? 1 : 0,
                    transform: monotribVisible ? "translateY(0)" : "translateY(24px)",
                    transition: "opacity 700ms ease-out, transform 700ms ease-out",
                    transitionDelay: `${300 + index * 90}ms`,
                  }}
                >
                  <Link
                    href={guide.href}
                    className="group relative flex items-stretch gap-5 md:gap-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-4 sm:px-6 py-5 md:py-6 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <div
                      className={`w-1 rounded-full bg-gradient-to-b ${guide.accent} opacity-80 group-hover:opacity-100 transition-opacity`}
                      aria-hidden
                    />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <span
                        className={`font-mono text-3xl md:text-4xl font-bold bg-gradient-to-br ${guide.accent} bg-clip-text text-transparent leading-none shrink-0 tabular-nums`}
                        aria-hidden
                      >
                        {number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${guide.chip}`}
                          >
                            {guide.category}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {guide.readingTime}
                          </span>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {guide.description}
                        </p>
                      </div>
                      <span
                        className={`self-end sm:self-center text-xs font-semibold ${guide.accentText} inline-flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform`}
                      >
                        Leer
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div
            className="text-center transition-all duration-700"
            style={{
              opacity: monotribVisible ? 1 : 0,
              transform: monotribVisible ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "700ms",
            }}
          >
            <Link
              href="/guias"
              className="group inline-flex items-center gap-2 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Ver todas las guías
              <ArrowRightIcon className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section ref={faqSectionRef} id="faq" className="relative py-24 md:py-32 overflow-hidden">
        <div 
          className="max-w-3xl mx-auto px-6"
          style={{
            // Entry: emerge from below (progress 0->0.2)
            // Exit: lift up (progress 0.7->1)
            transform: `translateY(${
              faqProgress < 0.2
                ? (1 - faqProgress / 0.2) * 60 // Enter from 60px below
                : faqProgress > 0.7
                  ? -((faqProgress - 0.7) / 0.3) * 150 // Exit - lift up 150px
                  : 0
            }px)`,
            opacity: 
              faqProgress < 0.2
                ? faqProgress / 0.2 // Fade in
                : faqProgress > 0.7
                  ? Math.max(0, 1 - (faqProgress - 0.7) / 0.4) // Fade out slower
                  : 1,
          }}
        >
          {/* Section header */}
          <div className="text-center mb-12">
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium mb-4 transition-all duration-700"
              style={{
                opacity: faqVisible ? 1 : 0,
                transform: faqVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              Preguntas frecuentes
            </span>
            <h2 
              className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white transition-all duration-700"
              style={{
                opacity: faqVisible ? 1 : 0,
                transform: faqVisible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: "100ms",
              }}
            >
              ¿Tenés dudas?
            </h2>
          </div>

          {/* FAQ Items - staggered entrance */}
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
                  style={{
                    opacity: faqVisible ? 1 : 0,
                    transform: faqVisible 
                      ? "translateY(0) scale(1)" 
                      : `translateY(30px) scale(0.98)`,
                    transitionDelay: `${200 + index * 75}ms`,
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <span>{faq.question}</span>
                    <span 
                      className="shrink-0 text-slate-400 transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                  <div 
                    className="grid transition-all duration-300 ease-out"
                    style={{ 
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
