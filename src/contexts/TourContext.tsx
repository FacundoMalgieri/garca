"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";

interface TourContextType {
  startTour: () => void;
  registerTour: (start: () => void) => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const startRef = useRef<(() => void) | null>(null);

  const registerTour = useCallback((start: () => void) => {
    startRef.current = start;
  }, []);

  const startTour = useCallback(() => {
    startRef.current?.();
  }, []);

  const value = useMemo(() => ({ startTour, registerTour }), [startTour, registerTour]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTourContext() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTourContext must be used within TourProvider");
  return ctx;
}
