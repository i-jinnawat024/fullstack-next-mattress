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

/** โปรโมชั่นที่ผูกกับสินค้า (จาก promotion_products) เรียงตาม application_order */
export interface ProductActivePromotion {
  id: string;
  name: string;
  endDate: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  /** ราคาขั้นต่ำ (บาท) — null = ใช้ได้ทุกราคา */
  minOrderAmount?: number | null;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  prices: PriceBySize[];
  /** โปรโมชั่นที่เชื่อมกับสินค้านี้ (จากแคมเปญ) */
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
  created_at?: string;
  updated_at?: string;
}
