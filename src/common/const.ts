export const PRODUCT_IDS = ["BOOKINGS", "PROJECTS"] as const;
export type Product = (typeof PRODUCT_IDS)[number];
