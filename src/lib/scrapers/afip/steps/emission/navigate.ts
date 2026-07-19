/**
 * Emission navigation: portal → RCEL → empresa → "Generar Comprobantes" (Screen 0).
 *
 * Reuses navigateToComprobantes + selectCompany from the navigation module so this
 * is a thin wrapper that only adds the final click on "Generar Comprobantes".
 */

import type { BrowserContext, Page } from "playwright";

import { ELEMENT_TIMEOUT, TIMING } from "../../constants";
import { navigateToComprobantes, selectCompany } from "../navigation";

/**
 * Navigates from the AFIP portal (post-login) to RCEL Screen 0 (buscarPtosVtas.do)
 * ready to fill punto de venta and tipo de comprobante.
 *
 * Steps:
 *   1. navigateToComprobantes — opens RCEL in a new tab, returns the tab's Page.
 *   2. selectCompany — clicks the company button and waits for the RCEL menu.
 *   3. Clicks "Generar Comprobantes" → lands on Screen 0.
 *
 * @param page    - Original portal Page (post-login).
 * @param context - BrowserContext (needed by navigateToComprobantes for new-tab handling).
 * @param companyIndex - Which company button to click (default 0).
 * @returns The RCEL Page positioned on Screen 0.
 */
export async function navigateToEmission(
  page: Page,
  context: BrowserContext,
  companyIndex: number = 0,
): Promise<Page> {
  // Wait for portal to stabilise after login (mirrors navigateToInvoices pattern)
  await page.waitForTimeout(TIMING.AFTER_LOGIN_WAIT);

  // Step 1 – open RCEL in new tab
  const rcelPage = await navigateToComprobantes(page, context);

  // Step 2 – select company (clicks btn_empresa[index], waits networkidle)
  await selectCompany(rcelPage, companyIndex);

  // Step 3 – click "Generar Comprobantes" from the RCEL main menu.
  // RCEL menu items are `<a role="button" href="buscarPtosVtas.do">` — NOT links in
  // the a11y tree (they carry an explicit role="button"), so we locate by href.
  console.log("[AFIP Facturador] Clicking 'Generar Comprobantes'...");
  const generar = rcelPage.locator('a[href="buscarPtosVtas.do"]');
  await generar.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await generar.click();

  await rcelPage.waitForLoadState("networkidle");
  await rcelPage.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);

  console.log("[AFIP Facturador] ✅ On Screen 0 (buscarPtosVtas.do)");
  return rcelPage;
}
