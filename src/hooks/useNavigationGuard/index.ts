"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseNavigationGuardOptions {
  /**
   * Whether the guard is active (e.g., when an operation is in progress).
   */
  enabled: boolean;
  /**
   * Message to show in the browser's native beforeunload dialog.
   */
  message?: string;
  /**
   * Callback when user attempts to navigate away.
   * Return true to allow navigation, false to block it.
   */
  onNavigationAttempt?: () => void;
}

interface UseNavigationGuardReturn {
  /**
   * Whether a navigation attempt is pending (waiting for user confirmation).
   */
  isPending: boolean;
  /**
   * Call this to confirm and allow the navigation.
   */
  confirmNavigation: () => void;
  /**
   * Call this to cancel the navigation attempt.
   */
  cancelNavigation: () => void;
}

/**
 * Hook to guard against accidental navigation during operations.
 * 
 * Handles:
 * - Browser back/forward buttons
 * - Page refresh
 * - Tab/window close
 * - In-app navigation (via callback)
 */
export function useNavigationGuard({
  enabled,
  message = "¿Estás seguro que querés salir? Se cancelará el proceso en curso.",
  onNavigationAttempt,
}: UseNavigationGuardOptions): UseNavigationGuardReturn {
  const [isPending, setIsPending] = useState(false);
  // Track if we pushed a dummy state so we know if we need to clean it up
  const pushedStateRef = useRef(false);
  // Track the original pathname to detect if we navigated away programmatically
  const originalPathnameRef = useRef<string | null>(null);

  // Handle beforeunload (refresh, close tab, close browser)
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages, but we need to set returnValue
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, message]);

  // Handle popstate (browser back/forward)
  useEffect(() => {
    if (!enabled) {
      // If we had pushed a state and are now disabled, clean up
      // BUT only if we're still on the same page (didn't navigate away)
      if (pushedStateRef.current && 
          originalPathnameRef.current === window.location.pathname &&
          window.history.state?.navigationGuard) {
        // Use replaceState instead of back() to avoid navigation side effects
        window.history.replaceState(null, "");
        pushedStateRef.current = false;
      }
      return;
    }

    // Store the original pathname when guard is enabled
    originalPathnameRef.current = window.location.pathname;

    // Push a dummy state to detect back button
    window.history.pushState({ navigationGuard: true }, "");
    pushedStateRef.current = true;

    const handlePopState = (_e: PopStateEvent) => {
      // Re-push state to prevent actual navigation
      window.history.pushState({ navigationGuard: true }, "");
      
      // Trigger navigation attempt callback
      setIsPending(true);
      onNavigationAttempt?.();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled, onNavigationAttempt]);

  const confirmNavigation = useCallback(() => {
    setIsPending(false);
    pushedStateRef.current = false;
    // Go back twice: once for the dummy state we pushed, once for the actual back
    window.history.go(-2);
  }, []);

  const cancelNavigation = useCallback(() => {
    setIsPending(false);
  }, []);

  return {
    isPending,
    confirmNavigation,
    cancelNavigation,
  };
}

