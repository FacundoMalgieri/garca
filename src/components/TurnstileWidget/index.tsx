"use client";

import { forwardRef,useCallback, useEffect, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error?: unknown) => void;
          "expired-callback"?: () => void;
          size?: "normal" | "compact" | "flexible" | "invisible";
          execution?: "render" | "execute";
          appearance?: "always" | "execute" | "interaction-only";
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (container: HTMLElement | string, options?: object) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
}

export interface TurnstileWidgetRef {
  reset: () => void;
}

const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

/**
 * Cloudflare Turnstile widget for bot protection.
 * Uses "managed" mode - Cloudflare decides when to show a challenge.
 */
export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  function TurnstileWidget({ onSuccess, onError, onExpired }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);
    const hasCalledSuccessRef = useRef(false);

    const renderWidget = useCallback(() => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: onSuccess,
          "error-callback": () => onError?.(),
          "expired-callback": () => onExpired?.(),
          size: "invisible",
          appearance: "always",
          theme: "auto",
        });
      } catch (error) {
        console.error("[Turnstile] Render error:", error);
        onError?.();
      }
    }, [onSuccess, onError, onExpired]);

    // Expose reset method via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (error) {
            console.error("[Turnstile] Reset error:", error);
          }
        }
      },
    }), []);

    useEffect(() => {
      // Skip if no site key configured (development without Turnstile)
      if (!SITE_KEY) {
        if (!hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess("");
        }
        return;
      }

      // Script already loaded
      if (window.turnstile) {
        renderWidget();
        return;
      }

      // Script loading in progress
      if (scriptLoadedRef.current) return;

      // Check for existing script
      const existingScript = document.querySelector(`script[src*="turnstile"]`);
      if (existingScript) {
        window.onTurnstileLoad = renderWidget;
        return;
      }

      scriptLoadedRef.current = true;

      const script = document.createElement("script");
      script.src = `${TURNSTILE_SCRIPT_URL}?onload=onTurnstileLoad&render=explicit`;
      script.async = true;

      window.onTurnstileLoad = renderWidget;

      script.onerror = () => onError?.();

      document.head.appendChild(script);

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [renderWidget, onSuccess, onError]);

    // Don't render if no site key
    if (!SITE_KEY) {
      return null;
    }

    // Container for Turnstile - invisible but present in DOM
    // Position absolute to avoid affecting layout
    return (
      <div 
        ref={containerRef} 
        className="turnstile-container absolute"
        style={{ width: 0, height: 0, overflow: "hidden" }}
      />
    );
  }
);
