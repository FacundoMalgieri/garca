"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "garca_invoices";

/**
 * Lightweight hook that returns whether the user has invoices persisted in
 * localStorage. Intended for surfaces that only need a boolean signal (e.g.
 * Navbar CTA switching) without pulling in the full `InvoiceContext` and its
 * transitive dependencies (scraper state, crypto-js, etc.).
 *
 * The value is re-read on mount, on cross-tab `storage` events, and on window
 * `focus` to catch mutations made by other tabs or code paths that bypass the
 * context (e.g. the landing demo flow writing directly to localStorage).
 */
export function useHasStoredInvoices(): boolean {
  const [hasInvoices, setHasInvoices] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        setHasInvoices(!!raw && raw !== "[]");
      } catch {
        setHasInvoices(false);
      }
    };

    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
    };
  }, []);

  return hasInvoices;
}
