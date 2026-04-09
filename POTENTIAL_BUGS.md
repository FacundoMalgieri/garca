# Potential Bugs Audit

## 1. Credit notes not subtracted in annual income calculation (panel/page.tsx)

- **Severity:** High
- **Location:** `src/app/panel/page.tsx:49-60`
- **Description:** `calcularIngresosAnuales()` sums `inv.importeTotal` for all invoices without checking if the invoice is a credit note. Credit notes (Nota de Credito) should be subtracted, not added. The `ChartsPanel` correctly applies `getInvoiceMultiplier()` to handle this, but the panel page and `useProjection/index.ts:invoicesToMonthlyTotals()` do not. This means Monotributo category calculations and projection totals will be inflated for anyone who has issued credit notes.
- **Suggested fix:** Apply the same credit note detection logic (`getInvoiceMultiplier`) in `calcularIngresosAnuales()` and `invoicesToMonthlyTotals()`. Extract the multiplier function to a shared utility.

## 2. Credit notes not subtracted in projection monthly totals

- **Severity:** High
- **Location:** `src/hooks/useProjection/index.ts:36-50`
- **Description:** `invoicesToMonthlyTotals()` sums all invoice amounts without checking for credit notes, same root cause as #1. This affects all projection calculations downstream.
- **Suggested fix:** Same as #1 -- apply credit note multiplier before accumulating.

## 3. useMonotributo calls localStorage unconditionally (SSR crash risk)

- **Severity:** Medium
- **Location:** `src/hooks/useMonotributo/index.ts:33`
- **Description:** The `useEffect` calls `localStorage.getItem()` without a `typeof window !== "undefined"` guard. While `"use client"` components typically only run on the client, during SSR prerendering this could throw. Other hooks in the codebase (`useProjection`) correctly guard localStorage access.
- **Suggested fix:** Wrap the localStorage call: `if (typeof window === "undefined") return;`

## 4. Monotributo category exceeds limit: negative margin shown as positive

- **Severity:** Medium
- **Location:** `src/hooks/useMonotributo/index.ts:56-63`
- **Description:** When `ingresosAnuales` exceeds ALL categories, the code falls back to the last (highest) category. Then `margenDisponible` becomes negative (`categoriaActual.ingresosBrutos - ingresosAnuales`), but `MonotributoPanel` only checks `> 0` to decide display. The negative margin is never shown to the user -- they just see the "Podes facturar hasta..." label with no amount, which is confusing.
- **Suggested fix:** Show explicit "exceeded all categories" state when `margenDisponible < 0` and `categoriaSiguiente === null`.

## 5. useMonotributo recalculates on every render (no memoization)

- **Severity:** Low
- **Location:** `src/hooks/useMonotributo/index.ts:50-75, 81`
- **Description:** `calcularStatus()` is called directly in the return statement on every render. It sorts the categories array each time. Should be memoized with `useMemo`.
- **Suggested fix:** Wrap `calcularStatus()` result in `useMemo(() => calcularStatus(), [ingresosAnuales, tipoActividad])`.

## 6. MonotributoPanel sync effect can cause infinite update loop

- **Severity:** Medium
- **Location:** `src/components/MonotributoPanel/index.tsx:25-29`
- **Description:** The `useEffect` calls `updateTipoActividad()` when scraped activity type differs from current. But `updateTipoActividad` is not wrapped in `useCallback` in `useMonotributo`, so it's a new reference every render, and `tipoActividad` is both a dependency and something that changes when the effect runs. While it stabilizes after one cycle (scraped value matches), if `monotributoInfo.tipoActividad` is ever a value other than "servicios" or "venta", this would loop until the dependency array settles.
- **Suggested fix:** Remove `tipoActividad` from the dependency array (the effect should only fire when the scraped value changes), or add a ref to track if sync already happened.

## 7. `loadFromStorage` referenced in useEffect dependency but not wrapped in useCallback

- **Severity:** Low
- **Location:** `src/hooks/useInvoices/index.ts:124-127`
- **Description:** `loadFromStorage` is defined as a plain function inside the hook. The `useEffect` at line 124 calls it on mount but doesn't list it in the dependency array (empty `[]`). This is fine for mount-only behavior, but ESLint `exhaustive-deps` would flag it. More importantly, `loadFromStorage` closes over stale state if called later via the returned ref.
- **Suggested fix:** Wrap `loadFromStorage` in `useCallback` or move it inside the effect.

## 8. SSE buffer may lose final event if it doesn't end with `\n\n`

- **Severity:** Medium
- **Location:** `src/hooks/useInvoices/index.ts:245-246, 432-433`
- **Description:** The SSE parsing splits on `\n\n` and keeps the last chunk as buffer: `buffer = lines.pop() || ""`. When the stream ends (`done === true`), any remaining data in `buffer` is never processed. If the server sends the final `result` event and the TCP segment doesn't include a trailing `\n\n`, the result event is silently lost, causing the "No se recibio resultado del servidor" error.
- **Suggested fix:** After the `while(true)` loop exits, process any remaining buffer content before checking `finalResult`.

## 9. Race condition: state updates after abort in SSE reader loop

- **Severity:** Low
- **Location:** `src/hooks/useInvoices/index.ts:239-275, 427-465`
- **Description:** When `AbortError` is thrown during `reader.read()`, the catch block correctly returns early. However, between the last successful `reader.read()` and the abort, progress state updates (`setState`, `setCompaniesState`) may still be enqueued from parsed SSE events. These are harmless but unnecessary state updates.
- **Suggested fix:** Check `abortRef.current?.signal.aborted` before calling `setState` in the SSE event processing loop.

## 10. ProjectionPanel auto-apply effect has overly broad dependencies

- **Severity:** Medium
- **Location:** `src/components/ProjectionPanel/index.tsx:80-90`
- **Description:** The `useEffect` that auto-applies recommendations depends on `projectionResult` which changes whenever any projection input changes (including the monthly projections themselves). This means editing a single month triggers the effect, which checks `isUserEditing.current` -- but the 1-second timeout in `handleMonthEdit` (line 98) creates a race: if the effect fires within that 1 second, it's suppressed; if React batches the update and the effect fires after 1 second, the user's edit gets overwritten by the recommendation.
- **Suggested fix:** Use a more robust mechanism -- e.g., a `userHasCustomized` state boolean that persists until explicitly cleared, rather than a 1-second timeout on a ref.

## 11. `parseCurrency` only replaces first comma

- **Severity:** Low
- **Location:** `src/components/ProjectionPanel/index.tsx:43`
- **Description:** `.replace(",", ".")` only replaces the first comma. Argentine format uses comma as decimal separator and should only have one, but if a user pastes a malformed string like `"1.000,50,00"`, the second comma is left in and `parseFloat` will produce incorrect results or NaN.
- **Suggested fix:** Use `.replace(/,/g, ".")` or validate that there's at most one comma.

## 12. `getNextRecategorizacionDates` may skip the current period

- **Severity:** Medium
- **Location:** `src/lib/projection/index.ts:60-92`
- **Description:** If today is January 15 (`currentMonth === 0`), the function sets `startMonth = 6` (July) since `0 < 6`. This skips the January recategorization that is currently happening. Users who need to plan for the ongoing January recategorization window won't see it as an option.
- **Suggested fix:** Include the current recategorization month if the user is within the recategorization filing period (typically the first 2-3 weeks of Jan/Jul).

## 13. Foreign currency invoices without exchange rate are counted at face value

- **Severity:** High
- **Location:** `src/app/panel/page.tsx:56-58`, `src/hooks/useProjection/index.ts:43-46`
- **Description:** When `invoice.moneda !== "ARS"` but `invoice.xmlData?.exchangeRate` is undefined/null/0, the code falls through and adds `importeTotal` as if it were ARS. A USD 1,000 invoice without exchange rate data would be counted as ARS 1,000 instead of ~ARS 1,000,000+. This silently under-reports income by orders of magnitude.
- **Suggested fix:** Either skip invoices without exchange rates and warn the user, or use a fallback exchange rate. At minimum, log a warning.

## 14. Navigation guard pushes duplicate history entries

- **Severity:** Low
- **Location:** `src/hooks/useNavigationGuard/index.ts:93, 98`
- **Description:** When `enabled` becomes true, `pushState` is called (line 93). Then on every `popstate` event, another `pushState` is called (line 98). If the user repeatedly presses back, the history stack accumulates guard entries. When `confirmNavigation` calls `history.go(-2)`, it may not go far enough if multiple guard states were pushed.
- **Suggested fix:** Track how many states were pushed and go back by the correct amount, or use `replaceState` instead of `pushState` in the popstate handler.

## 15. `panelPage` recalculates on every render without memoization

- **Severity:** Low
- **Location:** `src/app/panel/page.tsx:27-61`
- **Description:** `hasLast12MonthsData()` and `calcularIngresosAnuales()` are called directly in the render body without `useMemo`. For large invoice sets (hundreds), this re-parses every invoice date and recalculates on every render triggered by any state change.
- **Suggested fix:** Wrap both in `useMemo` with `[state.invoices]` dependency.

## 16. Stream routes don't close controller on abort before result is sent

- **Severity:** Low
- **Location:** `src/app/api/arca/invoices/stream/route.ts:141`, `src/app/api/arca/companies/stream/route.ts:95`
- **Description:** After `withConcurrencyLimit` resolves, the code sends the final result event (line 141) without checking `isControllerClosed`. If the client disconnected while waiting in the concurrency queue, `controller.enqueue` will throw. The `sendEvent` helper checks this, but the final result event is sent directly via `controller.enqueue` without the guard.
- **Suggested fix:** Use `sendEvent` for the final result event too, or add the `isControllerClosed` check before the final enqueue.

## 17. InvoiceTable uses array index as React key

- **Severity:** Low
- **Location:** `src/components/InvoiceTable/index.tsx:175, 188`
- **Description:** `key={index}` is used for both `InvoiceRow` and `InvoiceCard`. When the user sorts or filters, the same index maps to a different invoice, causing React to reuse DOM nodes incorrectly. This can cause stale tooltip/popover states or visual glitches.
- **Suggested fix:** Use a unique invoice identifier (e.g., `invoice.numero` or a composite of `invoice.numero + invoice.fecha + invoice.tipo`).

## 18. Floating point accumulation in financial totals

- **Severity:** Low
- **Location:** `src/hooks/useProjection/index.ts:49`, `src/lib/projection/index.ts:202-203`, `src/app/panel/page.tsx:54-59`
- **Description:** All financial totals are accumulated via floating-point addition (`sum + amountArs`). Over hundreds of invoices with decimal amounts, floating-point drift can cause totals to be off by a few centavos. While unlikely to affect category thresholds, displayed totals may show unexpected fractional digits.
- **Suggested fix:** Round intermediate sums or use integer centavos for accumulation, converting to pesos only for display.

## 19. `recategorizacionOptions` useMemo has empty dependency array

- **Severity:** Low
- **Location:** `src/hooks/useProjection/index.ts:122`
- **Description:** `getNextRecategorizacionDates()` uses `new Date()` internally. The `useMemo` with `[]` means the options are computed once when the hook mounts and never update. If the app stays open across midnight on January 1 or July 1, the recategorization options become stale.
- **Suggested fix:** This is acceptable for normal usage but worth noting. Could depend on a date string that changes daily if long sessions are expected.

## Validation Notes (2026-04-09)

### Already addressed in this pass
- #1, #2: Credit notes now subtracted via `getInvoiceMultiplier()` in `calcularIngresosAnuales` and `invoicesToMonthlyTotals`
- #3: localStorage guard added to `useMonotributo`
- #4: MonotributoPanel now shows exceeded state
- #5: `calcularStatus` wrapped in `useMemo`
- #6: `updateTipoActividad` wrapped in `useCallback` for stable reference
- #7: `loadFromStorage` called in mount-only effect — ESLint exhaustive-deps would flag it but behavior is correct. Low risk, accepted.
- #8: SSE buffer now flushed on stream end
- #9: Abort signal checked before state updates in SSE loop
- #10: Auto-apply now uses `userHasCustomized` state instead of timeout-based ref
- #11: `parseCurrency` now uses `/,/g` for global comma replacement
- #12: `getNextRecategorizacionDates` now includes current January/July recategorization period
- #13: Foreign currency without exchange rate is now skipped (not counted at face value)
- #14: Navigation guard popstate handler now uses `replaceState` instead of `pushState`
- #15: Panel page calculations wrapped in `useMemo`
- #16: Stream routes now use `sendEvent` for final result (includes `isControllerClosed` check)
- #17: InvoiceTable now uses `numeroCompleto-fecha` composite key instead of array index
- #18: Floating-point accumulation — accepted as-is. Sub-centavo precision loss doesn't affect category thresholds. Would require integer centavo refactor across all calculation paths for marginal benefit.
- #19: `recategorizacionOptions` empty deps — accepted. Computing once on mount is correct for normal session lengths. A daily refresh would add complexity for an edge case (app open across midnight Jan 1/Jul 1).
