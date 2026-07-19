// Layout wrapper for the hero content. Previously applied a scroll-driven
// translateY on desktop, but that moved the content upward at ~80% of scroll
// speed, visually canceling the hero's `position: sticky` pin — so the
// "curtain" overlap (the next section sliding up OVER the pinned hero) only
// read on mobile (where the transform was disabled). Removed so the overlap
// effect is identical on both viewports, matching the maria-alquezar/borop
// hero pattern.
export function HeroParallax({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 sm:py-12 md:py-16">
      {children}
    </div>
  );
}
