"use client";

import { useEffect, useState } from "react";

/**
 * Theme type.
 */
export type Theme = "light" | "dark";

/**
 * Return type for useTheme hook.
 */
export interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
}

/**
 * Hook to manage theme state (light/dark mode).
 *
 * Uses localStorage to persist theme preference and updates the document class.
 * Returns mounted state to prevent hydration mismatches.
 */
export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Sync theme state with current DOM state on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(savedTheme || (isDark ? "dark" : "light"));
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return { theme, toggleTheme, mounted };
}

