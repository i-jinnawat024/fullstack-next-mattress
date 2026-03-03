/**
 * Supabase DB types — catalog (products) + Phase 2 (sales_records, monthly_targets)
 */

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          image_url: string | null;
          size_3_5_msrp: number | null;
          size_5_msrp: number | null;
          size_6_msrp: number | null;
          discount_percent: number;
          promotion_end_date: string | null;
          free_gifts: string | null;
          credit_promo_text: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      sales_records: {
        Row: {
          id: string;
          product_id: string;
          sold_price: number;
          customer_name: string | null;
          bill_no: string | null;
          sold_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sales_records"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sales_records"]["Insert"]>;
      };
      monthly_targets: {
        Row: {
          id: string;
          year: number;
          month: number;
          target_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["monthly_targets"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["monthly_targets"]["Insert"]>;
      };
      promotions: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          started_date: string;
          end_date: string;
          description: string | null;
          discount_type: "percent" | "fixed";
          discount_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["promotions"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["promotions"]["Insert"]>;
      };
      promotion_products: {
        Row: {
          promotion_id: string;
          product_id: string;
        };
        Insert: {
          promotion_id: string;
          product_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["promotion_products"]["Insert"]>;
      };
    };
  };
}
