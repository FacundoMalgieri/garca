/**
 * Constants for Monotributo Scraper.
 */

export const MONOTRIBUTO_URL = "https://www.arca.gob.ar/monotributo/categorias.asp";

export const SELECTORS = {
  TABLE: "table.table-bordered",
  TABLE_ROWS: "table.table-bordered tbody tr",
  TABLE_HEADER: "table.table-bordered thead",
  TABLE_CAPTION: "table.table-bordered caption",
} as const;

export const TIMING = {
  NAVIGATION_TIMEOUT: 30000,
  TABLE_WAIT_TIMEOUT: 10000,
} as const;

/** How many times to retry the whole navigation+extraction before giving up. */
export const MAX_ATTEMPTS = 3;
/** Base backoff (ms) between attempts; grows linearly per attempt. */
export const RETRY_BACKOFF_MS = 2000;

