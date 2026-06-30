// src/components/landing/hooks/useScrollReveal.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Progreso de scroll (0..1) de una sección a medida que cruza el viewport.
 * Extraído de HomeSections para reuso entre las secciones de la landing.
 */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateProgress = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      const visibleStart = windowHeight;
      const visibleEnd = -sectionHeight;
      const currentPosition = rect.top;
      const totalRange = visibleStart - visibleEnd;
      const progressValue = (visibleStart - currentPosition) / totalRange;

      setProgress(Math.max(0, Math.min(1, progressValue)));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [ref]);

  return progress;
}

/**
 * True mientras la sección está intersectando el viewport (resetea al salir,
 * para animaciones repetibles). Extraído de HomeSections.
 */
export function useSectionVisible(ref: React.RefObject<HTMLElement | null>, threshold = 0.3) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isVisible;
}
