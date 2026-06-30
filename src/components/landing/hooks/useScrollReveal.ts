// src/components/landing/hooks/useScrollReveal.ts
"use client";

import { useEffect, useState } from "react";

/**
 * True una vez que la sección entra al viewport. One-shot: no resetea al salir,
 * así las reveals no se vuelven a reproducir al scrollear hacia arriba.
 */
export function useSectionVisible(ref: React.RefObject<HTMLElement | null>, threshold = 0.3) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const el = ref.current;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // one-shot: queda revelada
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isVisible;
}
