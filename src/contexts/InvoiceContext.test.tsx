import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { InvoiceProvider, useInvoiceContext } from "./InvoiceContext";

import { act, renderHook } from "@testing-library/react";

// Mock fetch (not used in addEmittedInvoice but required by useInvoices)
vi.stubGlobal("fetch", vi.fn());

vi.mock("@/lib/crypto", () => ({
  encryptCredentials: vi.fn().mockResolvedValue({
    encryptedCuit: "encrypted-cuit",
    encryptedPassword: "encrypted-password",
    key: "mock-key",
    iv: "mock-iv",
  }),
}));

vi.mock("@/lib/analytics/umami", () => ({
  trackUmamiEvent: vi.fn(),
  sanitizeErrorCode: (c: string | null | undefined) => c || "UNKNOWN",
  UMAMI_EVENTS: {
    ArcCompaniesOk: "funnel_arc_companies_ok",
    ArcInvoicesOk: "funnel_arc_invoices_ok",
    LandingDemoOpen: "funnel_landing_demo_open",
    PanelExport: "funnel_panel_export",
    ArcCompaniesFail: "funnel_arc_companies_fail",
    ArcInvoicesFail: "funnel_arc_invoices_fail",
    LandingCta: "funnel_landing_cta",
  },
}));

function makeInvoice(numero: number, importeTotal = 1000): AFIPInvoice {
  return {
    tipoComprobante: 1,
    puntoVenta: 1,
    numero,
    fecha: "01/07/2026",
    importeTotal,
    razonSocialEmisor: "Test SRL",
    cuitEmisor: "20111111110",
  } as unknown as AFIPInvoice;
}

describe("InvoiceContext – addEmittedInvoice", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("deduplicates: same tipoComprobante+puntoVenta+numero yields 1 invoice", async () => {
    const { result } = renderHook(() => useInvoiceContext(), {
      wrapper: InvoiceProvider,
    });

    const inv = makeInvoice(1);

    await act(async () => {
      result.current.addEmittedInvoice(inv);
    });
    await act(async () => {
      result.current.addEmittedInvoice(inv);
    });

    expect(result.current.state.invoices).toHaveLength(1);
  });

  it("keeps distinct invoices: different numero yields 2 invoices", async () => {
    const { result } = renderHook(() => useInvoiceContext(), {
      wrapper: InvoiceProvider,
    });

    await act(async () => {
      result.current.addEmittedInvoice(makeInvoice(1));
    });
    await act(async () => {
      result.current.addEmittedInvoice(makeInvoice(2));
    });

    expect(result.current.state.invoices).toHaveLength(2);
  });

  it("keeps a referentially-stable context value + callbacks across an unrelated re-render", () => {
    // PERF-1: an unrelated parent re-render (no provider state change) must not
    // hand consumers a fresh value object or fresh callbacks, otherwise every
    // context subscriber (incl. every InvoiceRow) re-renders on each tick.
    const { result, rerender } = renderHook(() => useInvoiceContext(), {
      wrapper: InvoiceProvider,
    });

    const first = result.current;
    rerender();
    const second = result.current;

    expect(Object.is(first, second)).toBe(true);
    expect(Object.is(first.fetchCompanies, second.fetchCompanies)).toBe(true);
    expect(Object.is(first.fetchInvoicesWithCompany, second.fetchInvoicesWithCompany)).toBe(true);
    expect(Object.is(first.clearInvoices, second.clearInvoices)).toBe(true);
    expect(Object.is(first.clearCompanies, second.clearCompanies)).toBe(true);
    expect(Object.is(first.loadFromStorage, second.loadFromStorage)).toBe(true);
    expect(Object.is(first.loadDemoData, second.loadDemoData)).toBe(true);
  });

  it("emitted invoice wins over an existing scraped duplicate", async () => {
    const { result } = renderHook(() => useInvoiceContext(), {
      wrapper: InvoiceProvider,
    });

    const scraped = makeInvoice(1, 999);
    const emitted = makeInvoice(1, 1000);

    // Load scraped invoice as if it came from a fetch
    await act(async () => {
      result.current.loadDemoData([scraped], null, null);
    });

    await act(async () => {
      result.current.addEmittedInvoice(emitted);
    });

    expect(result.current.state.invoices).toHaveLength(1);
    expect(result.current.state.invoices[0].importeTotal).toBe(1000);
  });
});
