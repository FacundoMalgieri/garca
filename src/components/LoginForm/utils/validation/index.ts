/**
 * Validates that a date range is valid and within 1 year.
 * @returns Error message if invalid, null if valid
 */
export function validateDateRange(from: string, to: string): string | null {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Check if 'from' is after 'to'
  if (fromDate > toDate) {
    return "La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'";
  }

  // Check if range is more than 1 year (using 366 days to account for leap years)
  const oneYearInMs = 366 * 24 * 60 * 60 * 1000;
  const diffInMs = toDate.getTime() - fromDate.getTime();

  if (diffInMs > oneYearInMs) {
    return "El período no puede ser mayor a 1 año";
  }

  return null;
}

