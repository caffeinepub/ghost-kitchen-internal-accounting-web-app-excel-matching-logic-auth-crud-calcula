/**
 * Default restaurant expense categories.
 * These categories are automatically seeded on first app use.
 */
export const RESTAURANT_CATEGORIES = [
  'Food Supplies',
  'Beverages',
  'Labor',
  'Utilities',
  'Rent',
  'Marketing',
  'Repairs & Maintenance',
  'Licenses & Permits',
  'POS/Software',
  'Cleaning Supplies',
  'Packaging',
  'Insurance',
  'Taxes',
  'Delivery Fees',
  'Bank Fees',
  'Smallwares',
  'Equipment',
  'Professional Services',
  'Miscellaneous',
] as const;

export const CATEGORY_SEED_VERSION = 'v1';
export const CATEGORY_SEED_KEY = 'restaurant-categories-seeded';
