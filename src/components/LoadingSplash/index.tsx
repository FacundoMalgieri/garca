"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GitHubIcon, PayPalIcon } from "@/components/ui/icons";
import type { ScraperProgress } from "@/hooks/useInvoices";

interface LoadingSplashProps {
  isLoading: boolean;
  message?: string;
  progress?: ScraperProgress | null;
}

const tips = [
  {
    title: "¿Qué es GARCA?",
    text: "GARCA es un software que hace scraping automático del portal de ARCA para recuperar tus comprobantes de forma segura.",
  },
  {
    title: "100% Privado",
    text: "Tus datos nunca salen de tu navegador. Todo el procesamiento se realiza localmente en tu dispositivo.",
  },
  {
    title: "Credenciales Seguras",
    text: "Tus credenciales se encriptan antes de ser enviadas y nunca se almacenan en ningún servidor.",
  },
  {
    title: "Sin límites",
    text: "Consultá hasta 1 año de facturas en una sola búsqueda. Podés repetir el proceso cuantas veces quieras.",
  },
  {
    title: "Múltiples monedas",
    text: "Soporta facturas en ARS y USD. Para facturas E, extraemos automáticamente el tipo de cambio oficial.",
  },
  {
    title: "Cálculo automático",
    text: "GARCA calcula automáticamente tu categoría de Monotributo basándose en tus ingresos anuales.",
  },
  {
    title: "Exportación fácil",
    text: "Podés exportar todas tus facturas a formato PDF, CSV o JSON para análisis o respaldo.",
  },
  {
    title: "Filtros inteligentes",
    text: "Ordená y filtrá tus facturas por fecha, tipo, moneda y monto para encontrar lo que necesitás rápidamente.",
  },
  {
    title: "Gráficos interactivos",
    text: "Visualizá tus ingresos con gráficos de barras y tortas para entender mejor tu facturación.",
  },
  {
    title: "Almacenamiento local",
    text: "Los datos se guardan en localStorage de tu navegador. Solo vos tenés acceso a ellos y podes eliminarlos en cualquier momento.",
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function LoadingSplash({ isLoading, message = "Cargando", progress }: LoadingSplashProps) {
  const shuffledTips = useMemo(() => shuffleArray(tips), []);

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToTip = useCallback(
    (index: number) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setFadeIn(false);
      setTimeout(() => {
        setCurrentTipIndex(index);
        setFadeIn(true);
      }, 300);

      intervalRef.current = setInterval(() => {
        setFadeIn(false);
        setTimeout(() => {
          setCurrentTipIndex((prev) => (prev + 1) % shuffledTips.length);
          setFadeIn(true);
        }, 300);
      }, 5000);
    },
    [shuffledTips.length]
  );

  useEffect(() => {
    if (!isLoading) return;

    const html = document.documentElement;
    const body = document.body;
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    intervalRef.current = setInterval(() => {
      setFadeIn(false);

      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % shuffledTips.length);
        setFadeIn(true);
      }, 300);
    }, 5000);

    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading, shuffledTips.length]);

  if (!isLoading) return null;

  const currentTip = shuffledTips[currentTipIndex];

  return (
    <div id="loading-splash" className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-6 text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <img src="/logo-icon.svg" alt="GARCA Logo" className="h-24 w-24 animate-pulse" />
            <div className="absolute inset-0 -m-3">
              <div 
                className="h-[120px] w-[120px] rounded-full border-4 animate-spin"
                style={{
                  borderColor: "rgba(100, 211, 222, 0.2)",
                  borderTopColor: "#64D3DE",
                }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">{message}</h2>
          <p className="text-sm text-muted-foreground">Esto puede tardar unos momentos...</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          {progress ? (
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progress.progress}%`,
                backgroundColor: "#64D3DE",
              }}
            />
          ) : (
            <div
              className="h-full animate-[shimmer_2s_ease-in-out_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent, #64D3DE, transparent)",
                width: "50%",
              }}
            />
          )}
        </div>

        {/* Scraper progress message */}
        {progress && progress.message && (
          <div className="text-sm text-foreground font-medium animate-pulse">
            {progress.message}
          </div>
        )}

        {/* Tips */}
        <div
          className={`rounded-lg border border-border bg-card p-6 transition-opacity duration-300 h-[160px] shadow-md dark:shadow-none ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-start gap-3 text-left h-full">
            <div className="shrink-0 mt-0.5">
              <InfoIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{currentTip.title}</h3>
              <p className="text-sm text-muted-foreground">{currentTip.text}</p>
            </div>
          </div>
        </div>

        {/* Tip indicators */}
        <div className="flex justify-center gap-1.5">
          {shuffledTips.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTip(index)}
              className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: index === currentTipIndex ? "2rem" : "0.375rem",
                backgroundColor: index === currentTipIndex ? "#64D3DE" : "rgba(100, 211, 222, 0.3)",
              }}
              aria-label={`Ver tip ${index + 1}`}
            />
          ))}
        </div>

        {/* Support callout */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3">
            <span className="sm:hidden">Servidor gratuito = puede tardar. ¿Querés ayudar?</span>
            <span className="hidden sm:block">GARCA corre en un servidor gratuito, por eso puede tardar un poco. Si querés ayudar a mejorar la velocidad, considerá apoyar el proyecto.</span>
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <a
              href="https://paypal.me/facundomalgieri"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-24 sm:w-28 py-1.5 rounded-lg bg-[#003087] text-white text-xs font-medium hover:bg-[#003087]/90 transition-colors"
            >
              <PayPalIcon className="h-4 w-4" />
              PayPal
            </a>
            <a
              href="https://buymeacoffee.com/facundo.malgieri"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-24 sm:w-28 py-1.5 rounded-lg bg-[#FFDD00] text-black text-xs font-medium hover:bg-[#FFDD00]/90 transition-colors"
            >
              <img src="/icons/bmc-logo.svg" alt="" className="h-4 w-4" />
              Coffee
            </a>
            <a
              href="https://github.com/FacundoMalgieri/garca"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-24 sm:w-28 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              <GitHubIcon className="h-4 w-4" />
              ⭐ Star
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5 text-primary dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

