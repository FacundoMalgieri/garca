import "@testing-library/jest-dom";

// jsdom no implementa IntersectionObserver; lo usan los hooks de scroll-reveal
// de la landing (useScrollReveal / useSectionVisible).
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  class IntersectionObserverStub {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): [] {
      return [];
    }
  }

  const ctor = IntersectionObserverStub as unknown as typeof IntersectionObserver;
  (window as typeof globalThis).IntersectionObserver = ctor;
  globalThis.IntersectionObserver = ctor;
}
