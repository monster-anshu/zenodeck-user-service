export const PRODUCT_IDS = ['BOOKINGS', 'PROJECTS', 'CHAT_APP'] as const;
export type Product = (typeof PRODUCT_IDS)[number];
