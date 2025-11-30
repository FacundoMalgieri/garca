"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChartIcon,
  ClipboardIcon,
  DocumentIcon,
  DownloadIcon,
  LockIcon,
  TrendingIcon,
} from "@/components/ui/landing-icons";

interface FeaturesGridProps {
  scrollY: number;
}

const CARD_ACTIVE_DURATION = 150; // Card stays lit for 150px of scroll after appearing

export function FeaturesGrid({ scrollY }: FeaturesGridProps) {
  const [isDesktop, setIsDesktop] = useState(true); // Default to desktop for SSR
  
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const features = [
    {
      icon: <DocumentIcon />,
      title: "Recuperación Automática",
      description: "Obtené todas tus facturas de ARCA, incluyendo exportación con tipo de cambio",
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/30",
    },
    {
      icon: <ChartIcon />,
      title: "Análisis Inteligente",
      description: "Visualizá ingresos por mes y año con conversión automática de divisas",
      gradient: "from-violet-500 to-purple-500",
      shadow: "shadow-violet-500/30",
    },
    {
      icon: <ClipboardIcon />,
      title: "Cálculo de Monotributo",
      description: "Conocé tu categoría actual y cuánto te falta para la siguiente",
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/30",
    },
    {
      icon: <LockIcon />,
      title: "100% Privado",
      description: "Todo funciona en tu navegador. Tus datos nunca salen de tu dispositivo",
      gradient: "from-emerald-500 to-green-500",
      shadow: "shadow-emerald-500/30",
    },
    {
      icon: <TrendingIcon />,
      title: "Gráficos Interactivos",
      description: "Progreso de Monotributo, distribución por moneda y más",
      gradient: "from-pink-500 to-rose-500",
      shadow: "shadow-pink-500/30",
    },
    {
      icon: <DownloadIcon />,
      title: "Exportación Completa",
      description: "Exportá a PDF profesional, CSV para Excel o JSON",
      gradient: "from-sky-500 to-indigo-500",
      shadow: "shadow-sky-500/30",
    },
  ];

  // Calculate parallax effect for when user scrolls past the section (desktop/tablet only)
  // On mobile, this is handled by the parent container
  const exitProgress = Math.max(0, (scrollY - 1100) / 400);
  const exitTransform = exitProgress * 100;
  const exitOpacity = Math.max(0, 1 - exitProgress * 0.8);

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      style={isDesktop ? {
        transform: `translateY(${-exitTransform}px)`,
        opacity: exitOpacity,
      } : undefined}
    >
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          gradient={feature.gradient}
          shadow={feature.shadow}
          scrollY={scrollY}
          index={index}
        />
      ))}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  shadow: string;
  scrollY: number;
  index: number;
}

function FeatureCard({ icon, title, description, gradient, shadow, scrollY, index }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [triggerScroll, setTriggerScroll] = useState<number | null>(null);
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop");

  // Detect device type: mobile (1 col), tablet (2 cols), desktop (3 cols)
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Calculate when this specific card should trigger
  const updateTriggerPoint = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;

      if (deviceType === "mobile") {
        // Mobile (1 col): trigger when card is 70% visible from bottom
        const trigger = elementTop - window.innerHeight * 0.7;
        setTriggerScroll(Math.max(0, trigger));
      } else {
        // Tablet & Desktop: use the grid's position as base, stagger by index
        const gridElement = cardRef.current.parentElement;
        if (gridElement) {
          const gridRect = gridElement.getBoundingClientRect();
          const gridTop = gridRect.top + scrollTop;

          // Base trigger: when grid enters viewport (earlier than before)
          // Using 0.7 means trigger starts when grid is 70% from top of viewport
          const baseTrigger = gridTop - window.innerHeight * 0.85;

          // Stagger based on device:
          // Desktop (3 cols): smaller stagger since cards are side by side
          // Tablet (2 cols): medium stagger
          const stagger = deviceType === "desktop" ? 50 : 60;
          const trigger = baseTrigger + index * stagger;

          setTriggerScroll(Math.max(0, trigger));
        }
      }
    }
  }, [deviceType, index]);

  useEffect(() => {
    updateTriggerPoint();
    window.addEventListener("resize", updateTriggerPoint);
    const timeout = setTimeout(updateTriggerPoint, 100);
    return () => {
      window.removeEventListener("resize", updateTriggerPoint);
      clearTimeout(timeout);
    };
  }, [updateTriggerPoint]);

  // Calculate animation progress
  const relativeScroll = triggerScroll !== null ? scrollY - triggerScroll : -1000;
  const appearProgress = Math.min(1, Math.max(0, (relativeScroll + 50) / 100));
  const isLit = relativeScroll >= 0 && relativeScroll <= CARD_ACTIVE_DURATION;

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-3xl bg-white dark:bg-muted/80 border p-6 h-[200px] overflow-hidden
        transition-[border-color,box-shadow,opacity,transform] duration-300 ease-out
        ${isLit ? `border-transparent shadow-2xl ${shadow}` : "border-slate-200 dark:border-border shadow-none"}
        hover:border-transparent hover:shadow-2xl
      `}
      style={{
        opacity: appearProgress,
        transform: `translateY(${(1 - appearProgress) * 40}px) scale(${0.9 + appearProgress * 0.1})`,
      }}
    >
      {/* Gradient border - shows when lit or on hover */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} transition-opacity duration-300
          ${isLit ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
      />
      {/* Inner background */}
      <div
        className={`absolute inset-[1px] rounded-[23px] transition-colors duration-300
          ${isLit ? "bg-slate-50 dark:bg-muted/90" : "bg-white dark:bg-background group-hover:bg-slate-50 dark:group-hover:bg-muted/90"}
        `}
      />

      <div className="relative">
        {/* Icon with gradient background */}
        <div
          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-xl transition-transform duration-300
            ${isLit ? "scale-110 rotate-3" : "group-hover:scale-110 group-hover:rotate-3"}
          `}
          style={{
            opacity: Math.min(1, appearProgress * 2),
            transform: appearProgress < 1 ? `scale(${0.7 + appearProgress * 0.3})` : undefined,
          }}
        >
          <div className="text-white">{icon}</div>
        </div>

        {/* Title - slides in from left */}
        <h3
          className="font-bold text-lg mb-2 text-slate-800 dark:text-white"
          style={{
            opacity: Math.min(1, Math.max(0, (appearProgress - 0.2) * 1.5)),
            transform: `translateX(${(1 - Math.min(1, Math.max(0, (appearProgress - 0.2) * 1.5))) * -20}px)`,
          }}
        >
          {title}
        </h3>

        {/* Description - slides in from left with more delay */}
        <p
          className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
          style={{
            opacity: Math.min(1, Math.max(0, (appearProgress - 0.4) * 1.8)),
            transform: `translateX(${(1 - Math.min(1, Math.max(0, (appearProgress - 0.4) * 1.8))) * -20}px)`,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
