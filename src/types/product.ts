/**
 * Product & price types — aligned with Supabase catalog (100% Supabase)
 */

export type SizeKey = "3.5" | "5" | "6";

export interface PriceBySize {
  size: SizeKey;
  msrp: number;
  discountPercent: number;
  netPrice: number;
}

/** Active promotion from promotions table (for catalog display & price) */
export interface ProductActivePromotion {
  id: string;
  name: string;
  endDate: string;
  discountType: "percent" | "fixed";
  discountValue: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  prices: PriceBySize[];
  promotionEndDate: string | null;
  freeGifts: string[];
  creditPromoText: string | null;
  /** Promotions (from promotions table) that are active and linked to this product */
  activePromotions?: ProductActivePromotion[];
}

/** Row shape from Supabase `products` table */
export interface ProductRow {
  id: string;
  name: string;
  brand: string;
  size_3_5_msrp: number | null;
  size_5_msrp: number | null;
  size_6_msrp: number | null;
  discount_percent: number;
  promotion_end_date: string | null;
  free_gifts: string | null;
  credit_promo_text: string | null;
  created_at?: string;
  updated_at?: string;
}
