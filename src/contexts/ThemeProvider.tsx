"use client";

import { useEffect, useState } from "react";

/**
 * Theme provider that applies the dark class to the HTML element.
 * Must be a client component to access localStorage and modify DOM.
 * Defaults to dark mode, can be overridden by user preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user has explicitly set a theme preference
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Default to dark mode (either saved as "dark" or no preference)
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

