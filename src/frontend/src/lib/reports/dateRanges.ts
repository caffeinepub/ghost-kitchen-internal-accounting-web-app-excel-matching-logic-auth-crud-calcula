/**
 * Utility functions for computing report date ranges.
 * All multi-month ranges are computed as full calendar months.
 */

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Compute a full-month date range for a single month.
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Start date (first day of month) and end date (last day of month at end-of-day)
 */
export function getMonthRange(year: number, month: number): DateRange {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

/**
 * Compute a contiguous 3-month date range starting from the given month/year.
 * @param startYear - The year of the first month
 * @param startMonth - The month (1-12) of the first month
 * @returns Start date (first day of first month) and end date (last day of third month at end-of-day)
 */
export function get3MonthRange(startYear: number, startMonth: number): DateRange {
  const startDate = new Date(startYear, startMonth - 1, 1);
  // Add 3 months, then go back to day 0 (last day of previous month)
  const endDate = new Date(startYear, startMonth + 2, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

/**
 * Compute a contiguous 6-month date range starting from the given month/year.
 * @param startYear - The year of the first month
 * @param startMonth - The month (1-12) of the first month
 * @returns Start date (first day of first month) and end date (last day of sixth month at end-of-day)
 */
export function get6MonthRange(startYear: number, startMonth: number): DateRange {
  const startDate = new Date(startYear, startMonth - 1, 1);
  // Add 6 months, then go back to day 0 (last day of previous month)
  const endDate = new Date(startYear, startMonth + 5, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

/**
 * Compute a full-year date range.
 * @param year - The year
 * @returns Start date (Jan 1) and end date (Dec 31 at end-of-day)
 */
export function getYearRange(year: number): DateRange {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
  return { startDate, endDate };
}

/**
 * Compute a single-day date range.
 * @param date - The date string (YYYY-MM-DD)
 * @returns Start date (beginning of day) and end date (end of day)
 */
export function getDayRange(date: string): DateRange {
  const d = new Date(date);
  const startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { startDate, endDate };
}

/**
 * Format a date range for display.
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Formatted string like "Jan 1, 2026 - Mar 31, 2026"
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
}

/**
 * Get the end month/year for a multi-month range.
 * @param startYear - The starting year
 * @param startMonth - The starting month (1-12)
 * @param monthCount - Number of months in the range
 * @returns Object with endYear and endMonth
 */
export function getEndMonthYear(startYear: number, startMonth: number, monthCount: number): { endYear: number; endMonth: number } {
  const endDate = new Date(startYear, startMonth - 1 + monthCount - 1, 1);
  return {
    endYear: endDate.getFullYear(),
    endMonth: endDate.getMonth() + 1,
  };
}
