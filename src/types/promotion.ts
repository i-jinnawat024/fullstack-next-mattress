/**
 * Promotion entity (CRUD) + embedded Product promo info
 */

export type DiscountType = "percent" | "fixed";

export interface Promotion {
  id: string;
  name: string;
  isActive: boolean;
  startedDate: string;
  endDate: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  createdAt?: string;
  updatedAt?: string;
  /** Product IDs linked to this promotion (for form/edit) */
  productIds?: string[];
}

/** Embedded in Product (ofแถม, โปรบัตร) — keep for product display */
export interface PromotionInfo {
  endDate: string | null;
  freeGifts: string[];
  creditPromoText: string | null;
}
