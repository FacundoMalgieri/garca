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
} from "@/types/afip-scraper";

import { DEFAULT_HEADLESS, DEFAULT_TIMEOUT, USER_AGENT } from "./constants";
import { extractInvoices } from "./steps/extraction";
import { applyFilters } from "./steps/filters";
import { login } from "./steps/login";
import { navigateToCompanySelection, navigateToInvoices } from "./steps/navigation";
import { downloadXMLs } from "./steps/xml-download";
import { handleError } from "./utils";

/**
 * Result of getting available companies.
 */
export interface GetCompaniesResult {
  success: boolean;
  companies: AFIPCompany[];
  error?: string;
  errorCode?: string;
}

/**
 * Gets available companies from AFIP portal.
 * This is the first step in the two-step flow.
 */
export async function getAFIPCompanies(credentials: AFIPCredentials): Promise<GetCompaniesResult> {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    console.log("[AFIP Companies] Starting company fetch...");
    console.log("[AFIP Companies] CUIT:", credentials.cuit);

    browser = await chromium.launch({
      headless: DEFAULT_HEADLESS,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    context = await browser.newContext({
      userAgent: USER_AGENT,
    });

    page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);

    // Login to AFIP
    const loginResult = await login(page, credentials, DEFAULT_TIMEOUT);
    if (!loginResult.success) {
      return {
        success: false,
        companies: [],
        error: loginResult.error,
        errorCode: loginResult.errorCode,
      };
    }

    // Navigate to company selection and extract companies
    const { page: newPage, availableCompanies } = await navigateToCompanySelection(page, context);
    page = newPage;

    console.log("[AFIP Companies] ✅ Found", availableCompanies.length, "company(ies)");

    return {
      success: true,
      companies: availableCompanies,
    };
  } catch (error) {
    console.error("[AFIP Companies] ❌ Error:", error);
    const errorResult = handleError(error);
    return {
      success: false,
      companies: [],
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
 * Scrapes invoices from AFIP portal.
 * Always performs a fresh login for reliability.
 */
export async function scrapeAFIPInvoices(
  credentials: AFIPCredentials,
  filters: AFIPInvoiceFilters,
  options?: AFIPScraperOptions
): Promise<AFIPScraperResultWithCompany> {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let company: AFIPCompany | null = null;
  let availableCompanies: AFIPCompany[] = [];

  const companyIndex = options?.companyIndex ?? 0;
  const headless = options?.headless ?? DEFAULT_HEADLESS;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const downloadXML = options?.downloadXML ?? false;

  try {
    console.log("[AFIP Scraper] Starting scrape...");
    console.log("[AFIP Scraper] CUIT:", credentials.cuit);
    console.log("[AFIP Scraper] Date range:", filters.fechaDesde, "to", filters.fechaHasta);

    browser = await chromium.launch({
      headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    context = await browser.newContext({
      userAgent: USER_AGENT,
    });

    page = await context.newPage();
    page.setDefaultTimeout(timeout);

    // Login to AFIP
    const loginResult = await login(page, credentials, timeout);
    if (!loginResult.success) {
      return loginResult;
    }

    // Navigate to invoices with company selection
    const navResult = await navigateToInvoices(page, context, companyIndex);
    page = navResult.page;
    company = navResult.company;
    availableCompanies = navResult.availableCompanies;

    // If company CUIT is empty, use login CUIT
    if (company && !company.cuit) {
      company.cuit = credentials.cuit;
    }

    console.log("[AFIP Scraper] Selected company:", company?.razonSocial, "(CUIT:", company?.cuit, ")");

    // Apply filters
    await applyFilters(page, filters);

    // Extract invoices
    const invoices = await extractInvoices(page);

    // Download XMLs if requested
    if (downloadXML && invoices.length > 0) {
      await downloadXMLs(page, invoices);
    }

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

// Re-export types and utilities for external use
export type { ParsedInvoiceXML } from "./xml-parser";
export { parseAfipXml } from "./xml-parser";
