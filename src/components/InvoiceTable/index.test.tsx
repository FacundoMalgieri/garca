import { describe, expect, it, vi } from "vitest";

import { InvoiceProvider } from "@/contexts/InvoiceContext";
import type { AFIPInvoice } from "@/types/afip-scraper";

import { InvoiceTable } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

// useInvoices (behind InvoiceProvider) touches fetch/crypto/analytics on mount.
// Stub them so the provider mounts cleanly; the table reads invoices from the
// `invoices` prop, so we don't need real network state.
vi.stubGlobal("fetch", vi.fn());

vi.mock("@/lib/crypto", () => ({
  encryptCredentials: vi.fn().mockResolvedValue({
    encryptedCuit: "c",
    encryptedPassword: "p",
    key: "k",
    iv: "iv",
  }),
}));

vi.mock("@/lib/analytics/umami", () => ({
  trackUmamiEvent: vi.fn(),
  sanitizeErrorCode: (c: string | null | undefined) => c || "UNKNOWN",
  UMAMI_EVENTS: {
    ArcCompaniesOk: "a",
    ArcInvoicesOk: "b",
    LandingDemoOpen: "c",
    PanelExport: "d",
    ArcCompaniesFail: "e",
    ArcInvoicesFail: "f",
    LandingCta: "g",
  },
}));

const PAGE_SIZE = 20;

// Self-contained fixtures. NOTE: the shared src/test/mocks/invoices.ts is
// shadowed at resolution time by a stale committed invoices.js (no ESM
// exports) — a pre-existing repo wart outside this lane — so importing the
// shared mock yields undefined under vitest. Building fixtures inline keeps the
// test robust and self-documenting.
function makeInvoice(i: number, receptor: string): AFIPInvoice {
  const n = String(i).padStart(8, "0");
  return {
    fecha: `${String((i % 28) + 1).padStart(2, "0")}/01/2025`,
    tipo: "Factura C",
    tipoComprobante: 11,
    puntoVenta: 1,
    numero: i,
    numeroCompleto: `0001-${n}`,
    cuitEmisor: "20345678901",
    razonSocialEmisor: "Mi Empresa SA",
    cuitReceptor: "30709876543",
    razonSocialReceptor: receptor,
    importeNeto: 80000,
    importeIVA: 20000,
    importeTotal: 100000,
    moneda: "ARS",
    cae: `12345678${n}`,
  } as unknown as AFIPInvoice;
}

// 30 match "ACME", 21 match "OTROS" → 51 total, and a filter on "acme" yields
// more than one page of matches (30 > 20).
const MATCH_COUNT = 30;
const TOTAL = 51;
const fixtures: AFIPInvoice[] = Array.from({ length: TOTAL }, (_, idx) =>
  makeInvoice(idx + 1, idx < MATCH_COUNT ? "ACME SA" : "Otros SRL")
);

function renderTable(invoices: AFIPInvoice[] = fixtures) {
  return render(
    <InvoiceProvider>
      <InvoiceTable invoices={invoices} />
    </InvoiceProvider>
  );
}

// Desktop <tbody> rows only (mobile cards are <div>s), so this counts the
// bounded, rendered InvoiceRow set.
function countDesktopRows(container: HTMLElement): number {
  return container.querySelectorAll("tbody tr").length;
}

function getShowMoreButton(): HTMLElement | null {
  return screen.queryByRole("button", { name: /mostrar\s+\d+\s+más/i });
}

function openFilters() {
  fireEvent.click(screen.getByRole("button", { name: /filtros/i }));
}

function typeSearch(term: string) {
  fireEvent.change(screen.getByPlaceholderText("Número o receptor..."), {
    target: { value: term },
  });
}

describe("InvoiceTable", () => {
  it("fixture set is larger than one page (sanity)", () => {
    expect(fixtures.length).toBeGreaterThan(PAGE_SIZE);
    expect(MATCH_COUNT).toBeGreaterThan(PAGE_SIZE);
  });

  describe("pagination without filters", () => {
    it("renders only the first page of rows initially", () => {
      const { container } = renderTable();
      expect(countDesktopRows(container)).toBe(PAGE_SIZE);
    });

    it("'Mostrar más' reveals the next page", () => {
      const { container } = renderTable();
      const btn = getShowMoreButton();
      expect(btn).not.toBeNull();

      fireEvent.click(btn!);

      expect(countDesktopRows(container)).toBe(Math.min(PAGE_SIZE * 2, TOTAL));
    });
  });

  describe("pagination WITH filters active (PERF-2 Option B)", () => {
    it("bounds the filtered set to one page instead of rendering all matches", () => {
      const { container } = renderTable();
      openFilters();
      typeSearch("acme");

      // Previously ALL 30 matches rendered; now it must be bounded to one page.
      expect(countDesktopRows(container)).toBe(PAGE_SIZE);
    });

    it("exposes 'Mostrar más' under active filters and reveals the rest", () => {
      const { container } = renderTable();
      openFilters();
      typeSearch("acme");

      const btn = getShowMoreButton();
      expect(btn).not.toBeNull();

      fireEvent.click(btn!);

      expect(countDesktopRows(container)).toBe(Math.min(PAGE_SIZE * 2, MATCH_COUNT));
    });

    it("footer reports the shown count plus the filtered/total counts", () => {
      const { container } = renderTable();
      openFilters();
      typeSearch("acme");

      // Footer copy: "Mostrando 20 de 30 ... (filtrado de 51)"
      const text = container.textContent ?? "";
      expect(text).toContain(`Mostrando ${PAGE_SIZE} de ${MATCH_COUNT}`);
      expect(text).toContain(`filtrado de ${TOTAL}`);
    });
  });

  describe("states", () => {
    it("shows no rows and no show-more when there are no invoices", () => {
      const { container } = renderTable([]);
      expect(countDesktopRows(container)).toBe(0);
      expect(getShowMoreButton()).toBeNull();
    });
  });
});
