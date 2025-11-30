"use client";

import { useCallback, useEffect, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

/**
 * A reusable confirmation dialog component.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Use scrollbar-gutter to prevent layout shift
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

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not the dialog
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[100] flex items-center justify-center p-4"
      style={{ margin: 0 }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Dialog - solid background, no opacity */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"
              }`}
            >
              {variant === "destructive" ? <WarningIcon /> : <QuestionIcon />}
            </div>
          </div>

          {/* Title */}
          <h2 id="dialog-title" className="text-lg font-semibold text-center text-foreground mb-2">
            {title}
          </h2>

          {/* Description */}
          <p id="dialog-description" className="text-sm text-muted-foreground text-center mb-6">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
