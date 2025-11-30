/**
 * AFIP Login flow.
 */

import type { Page } from "playwright";

import { type AFIPCredentials, AFIPErrorCode, type AFIPScraperResult } from "@/types/afip-scraper";

import { SELECTORS, TIMING } from "../../constants";
import { createErrorResult, createSuccessResult, isBlockedAccountError, isInvalidCredentialsError } from "../../utils";

/**
 * Logs into AFIP portal using the two-step login flow.
 * @param page - Playwright page instance
 * @param credentials - CUIT and password
 * @param timeout - Navigation timeout
 * @returns Result indicating success or failure with error details
 */
export async function login(page: Page, credentials: AFIPCredentials, timeout: number): Promise<AFIPScraperResult> {
  try {
    console.log("[AFIP Scraper] Navigating to login page...");
    await page.goto("https://auth.afip.gob.ar/contribuyente_/login.xhtml", {
      waitUntil: "networkidle",
      timeout,
    });

    // Check for CAPTCHA
    const captchaResult = await checkForCaptcha(page);
    if (captchaResult) return captchaResult;

    // Step 1: Fill CUIT
    await fillCuit(page, credentials.cuit);

    // Click "Siguiente" to proceed to password step
    await clickSiguiente(page);

    // Step 2: Fill password
    await fillPassword(page, credentials.password);

    // Click "Ingresar" to submit
    await clickIngresar(page, timeout);

    // Verify login success
    return await verifyLogin(page);
  } catch (error) {
    console.error("[AFIP Scraper] Login error:", error);
    return createErrorResult(
      `Error durante login: ${error instanceof Error ? error.message : "Error desconocido"}`,
      AFIPErrorCode.NAVIGATION_ERROR
    );
  }
}

/**
 * Checks if CAPTCHA is present on the login page.
 */
async function checkForCaptcha(page: Page): Promise<AFIPScraperResult | null> {
  const hasCaptcha = await page.locator(SELECTORS.LOGIN.CAPTCHA).count();
  if (hasCaptcha > 0) {
    console.error("[AFIP Scraper] CAPTCHA detected");
    return createErrorResult("CAPTCHA requerido. No se puede continuar automáticamente.", AFIPErrorCode.CAPTCHA_REQUIRED);
  }
  return null;
}

/**
 * Fills the CUIT input field.
 */
async function fillCuit(page: Page, cuit: string): Promise<void> {
  console.log("[AFIP Scraper] Step 1: Filling CUIT...");
  const cuitInput = page.locator(SELECTORS.LOGIN.CUIT_INPUT).first();

  await cuitInput.waitFor({ state: "visible", timeout: 10000 });
  await cuitInput.click();
  await cuitInput.fill(cuit);
  console.log("[AFIP Scraper] CUIT filled:", cuit);
}

/**
 * Clicks the "Siguiente" button to proceed to password step.
 */
async function clickSiguiente(page: Page): Promise<void> {
  console.log("[AFIP Scraper] Clicking 'Siguiente' button...");
  const siguienteButton = page.locator(SELECTORS.LOGIN.SIGUIENTE_BUTTON).first();

  await siguienteButton.waitFor({ state: "visible", timeout: 10000 });
  await siguienteButton.click();
  console.log("[AFIP Scraper] 'Siguiente' clicked, waiting for password field...");

  // Wait for transition
  await page.waitForTimeout(TIMING.AFTER_CLICK_WAIT);
}

/**
 * Fills the password input field.
 */
async function fillPassword(page: Page, password: string): Promise<void> {
  console.log("[AFIP Scraper] Step 2: Filling password...");
  const passwordInput = page.locator(SELECTORS.LOGIN.PASSWORD_INPUT).first();

  await passwordInput.waitFor({ state: "visible", timeout: 10000 });
  await passwordInput.click();
  await passwordInput.fill(password);
  console.log("[AFIP Scraper] Password filled successfully");
}

/**
 * Clicks the "Ingresar" button to submit login.
 * Uses Promise.race to detect login errors before navigation timeout.
 */
async function clickIngresar(page: Page, timeout: number): Promise<void> {
  console.log("[AFIP Scraper] Clicking 'Ingresar' button...");
  const ingresarButton = page.locator(SELECTORS.LOGIN.INGRESAR_BUTTON).first();

  await ingresarButton.waitFor({ state: "visible", timeout: 10000 });

  // Click the button
  await ingresarButton.click();

  // Race between: successful navigation OR error message appearing
  const errorSelector = SELECTORS.LOGIN.ERROR_MESSAGE;
  const result = await Promise.race([
    page.waitForNavigation({ timeout }).then(() => ({ type: "navigation" as const })),
    page.waitForSelector(errorSelector, { timeout: 5000 }).then(() => ({ type: "error" as const })).catch(() => null),
  ]);

  // If error message appeared before navigation, we'll catch it in verifyLogin
  if (result?.type === "error") {
    console.log("[AFIP Scraper] Error message detected after clicking 'Ingresar'");
    // Give the page a moment to fully render the error
    await page.waitForTimeout(500);
  } else {
    console.log("[AFIP Scraper] 'Ingresar' clicked successfully, navigation completed");
  }
}

/**
 * Verifies if login was successful by checking the URL and error messages.
 */
async function verifyLogin(page: Page): Promise<AFIPScraperResult> {
  await page.waitForTimeout(TIMING.AFTER_LOGIN_WAIT);
  const currentUrl = page.url();

  // Check for error messages
  const errorMessages = await page.locator(SELECTORS.LOGIN.ERROR_MESSAGE).allTextContents();
  if (errorMessages.length > 0) {
    const errorText = errorMessages.join(" ");
    console.error("[AFIP Scraper] Login error:", errorText);

    if (isInvalidCredentialsError(errorText)) {
      return createErrorResult("Credenciales inválidas", AFIPErrorCode.INVALID_CREDENTIALS);
    }

    if (isBlockedAccountError(errorText)) {
      return createErrorResult("Cuenta bloqueada", AFIPErrorCode.ACCOUNT_BLOCKED);
    }
  }

  // Check if still on login page (failed login)
  if (currentUrl.includes("login.xhtml")) {
    return createErrorResult("Login falló. Verifique sus credenciales.", AFIPErrorCode.INVALID_CREDENTIALS);
  }

  console.log("[AFIP Scraper] ✅ Login successful");
  return createSuccessResult();
}

