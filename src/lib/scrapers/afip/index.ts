/**
 * AFIP Web Portal Scraper using Playwright.
 *
 * This module handles automated scraping of AFIP's web portal to retrieve
 * invoice data without needing WSAA/WSFEv1 integration.
 */

import { Browser, BrowserContext, chromium, Page } from "playwright";

import type {
  AFIPCompany,
  AFIPCredentials,
  AFIPInvoiceFilters,
  AFIPScraperOptions,
  AFIPScraperResultWithCompany,
  MonotributoAFIPInfo,
} from "@/types/afip-scraper";

import { DEFAULT_HEADLESS, DEFAULT_TIMEOUT, USER_AGENT } from "./constants";
import { type EventEmitter, noopEmitter, SCRAPER_EVENTS } from "./events";
import { extractInvoices } from "./steps/extraction";
import { applyFilters } from "./steps/filters";
import { login } from "./steps/login";
import { scrapeMonotributoInfo } from "./steps/monotributo";
import { navigateToCompanySelection, navigateToInvoices } from "./steps/navigation";
import { downloadXMLs } from "./steps/xml-download";
import { handleError } from "./utils";

/**
 * Extended options for streaming scraper.
 */
export interface StreamingScraperOptions extends AFIPScraperOptions {
  onEvent?: EventEmitter;
  isCancelled?: () => boolean;
}

/**
 * Result of getting available companies.
 */
export interface GetCompaniesResult {
  success: boolean;
  companies: AFIPCompany[];
  monotributoInfo?: MonotributoAFIPInfo | null;
  error?: string;
  errorCode?: string;
}

/**
 * Gets available companies from AFIP portal with event streaming.
 * Emits progress events throughout the process.
 *
 * @param credentials - AFIP login credentials
 * @param options - Optional event emitter and cancellation check for progress updates
 * @returns Result with list of available companies
 */
export async function getAFIPCompaniesWithEvents(
  credentials: AFIPCredentials,
  options?: { onEvent?: EventEmitter; isCancelled?: () => boolean }
): Promise<GetCompaniesResult> {
  const emit = options?.onEvent ?? noopEmitter;
  const isCancelled = options?.isCancelled ?? (() => false);

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let monotributoInfo: MonotributoAFIPInfo | null = null;

  try {
    emit(SCRAPER_EVENTS.start());
    console.log("[AFIP Companies] Starting company fetch...");

    // Check for cancellation before heavy operations
    if (isCancelled()) {
      console.log("[AFIP Companies] Cancelled before browser launch");
      return { success: false, companies: [], error: "Operación cancelada" };
    }

    browser = await chromium.launch({
      headless: DEFAULT_HEADLESS,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    context = await browser.newContext({
      userAgent: USER_AGENT,
    });

    page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);

    // Check for cancellation after browser setup
    if (isCancelled()) {
      console.log("[AFIP Companies] Cancelled after browser setup");
      return { success: false, companies: [], error: "Operación cancelada" };
    }

    // Login events
    emit(SCRAPER_EVENTS.loginStart());
    emit(SCRAPER_EVENTS.loginCuit());

    const loginResult = await login(page, credentials, DEFAULT_TIMEOUT);

    if (!loginResult.success) {
      emit(SCRAPER_EVENTS.error(loginResult.error || "Error de login"));
      return {
        success: false,
        companies: [],
        error: loginResult.error,
        errorCode: loginResult.errorCode,
      };
    }

    // Check for cancellation after login
    if (isCancelled()) {
      console.log("[AFIP Companies] Cancelled after login");
      return { success: false, companies: [], error: "Operación cancelada" };
    }

    emit(SCRAPER_EVENTS.loginSuccess());

    // Try to fetch Monotributo info (optional - doesn't fail the whole process)
    emit(SCRAPER_EVENTS.monotributoStart());
    try {
      // Store current URL to navigate back if needed
      const portalUrl = page.url();
      
      const monotributoResult = await scrapeMonotributoInfo(page, context);
      if (monotributoResult.success && monotributoResult.info) {
        monotributoInfo = monotributoResult.info;
        emit(SCRAPER_EVENTS.monotributoFound(monotributoInfo.categoria));
      } else {
        emit(SCRAPER_EVENTS.monotributoNotFound());
      }
      
      // Navigate back to portal home to search for Comprobantes
      // We need to go back because Monotributo may have navigated away
      console.log("[AFIP Companies] Navigating back to portal for companies...");
      await page.goto(portalUrl || "https://portalcf.cloud.afip.gob.ar/portal/app/", { waitUntil: "networkidle" });
    } catch (monotributoError) {
      console.warn("[AFIP Companies] Monotributo fetch failed (non-critical):", monotributoError);
      emit(SCRAPER_EVENTS.monotributoNotFound());
      
      // Try to navigate back to portal even on error
      try {
        await page.goto("https://portalcf.cloud.afip.gob.ar/portal/app/", { waitUntil: "networkidle" });
      } catch {
        console.warn("[AFIP Companies] Could not navigate back to portal");
      }
    }

    // Check for cancellation before navigation
    if (isCancelled()) {
      console.log("[AFIP Companies] Cancelled before company navigation");
      return { success: false, companies: [], monotributoInfo, error: "Operación cancelada" };
    }

    // Navigate to company selection
    emit(SCRAPER_EVENTS.navigatePortal());

    const { page: newPage, availableCompanies } = await navigateToCompanySelection(page, context);
    page = newPage;

    emit(SCRAPER_EVENTS.companiesFound(availableCompanies.length));
    console.log("[AFIP Companies] ✅ Found", availableCompanies.length, "company(ies)");

    return {
      success: true,
      companies: availableCompanies,
      monotributoInfo,
    };
  } catch (error) {
    console.error("[AFIP Companies] ❌ Error:", error);
    const errorResult = handleError(error);
    emit(SCRAPER_EVENTS.error(errorResult.error || "Error desconocido"));
    return {
      success: false,
      companies: [],
      monotributoInfo,
      error: errorResult.error,
      errorCode: errorResult.errorCode,
    };
  } finally {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Gets available companies from AFIP portal.
 * This is the first step in the two-step flow.
 *
 * Convenience wrapper that doesn't emit progress events (but still logs to console).
 */
export async function getAFIPCompanies(credentials: AFIPCredentials): Promise<GetCompaniesResult> {
  return getAFIPCompaniesWithEvents(credentials);
}

/**
 * Scrapes invoices from AFIP portal with event streaming.
 * Emits progress events throughout the scraping process.
 *
 * @param credentials - AFIP login credentials
 * @param filters - Date range and other filters
 * @param options - Scraper options including event emitter
 * @returns Scraper result with invoices and company info
 */
export async function scrapeAFIPInvoicesWithEvents(
  credentials: AFIPCredentials,
  filters: AFIPInvoiceFilters,
  options?: StreamingScraperOptions
): Promise<AFIPScraperResultWithCompany> {
  const emit = options?.onEvent ?? noopEmitter;
  const isCancelled = options?.isCancelled ?? (() => false);

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let company: AFIPCompany | null = null;
  let availableCompanies: AFIPCompany[] = [];

  const companyIndex = options?.companyIndex ?? 0;
  const headless = options?.headless ?? DEFAULT_HEADLESS;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const downloadXML = options?.downloadXML ?? false;

  // Helper to create cancelled result
  const cancelledResult = (): AFIPScraperResultWithCompany => ({
    success: false,
    invoices: [],
    total: 0,
    error: "Operación cancelada",
    company: company || undefined,
  });

  try {
    // Start event
    emit(SCRAPER_EVENTS.start());
    console.log("[AFIP Scraper] Starting scrape...");

    // Check for cancellation before heavy operations
    if (isCancelled()) {
      console.log("[AFIP Scraper] Cancelled before browser launch");
      return cancelledResult();
    }

    browser = await chromium.launch({
      headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    context = await browser.newContext({
      userAgent: USER_AGENT,
    });

    page = await context.newPage();
    page.setDefaultTimeout(timeout);

    // Check for cancellation after browser setup
    if (isCancelled()) {
      console.log("[AFIP Scraper] Cancelled after browser setup");
      return cancelledResult();
    }

    // Login events
    emit(SCRAPER_EVENTS.loginStart());

    // Emit login progress events
    emit(SCRAPER_EVENTS.loginCuit());
    const loginResult = await login(page, credentials, timeout);

    if (!loginResult.success) {
      emit(SCRAPER_EVENTS.error(loginResult.error || "Error de login"));
      return loginResult;
    }

    // Check for cancellation after login
    if (isCancelled()) {
      console.log("[AFIP Scraper] Cancelled after login");
      return cancelledResult();
    }

    emit(SCRAPER_EVENTS.loginSuccess());

    const navResult = await navigateToInvoices(page, context, companyIndex);
    page = navResult.page;
    company = navResult.company;
    availableCompanies = navResult.availableCompanies;

    // If company CUIT is empty, use login CUIT
    if (company && !company.cuit) {
      company.cuit = credentials.cuit;
    }

    // Check for cancellation after navigation
    if (isCancelled()) {
      console.log("[AFIP Scraper] Cancelled after company navigation");
      return cancelledResult();
    }

    emit(SCRAPER_EVENTS.companySelect(company?.razonSocial || "Empresa"));
    console.log("[AFIP Scraper] Company selected");

    // Filters events
    emit(SCRAPER_EVENTS.filtersApply(filters.fechaDesde, filters.fechaHasta));
    await applyFilters(page, filters);
    emit(SCRAPER_EVENTS.filtersSearch());

    // Check for cancellation after filters
    if (isCancelled()) {
      console.log("[AFIP Scraper] Cancelled after filters");
      return cancelledResult();
    }

    // Extraction events
    emit(SCRAPER_EVENTS.extractStart());
    const invoices = await extractInvoices(page);
    emit(SCRAPER_EVENTS.extractComplete(invoices.length));

    // Check for cancellation before XML download
    if (isCancelled()) {
      console.log("[AFIP Scraper] Cancelled before XML download");
      return cancelledResult();
    }

    // Download XMLs if requested (with progress events)
    if (downloadXML && invoices.length > 0) {
      for (let i = 0; i < invoices.length; i++) {
        // Check cancellation during XML download loop
        if (isCancelled()) {
          console.log("[AFIP Scraper] Cancelled during XML download");
          return cancelledResult();
        }
        emit(SCRAPER_EVENTS.extractProgress(i + 1, invoices.length));
      }
      await downloadXMLs(page, invoices);
    }

    // Complete event
    emit(SCRAPER_EVENTS.complete(invoices.length));
    console.log("[AFIP Scraper] ✅ Successfully scraped", invoices.length, "invoices");

    return {
      success: true,
      invoices,
      total: invoices.length,
      company: company || undefined,
      availableCompanies: availableCompanies.length > 1 ? availableCompanies : undefined,
    };
  } catch (error) {
    console.error("[AFIP Scraper] ❌ Error:", error);
    const errorResult = handleError(error);
    emit(SCRAPER_EVENTS.error(errorResult.error || "Error desconocido"));
    return {
      ...errorResult,
      company: company || undefined,
      availableCompanies: availableCompanies.length > 1 ? availableCompanies : undefined,
    };
  } finally {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Scrapes invoices from AFIP portal.
 * Always performs a fresh login for reliability.
 *
 * Convenience wrapper that doesn't emit progress events (but still logs to console).
 */
export async function scrapeAFIPInvoices(
  credentials: AFIPCredentials,
  filters: AFIPInvoiceFilters,
  options?: AFIPScraperOptions
): Promise<AFIPScraperResultWithCompany> {
  return scrapeAFIPInvoicesWithEvents(credentials, filters, options);
}

// Re-export types and utilities for external use
export type { ParsedInvoiceXML } from "./xml-parser";
export { parseAfipXml } from "./xml-parser";

// Re-export events
export { type EventEmitter, SCRAPER_EVENTS, type ScraperEvent } from "./events";
