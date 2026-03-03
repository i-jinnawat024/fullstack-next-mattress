/**
 * Sales records & monthly targets — Supabase (Phase 2)
 */

import { getSupabaseServer } from "@/lib/db/client";
import type { Database } from "@/lib/db/schema";
import type { SalesRecord } from "@/types/sales";

type SalesRow = Database["public"]["Tables"]["sales_records"]["Row"];
type MonthlyTargetRow = Database["public"]["Tables"]["monthly_targets"]["Row"];

function rowToSalesRecord(r: SalesRow): SalesRecord {
  return {
    id: r.id,
    product_id: r.product_id,
    sold_price: r.sold_price,
    customer_name: r.customer_name,
    bill_no: r.bill_no,
    sold_at: r.sold_at,
  };
}

export interface InsertSalesRecordInput {
  product_id: string;
  sold_price: number;
  customer_name?: string | null;
  bill_no?: string | null;
  sold_at?: string; // ISO
}

export async function insertSalesRecord(input: InsertSalesRecordInput): Promise<SalesRecord> {
  const supabase = getSupabaseServer();
  const row = {
    product_id: input.product_id,
    sold_price: input.sold_price,
    customer_name: input.customer_name ?? null,
    bill_no: input.bill_no ?? null,
    sold_at: input.sold_at ?? new Date().toISOString(),
  };
  const { data, error } = await supabase.from("sales_records").insert(row as never).select().single();
  if (error) throw error;
  return rowToSalesRecord(data as SalesRow);
}

export interface SalesRecordWithProduct extends SalesRecord {
  product_name?: string;
  product_brand?: string;
}

/** List sales with optional date range and product filter */
export async function getSalesRecords(options?: {
  from?: string; // ISO date
  to?: string;
  product_id?: string;
  limit?: number;
}): Promise<SalesRecordWithProduct[]> {
  const supabase = getSupabaseServer();
  let q = supabase
    .from("sales_records")
    .select("*, products(name, brand)")
    .order("sold_at", { ascending: false });
  if (options?.product_id) q = q.eq("product_id", options.product_id);
  if (options?.from) q = q.gte("sold_at", options.from);
  if (options?.to) q = q.lte("sold_at", options.to);
  if (options?.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as (SalesRow & { products: { name: string; brand: string } | null })[];
  return rows.map((r) => {
    const rec = rowToSalesRecord(r);
    const p = r.products;
    return {
      ...rec,
      product_name: p?.name,
      product_brand: p?.brand,
    };
  });
}

/** Sum of sold_price for a given month (UTC) */
export async function getSalesTotalByMonth(year: number, month: number): Promise<number> {
  const supabase = getSupabaseServer();
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
  const { data, error } = await supabase
    .from("sales_records")
    .select("sold_price")
    .gte("sold_at", start)
    .lte("sold_at", end);
  if (error) throw error;
  const total = (data ?? []).reduce((sum, r) => sum + Number((r as { sold_price: number }).sold_price), 0);
  return total;
}

export interface MonthlyTargetWithSales {
  year: number;
  month: number;
  target_amount: number;
  target_id: string;
  sales_total: number;
}

/** Get monthly target row for a given year/month */
export async function getMonthlyTarget(
  year: number,
  month: number
): Promise<MonthlyTargetRow | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("monthly_targets")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();
  if (error) throw error;
  return data as MonthlyTargetRow | null;
}

/** List months (year, month) with target and sales total. Starts from (yearFrom, monthFrom) and goes back `count` months. */
export async function getMonthlyTargetsWithSales(
  yearFrom: number,
  monthFrom: number,
  count: number = 12
): Promise<MonthlyTargetWithSales[]> {
  const targets = await listMonthlyTargets();
  const out: MonthlyTargetWithSales[] = [];
  for (let i = 0; i < count; i++) {
    let m = monthFrom - i;
    let y = yearFrom;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    const salesTotal = await getSalesTotalByMonth(y, m);
    const targetRow = targets.find((t) => t.year === y && t.month === m);
    out.push({
      year: y,
      month: m,
      target_amount: targetRow?.target_amount ?? 0,
      target_id: targetRow?.id ?? "",
      sales_total: salesTotal,
    });
  }
  return out;
}

/** List all monthly_targets rows (for setting page) */
export async function listMonthlyTargets(): Promise<MonthlyTargetRow[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("monthly_targets")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MonthlyTargetRow[];
}

export async function upsertMonthlyTarget(
  year: number,
  month: number,
  target_amount: number
): Promise<MonthlyTargetRow> {
  const supabase = getSupabaseServer();
  type Insert = Database["public"]["Tables"]["monthly_targets"]["Insert"];
  const row: Insert = { year, month, target_amount };
  const { data, error } = await supabase
    .from("monthly_targets")
    .upsert(row as never, { onConflict: "year,month" })
    .select()
    .single();
  if (error) throw error;
  return data as MonthlyTargetRow;
}

export async function deleteMonthlyTarget(id: string): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("monthly_targets").delete().eq("id", id);
  if (error) throw error;
}
