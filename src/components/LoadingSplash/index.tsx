"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface LoadingSplashProps {
  isLoading: boolean;
  message?: string;
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

export function LoadingSplash({ isLoading, message = "Cargando" }: LoadingSplashProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
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
          <div
            className="h-full bg-primary animate-[shimmer_2s_ease-in-out_infinite]"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
              width: "50%",
            }}
          />
        </div>

        {/* Tips */}
        <div
          className={`rounded-lg border border-border bg-card p-6 transition-opacity duration-300 h-[160px] ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-start gap-3 text-left h-full">
            <div className="flex-shrink-0 mt-0.5">
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

