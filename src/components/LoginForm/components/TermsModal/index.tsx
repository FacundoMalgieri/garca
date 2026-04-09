"use client";

import { useCallback, useEffect, useRef } from "react";

import { TermsContent } from "@/components/TermsContent";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      const html = document.documentElement;
      const originalPaddingRight = html.style.paddingRight;
      const originalOverflow = html.style.overflow;
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      html.style.paddingRight = `${scrollbarWidth}px`;
      html.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        html.style.paddingRight = originalPaddingRight;
        html.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[100] flex items-center justify-center p-4"
      style={{ margin: 0 }}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 id="terms-dialog-title" className="text-lg font-semibold text-foreground">
            Términos y Condiciones
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <TermsContent compact />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
