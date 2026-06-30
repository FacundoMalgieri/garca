// src/components/landing/hooks/useScrollReveal.ts
"use client";

import { useEffect, useState } from "react";

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
