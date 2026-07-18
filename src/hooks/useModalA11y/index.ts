"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Keyboard/focus a11y for a portal-rendered modal dialog.
 *
 * When `isOpen` is true:
 *  - Esc → cierra (llama `onClose`).
 *  - Tab / Shift+Tab quedan atrapados dentro del diálogo (focus trap).
 *  - foco inicial al primer elemento focusable (o al contenedor).
 *  - al cerrar/desmontar, restaura el foco al elemento que lo tenía antes.
 *
 * Devuelve un ref para adjuntar al contenedor `role="dialog"`.
 * El caller sigue siendo dueño de `aria-labelledby`/`aria-modal`.
 *
 * `onClose` se guarda en un ref para que el efecto dependa SOLO de `isOpen`:
 * así no se re-ejecuta (ni roba el foco) en cada render mientras el usuario
 * tipea, aunque el caller pase un `onClose` con identidad nueva por render.
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose: () => void,
) {
  const containerRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement;

    const container = containerRef.current;
    const initialFocusables = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const firstFocusable =
      initialFocusables && initialFocusables.length > 0 ? initialFocusables[0] : container;
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const node = containerRef.current;
      if (!node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !node.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const prev = previouslyFocused.current;
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, [isOpen]);

  return containerRef;
}
