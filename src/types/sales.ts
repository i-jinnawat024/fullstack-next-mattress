/**
 * Sales & target types — Supabase (Phase 2)
 */

export interface SalesRecord {
  id: string;
  product_id: string;
  sold_price: number;
  customer_name: string | null;
  bill_no: string | null;
  sold_at: string;
}

export interface MonthlyTarget {
  id: string;
  year: number;
  month: number;
  target_amount: number;
}
