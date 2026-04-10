"use client";

import { driver, type DriveStep } from "driver.js";
import { useCallback, useEffect, useRef } from "react";

import { hasSeenTour, markTourSeen } from "@/lib/tours";

import "driver.js/dist/driver.css";
import "@/styles/driver-theme.css";

interface UseTourOptions {
  tourKey: string;
  steps: () => DriveStep[];
  /** Delay in ms before auto-starting (default 600) */
  autoStartDelay?: number;
}

export function useTour({ tourKey, steps, autoStartDelay = 600 }: UseTourOptions) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    const tourSteps = steps();
    if (tourSteps.length === 0) return;

    driverRef.current = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "¡Listo!",
      progressText: "{{current}} de {{total}}",
      steps: tourSteps,
      onDestroyStarted: () => {
        markTourSeen(tourKey);
        driverRef.current?.destroy();
      },
    });

    driverRef.current.drive();
  }, [tourKey, steps]);

  useEffect(() => {
    if (hasSeenTour(tourKey)) return;

    const timer = setTimeout(() => {
      startTour();
    }, autoStartDelay);

    return () => clearTimeout(timer);
  }, [tourKey, startTour, autoStartDelay]);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  return { startTour };
}
