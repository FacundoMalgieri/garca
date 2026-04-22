"use client";

import { useEffect, useState } from "react";

// Small client wrapper so the hero content can be authored as a Server
// Component (static HTML) and still receive the scroll-driven translate/opacity
// effect on the client. This keeps the LCP <p> inside the hero server-rendered
// while the parallax stays interactive.
export function HeroParallax({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto px-6 py-12 md:py-16"
      style={{
        transform: `translateY(${scrollY * -0.8}px)`,
        opacity: Math.max(0, 1 - scrollY / 800),
      }}
    >
      {children}
    </div>
  );
}
