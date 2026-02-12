import { type YearMonthBucket } from '../../backend';

export function getItemName(itemId: bigint, items: Array<{ id: bigint; name: string }>): string {
  return items.find((item) => item.id === itemId)?.name || 'Unknown';
}

export function getVendorName(vendorId: bigint | undefined, vendors: Array<[bigint, string]>): string {
  if (!vendorId) return '-';
  return vendors.find(([id]) => id === vendorId)?.[1] || 'Unknown';
}

export function dateToTimestamp(date: Date): bigint {
  return BigInt(date.getTime() * 1000000);
}

export function timestampToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp) / 1000000);
}

/**
 * Format a YearMonthBucket into a human-readable month/year label
 * Uses UTC to avoid timezone-related inconsistencies
 */
export function formatYearMonthBucket(bucket: YearMonthBucket): string {
  const year = Number(bucket.year);
  const month = Number(bucket.month);
  
  // Create a UTC date for the first day of the month
  const date = new Date(Date.UTC(year, month - 1, 1));
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long',
    timeZone: 'UTC'
  });
}

/**
 * Compare two YearMonthBucket objects for sorting (newest to oldest)
 * Returns: negative if a > b, positive if a < b, 0 if equal
 */
export function compareYearMonthBuckets(a: YearMonthBucket, b: YearMonthBucket): number {
  const yearA = Number(a.year);
  const yearB = Number(b.year);
  const monthA = Number(a.month);
  const monthB = Number(b.month);
  
  // Compare years first (descending)
  if (yearA !== yearB) {
    return yearB - yearA;
  }
  
  // If years are equal, compare months (descending)
  return monthB - monthA;
}

/**
 * Create a stable string key from a YearMonthBucket for React keys
 */
export function yearMonthBucketToKey(bucket: YearMonthBucket): string {
  return `${bucket.year}-${bucket.month}`;
}
