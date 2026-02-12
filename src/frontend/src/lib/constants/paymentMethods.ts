/**
 * Fixed payment methods for restaurant expense tracking.
 * These are the only allowed payment methods in the system.
 */
export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Check',
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];
