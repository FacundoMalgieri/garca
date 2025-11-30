/**
 * Constants for Monotributo Scraper.
 */

export const MONOTRIBUTO_URL = "https://www.afip.gob.ar/monotributo/categorias.asp";

export const SELECTORS = {
  TABLE: "table.table-bordered",
  TABLE_ROWS: "table.table-bordered tbody tr",
  TABLE_CAPTION: "table.table-bordered caption",
} as const;

export const TIMING = {
  NAVIGATION_TIMEOUT: 30000,
  TABLE_WAIT_TIMEOUT: 10000,
} as const;

