"use client";

import { useEffect, useState } from "react";

// Small client wrapper so the hero content can be authored as a Server
// Component (static HTML) and still receive the scroll-driven translate/opacity
// effect on the client. This keeps the LCP <p> inside the hero server-rendered
// while the parallax stays interactive.
export function HeroParallax({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  // El fade/translate sólo tiene sentido en desktop, donde el hero entra en el
  // viewport. En mobile el hero es más alto que el VH (columnas apiladas), así
  // que el efecto haría que se oscurezca apenas empezás a scrollear hacia el
  // gráfico. Por eso lo desactivamos por debajo de lg.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkDesktop);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkDesktop);
    };
  }, []);

  return (
    <div
      className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 sm:py-12 md:py-16"
      style={
        isDesktop
          ? {
              transform: `translateY(${scrollY * -0.8}px)`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
