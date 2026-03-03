/**
 * Promotions CRUD — Supabase promotions table
 */

import { getSupabaseServer } from "@/lib/db/client";
import type { Promotion } from "@/types/promotion";
import type { Database } from "@/lib/db/schema";

type PromotionRow = Database["public"]["Tables"]["promotions"]["Row"];

function rowToPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    startedDate: row.started_date,
    endDate: row.end_date,
    description: row.description,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minOrderAmount: row.min_order_amount != null ? Number(row.min_order_amount) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPromotions(options?: { activeOnly?: boolean }): Promise<Promotion[]> {
  try {
    const supabase = getSupabaseServer();
    let q = supabase
      .from("promotions")
      .select("*")
      .order("started_date", { ascending: false });
    if (options?.activeOnly) {
      const today = new Date().toISOString().slice(0, 10);
      q = q.eq("is_active", true).lte("started_date", today).gte("end_date", today);
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(rowToPromotion);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "PGRST205" || (typeof err?.code === "string" && err.code.includes("42P01"))) {
      return [];
    }
    throw e;
  }
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from("promotions").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? rowToPromotion(data as PromotionRow) : null;
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "PGRST205" || (typeof err?.code === "string" && err.code.includes("42P01"))) {
      return null;
    }
    throw e;
  }
}

/** Get promotion by id with linked product_ids (for edit form) */
export async function getPromotionByIdWithProductIds(id: string): Promise<Promotion | null> {
  const promotion = await getPromotionById(id);
  if (!promotion) return null;
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("promotion_products")
      .select("product_id")
      .eq("promotion_id", id);
    if (error) throw error;
    const productIds = (data ?? []).map((r: { product_id: string }) => r.product_id);
    return { ...promotion, productIds };
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "PGRST205" || (typeof err?.code === "string" && err.code.includes("42P01"))) {
      return promotion;
    }
    throw e;
  }
}

/** Sync promotion_products for a promotion: replace with given product_ids */
export async function syncPromotionProducts(promotionId: string, productIds: string[]): Promise<void> {
  try {
    const supabase = getSupabaseServer();
    const { error: delError } = await supabase
      .from("promotion_products")
      .delete()
      .eq("promotion_id", promotionId);
    if (delError) throw delError;
    const uniqueIds = [...new Set(productIds)].filter(Boolean);
    if (uniqueIds.length === 0) return;
    const rows = uniqueIds.map((product_id, index) => ({
      promotion_id: promotionId,
      product_id,
      application_order: index,
    }));
    const { error: insError } = await supabase.from("promotion_products").insert(rows as never);
    if (insError) throw insError;
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "PGRST205" || (typeof err?.code === "string" && String(err.code).includes("42P01"))) {
      return;
    }
    throw e;
  }
}

/** Get ordered promotion IDs for a product (for catalog discount manager) */
export async function getProductPromotionIds(productId: string): Promise<string[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("promotion_products")
    .select("promotion_id")
    .eq("product_id", productId)
    .order("application_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: { promotion_id: string }) => r.promotion_id);
}

/** Sync promotion_products for a product: replace with ordered promotion_ids (ลำดับ = application_order) */
export async function syncProductPromotions(productId: string, promotionIds: string[]): Promise<void> {
  const supabase = getSupabaseServer();
  const { error: delError } = await supabase
    .from("promotion_products")
    .delete()
    .eq("product_id", productId);
  if (delError) throw delError;
  const ids = promotionIds.filter(Boolean);
  if (ids.length === 0) return;
  const rows = ids.map((promotion_id, index) => ({
    product_id: productId,
    promotion_id,
    application_order: index,
  }));
  const { error: insError } = await supabase.from("promotion_products").insert(rows as never);
  if (insError) throw insError;
}

export async function createPromotion(
  input: Database["public"]["Tables"]["promotions"]["Insert"]
): Promise<string> {
  const supabase = getSupabaseServer();
  const row = {
    ...input,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("promotions")
    .insert(row as never)
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updatePromotion(
  id: string,
  input: Partial<Database["public"]["Tables"]["promotions"]["Update"]>
): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("promotions")
    .update({ ...input, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function deletePromotion(id: string): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw error;
}
