export const PRODUCT_IDS = [
  'BOOKINGS',
  'PROJECTS',
  'CHAT_APP',
  'CAMPAIGN',
] as const;
export type Product = (typeof PRODUCT_IDS)[number];
