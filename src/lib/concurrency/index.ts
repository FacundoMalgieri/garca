/**
 * Simple in-memory concurrency limiter for Playwright scrapers.
 * 
 * Limits the number of concurrent browser instances to prevent
 * memory exhaustion on limited resources (e.g., Render free tier with 512MB).
 */

// Maximum concurrent scrapers (Playwright instances)
// With 512MB RAM: ~150-200MB per Chromium instance + Node overhead
// Safe limit for Render free tier: 1 concurrent scraper
const MAX_CONCURRENT_SCRAPERS = 1;

// How long to wait before checking again (ms)
const POLL_INTERVAL = 500;

// Maximum time to wait in queue before timing out (ms)
const MAX_QUEUE_WAIT = 60000; // 60 seconds

// Current active scraper count
let activeScrapers = 0;

// Queue for waiting requests
let waitingCount = 0;

/**
 * Gets current concurrency stats.
 */
export function getConcurrencyStats() {
  return {
    active: activeScrapers,
    waiting: waitingCount,
    max: MAX_CONCURRENT_SCRAPERS,
    available: MAX_CONCURRENT_SCRAPERS - activeScrapers,
  };
}

/**
 * Acquires a slot for running a scraper.
 * Waits if all slots are occupied.
 * 
 * @throws Error if wait time exceeds MAX_QUEUE_WAIT
 */
async function acquireSlot(): Promise<void> {
  const startTime = Date.now();
  
  while (activeScrapers >= MAX_CONCURRENT_SCRAPERS) {
    // Check for timeout
    if (Date.now() - startTime > MAX_QUEUE_WAIT) {
      throw new Error(
        `El servidor está ocupado. Por favor, intentá de nuevo en unos segundos. ` +
        `(${waitingCount} solicitudes en espera)`
      );
    }
    
    waitingCount++;
    console.log(`[Concurrency] Waiting for slot... (${activeScrapers}/${MAX_CONCURRENT_SCRAPERS} active, ${waitingCount} waiting)`);
    
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    waitingCount--;
  }
  
  activeScrapers++;
  console.log(`[Concurrency] Slot acquired (${activeScrapers}/${MAX_CONCURRENT_SCRAPERS} active)`);
}

/**
 * Releases a scraper slot.
 */
function releaseSlot(): void {
  activeScrapers = Math.max(0, activeScrapers - 1);
  console.log(`[Concurrency] Slot released (${activeScrapers}/${MAX_CONCURRENT_SCRAPERS} active)`);
}

/**
 * Wraps an async function with concurrency limiting.
 * Ensures only MAX_CONCURRENT_SCRAPERS run simultaneously.
 * 
 * @example
 * const result = await withConcurrencyLimit(async () => {
 *   return await scrapeAFIPInvoices(credentials, filters);
 * });
 */
export async function withConcurrencyLimit<T>(
  fn: () => Promise<T>
): Promise<T> {
  await acquireSlot();
  
  try {
    return await fn();
  } finally {
    releaseSlot();
  }
}

