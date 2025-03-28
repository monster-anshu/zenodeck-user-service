export const PRODUCT_IDS = [
  'BOOKINGS',
  'PROJECTS',
  'CONNECT',
  'CAMPAIGN',
] as const;
export type Product = (typeof PRODUCT_IDS)[number];
