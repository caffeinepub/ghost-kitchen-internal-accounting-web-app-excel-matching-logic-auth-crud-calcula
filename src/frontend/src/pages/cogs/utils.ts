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
