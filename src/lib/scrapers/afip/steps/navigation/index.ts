/**
 * AFIP Portal navigation to invoices section.
 */

import type { BrowserContext, Page } from "playwright";

import type { AFIPCompany } from "@/types/afip-scraper";

import { SELECTORS, TIMING } from "../../constants";

/**
 * Navigation result with company information.
 */
export interface NavigationResult {
  page: Page;
  company: AFIPCompany | null;
  availableCompanies: AFIPCompany[];
}

/**
 * Result of fetching available companies (without selecting one).
 */
export interface CompaniesResult {
  page: Page;
  availableCompanies: AFIPCompany[];
}

/**
 * Navigates from AFIP portal to the invoices consultation page.
 * Handles searching for "Comprobantes en línea", company selection, and "Consultas" button.
 * @param page - Playwright page instance (may be replaced with new tab)
 * @param context - Browser context for handling new tabs
 * @param companyIndex - Index of company to select (default: 0)
 * @returns Navigation result with page and company info
 */
export async function navigateToInvoices(
  page: Page,
  context: BrowserContext,
  companyIndex: number = 0
): Promise<NavigationResult> {
  // Wait a bit after login for page to stabilize
  await page.waitForTimeout(TIMING.AFTER_LOGIN_WAIT);

  // Step 1: Navigate to "Comprobantes en línea"
  const newPage = await navigateToComprobantes(page, context);

  // Step 2: Extract companies and select one
  const { company, availableCompanies } = await selectCompany(newPage, companyIndex);

  // Step 3: Click "Consultas" button
  await clickConsultas(newPage);

  console.log("[AFIP Scraper] ✅ Successfully navigated to invoices section");
  return { page: newPage, company, availableCompanies };
}

/**
 * Navigates to "Comprobantes en línea" service.
 * May open in a new tab.
 */
async function navigateToComprobantes(page: Page, context: BrowserContext): Promise<Page> {
  console.log("[AFIP Scraper] Looking for 'Comprobantes en línea' link...");

  const comprobantesLink = page.locator(SELECTORS.NAVIGATION.COMPROBANTES_LINK);
  const linkCount = await comprobantesLink.count();
  console.log("[AFIP Scraper] Found", linkCount, "matching link(s)");

  // Setup listener for new page/tab before clicking
  const newPagePromise = context.waitForEvent("page", { timeout: 15000 });

  if (linkCount > 0) {
    await clickComprobantesLink(page, comprobantesLink, linkCount);
  } else {
    await searchAndClickComprobantes(page);
  }

  // Wait for new tab to open
  return await handleNewTab(page, newPagePromise);
}

/**
 * Clicks the "Comprobantes en línea" link if found directly.
 */
async function clickComprobantesLink(
  _page: Page,
  comprobantesLink: ReturnType<Page["locator"]>,
  linkCount: number
): Promise<void> {
  let clicked = false;

  for (let i = 0; i < linkCount; i++) {
    const href = await comprobantesLink.nth(i).getAttribute("href");
    console.log(`[AFIP Scraper] Link ${i}: ${href}`);

    // Click the one that goes to RCEL
    if (href && (href.includes("rcel") || href.includes("fe.afip.gob.ar"))) {
      console.log("[AFIP Scraper] Found correct RCEL link, clicking...");
      await comprobantesLink.nth(i).click();
      clicked = true;
      break;
    }
  }

  // If we didn't find RCEL specifically, click the first one
  if (!clicked && linkCount > 0) {
    console.log("[AFIP Scraper] Clicking first 'Comprobantes en línea' link...");
    await comprobantesLink.first().click();
  }
}

/**
 * Uses search box to find "Comprobantes en línea".
 */
async function searchAndClickComprobantes(page: Page): Promise<void> {
  console.log("[AFIP Scraper] Link not found in recent services, using search box...");

  const searchInput = page.locator(SELECTORS.NAVIGATION.SEARCH_INPUT).first();

  await searchInput.waitFor({ state: "visible", timeout: 10000 });
  await searchInput.click();
  await searchInput.fill("comprobantes en línea");
  console.log("[AFIP Scraper] Typed in search box, waiting for results...");

  // Wait for search results to appear
  await page.waitForTimeout(TIMING.AFTER_CLICK_WAIT);

  // Click on the first result
  const firstResult = page.locator(SELECTORS.NAVIGATION.SEARCH_RESULT).first();

  await firstResult.waitFor({ state: "visible", timeout: 10000 });
  console.log("[AFIP Scraper] Found search result, clicking...");
  await firstResult.click();
}

/**
 * Handles the new tab that opens when clicking "Comprobantes en línea".
 */
async function handleNewTab(originalPage: Page, newPagePromise: Promise<Page>): Promise<Page> {
  console.log("[AFIP Scraper] Waiting for new tab to open...");

  try {
    const newPage = await newPagePromise;
    console.log("[AFIP Scraper] ✅ New tab opened!");

    // Wait for the new page to load
    await newPage.waitForLoadState("networkidle");
    await newPage.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);

    const newUrl = newPage.url();
    console.log("[AFIP Scraper] Current URL in new tab:", newUrl);

    // Validate we're on the RCEL page
    if (newUrl.includes("rcel") || newUrl.includes("fe.afip.gob.ar")) {
      console.log("[AFIP Scraper] ✅ Successfully navigated to RCEL portal");
    } else {
      console.warn("[AFIP Scraper] ⚠️  Warning: URL doesn't contain 'rcel', might be wrong page");
    }

    return newPage;
  } catch {
    console.warn("[AFIP Scraper] No new tab opened, continuing with same page...");
    await originalPage.waitForLoadState("networkidle");
    await originalPage.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);
    console.log("[AFIP Scraper] Current URL:", originalPage.url());
    return originalPage;
  }
}

/**
 * Company selection result.
 */
interface CompanySelectionResult {
  company: AFIPCompany | null;
  availableCompanies: AFIPCompany[];
}

/**
 * Selects the company/contributor and extracts company information.
 * @param page - Playwright page instance
 * @param companyIndex - Index of company to select (default: 0)
 * @returns Company selection result with extracted info
 */
async function selectCompany(page: Page, companyIndex: number = 0): Promise<CompanySelectionResult> {
  console.log("[AFIP Scraper] Checking for company selection...");
  console.log("[AFIP Scraper] Current URL:", page.url());

  // First, try to extract user info from header (CUIT - Nombre)
  const userInfo = await extractUserInfoFromHeader(page);

  const companyButton = page.locator(SELECTORS.NAVIGATION.COMPANY_BUTTON);
  const companyButtonCount = await companyButton.count();
  console.log("[AFIP Scraper] Found", companyButtonCount, "company button(s)");

  if (companyButtonCount === 0) {
    console.error("[AFIP Scraper] ❌ Company selection button not found. Navigation may have failed.");
    console.error("[AFIP Scraper] Current URL:", page.url());
    const pageTitle = await page.title();
    console.error("[AFIP Scraper] Page title:", pageTitle);
    throw new Error("No se pudo encontrar la selección de empresa. Verifique la navegación.");
  }

  // Extract all available companies from buttons
  const availableCompanies: AFIPCompany[] = [];

  for (let i = 0; i < companyButtonCount; i++) {
    const buttonValue = await companyButton.nth(i).getAttribute("value");
    if (buttonValue) {
      // Button value is usually the company name
      const company = parseCompanyFromButton(buttonValue, userInfo, i);
      availableCompanies.push(company);
      console.log(`[AFIP Scraper] Company ${i}: ${company.razonSocial} (CUIT: ${company.cuit})`);
    }
  }

  // Validate company index
  const selectedIndex = Math.min(companyIndex, companyButtonCount - 1);

  if (companyButtonCount > 1) {
    console.log(`[AFIP Scraper] Multiple companies found (${companyButtonCount}). Selecting index ${selectedIndex}...`);
  }

  // Click the selected company button
  await companyButton.nth(selectedIndex).waitFor({ state: "visible", timeout: 10000 });
  const selectedButtonValue = await companyButton.nth(selectedIndex).getAttribute("value");
  console.log("[AFIP Scraper] Clicking button with value:", selectedButtonValue);

  await companyButton.nth(selectedIndex).click();
  console.log("[AFIP Scraper] ✅ Company selected");

  // Wait for navigation after company selection
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);

  const selectedCompany = availableCompanies[selectedIndex] || null;

  return {
    company: selectedCompany,
    availableCompanies,
  };
}

/**
 * Extracts user info from the header table.
 * Format: "CUIT - NOMBRE"
 */
async function extractUserInfoFromHeader(page: Page): Promise<{ cuit: string; nombre: string } | null> {
  try {
    // Look for the user info table
    const userTable = page.locator("#encabezado_usuario td");
    const userTableCount = await userTable.count();

    if (userTableCount > 0) {
      const userText = await userTable.first().textContent();
      console.log("[AFIP Scraper] User header text:", userText);

      if (userText) {
        // Format: "20354104076 - MALGIERI FACUNDO ARIEL"
        const match = userText.match(/(\d{11})\s*-\s*(.+)/);
        if (match) {
          return {
            cuit: match[1],
            nombre: match[2].trim(),
          };
        }
      }
    }
  } catch (error) {
    console.warn("[AFIP Scraper] Could not extract user info from header:", error);
  }

  return null;
}

/**
 * Parses company information from button value and header info.
 */
function parseCompanyFromButton(
  buttonValue: string,
  userInfo: { cuit: string; nombre: string } | null,
  index: number
): AFIPCompany {
  // The button value is the company name (razón social)
  const razonSocial = buttonValue.trim();

  // Try to get CUIT from user info if the name matches
  let cuit = "";

  if (userInfo) {
    // If button value matches user name, use user CUIT
    if (razonSocial.toUpperCase() === userInfo.nombre.toUpperCase()) {
      cuit = userInfo.cuit;
    }
  }

  return {
    cuit,
    razonSocial,
    index,
  };
}

/**
 * Clicks the "Consultas" button to access invoice queries.
 */
async function clickConsultas(page: Page): Promise<void> {
  console.log("[AFIP Scraper] Looking for 'Consultas' button...");
  const consultasButton = page.locator(SELECTORS.NAVIGATION.CONSULTAS_BUTTON);

  const consultasCount = await consultasButton.count();
  if (consultasCount > 0) {
    console.log("[AFIP Scraper] Found 'Consultas' button, clicking...");
    await consultasButton.first().waitFor({ state: "visible", timeout: 10000 });
    await consultasButton.first().click();
    console.log("[AFIP Scraper] ✅ Clicked on 'Consultas'");

    // Wait for the query page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);
  } else {
    console.log("[AFIP Scraper] No 'Consultas' button found, already on query page");
  }
}

/**
 * Navigates to company selection page and extracts available companies WITHOUT selecting one.
 * Used for the two-step flow where user selects company first.
 * @param page - Playwright page instance
 * @param context - Browser context for handling new tabs
 * @returns Companies result with page and available companies
 */
export async function navigateToCompanySelection(page: Page, context: BrowserContext): Promise<CompaniesResult> {
  // Wait a bit after login for page to stabilize
  await page.waitForTimeout(TIMING.AFTER_LOGIN_WAIT);

  // Navigate to "Comprobantes en línea"
  const newPage = await navigateToComprobantes(page, context);

  // Extract companies without selecting
  const availableCompanies = await extractAvailableCompanies(newPage);

  console.log("[AFIP Scraper] ✅ Found", availableCompanies.length, "company(ies)");
  return { page: newPage, availableCompanies };
}

/**
 * Extracts available companies from the selection page without clicking any.
 */
async function extractAvailableCompanies(page: Page): Promise<AFIPCompany[]> {
  console.log("[AFIP Scraper] Extracting available companies...");
  console.log("[AFIP Scraper] Current URL:", page.url());

  // Extract user info from header
  const userInfo = await extractUserInfoFromHeader(page);

  const companyButton = page.locator(SELECTORS.NAVIGATION.COMPANY_BUTTON);
  const companyButtonCount = await companyButton.count();
  console.log("[AFIP Scraper] Found", companyButtonCount, "company button(s)");

  if (companyButtonCount === 0) {
    console.error("[AFIP Scraper] ❌ Company selection button not found.");
    throw new Error("No se pudo encontrar la selección de empresa. Verifique la navegación.");
  }

  const availableCompanies: AFIPCompany[] = [];

  for (let i = 0; i < companyButtonCount; i++) {
    const buttonValue = await companyButton.nth(i).getAttribute("value");
    if (buttonValue) {
      const company = parseCompanyFromButton(buttonValue, userInfo, i);
      availableCompanies.push(company);
      console.log(`[AFIP Scraper] Company ${i}: ${company.razonSocial} (CUIT: ${company.cuit})`);
    }
  }

  return availableCompanies;
}

/**
 * Selects a specific company by index and continues to invoices.
 * Used after navigateToCompanySelection in the two-step flow.
 * @param page - Playwright page instance (should be on company selection page)
 * @param companyIndex - Index of company to select
 * @returns Navigation result with selected company
 */
export async function selectCompanyAndContinue(page: Page, companyIndex: number): Promise<NavigationResult> {
  console.log("[AFIP Scraper] Selecting company at index:", companyIndex);

  // Extract companies and select
  const { company, availableCompanies } = await selectCompany(page, companyIndex);

  // Click "Consultas" button
  await clickConsultas(page);

  console.log("[AFIP Scraper] ✅ Successfully navigated to invoices section");
  return { page, company, availableCompanies };
}

