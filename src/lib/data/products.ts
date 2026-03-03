/**
 * Product catalog — 100% Supabase (no Google Sheets)
 */

import { getSupabaseServer } from "@/lib/db/client";
import {
  computeNetPrice,
  computeNetPriceFromPromotion,
  discountPercentFromNet,
  getBestPromotionForPrice,
} from "@/lib/price";
import type { Product, PriceBySize, SizeKey, ProductActivePromotion } from "@/types/product";
import type { Database } from "@/lib/db/schema";
import { listPromotions } from "@/lib/data/promotions";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const SIZES: { key: SizeKey; col: keyof Pick<ProductRow, "size_3_5_msrp" | "size_5_msrp" | "size_6_msrp"> }[] = [
  { key: "3.5", col: "size_3_5_msrp" },
  { key: "5", col: "size_5_msrp" },
  { key: "6", col: "size_6_msrp" },
];

function rowToProduct(row: ProductRow, activePromotions?: ProductActivePromotion[]): Product {
  const sizeRows = SIZES.filter((s) => row[s.col] != null);
  const representativeMsrp =
    sizeRows.length > 0 ? (row[sizeRows[0].col] ?? 0) : 0;
  const bestPromo =
    activePromotions?.length && representativeMsrp > 0
      ? getBestPromotionForPrice(activePromotions, representativeMsrp)
      : null;

  const prices: PriceBySize[] = sizeRows.map((s) => {
    const msrp = row[s.col] ?? 0;
    let discountPercent: number;
    let netPrice: number;
    if (bestPromo) {
      netPrice = computeNetPriceFromPromotion(msrp, bestPromo.discountType, bestPromo.discountValue);
      discountPercent = discountPercentFromNet(msrp, netPrice);
    } else {
      // ไม่มีโปรผูก = แสดงราคาจริง (msrp) ไม่มีส่วนลด
      discountPercent = 0;
      netPrice = msrp;
    }
    return {
      size: s.key,
      msrp,
      discountPercent,
      netPrice,
    };
  });

  const product: Product = {
    id: row.id,
    name: row.name,
    brand: row.brand,
    imageUrl: row.image_url ?? null,
    prices,
  };
  if (activePromotions?.length) product.activePromotions = activePromotions;
  return product;
}

/** รายการแบรนด์ที่มีใน products (ไม่ซ้ำ, เรียงตามชื่อ) — ใช้สำหรับ dropdown ในฟอร์ม */
export async function getDistinctBrands(): Promise<string[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .is("deleted_at", null)
    .not("brand", "is", null)
    .order("brand");
  if (error) throw error;
  const brands = [...new Set((data ?? []).map((r) => (r as { brand: string }).brand.trim()).filter(Boolean))];
  return brands;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((row) => rowToProduct(row as ProductRow));
}

/** Products for catalog: with active promotions attached, sorted (has active promo first, then name) */
export async function getProductsForCatalog(): Promise<Product[]> {
  const supabase = getSupabaseServer();
  const [productsRes, activePromotions] = await Promise.all([
    supabase.from("products").select("*").is("deleted_at", null).eq("is_active", true).order("name"),
    listPromotions({ activeOnly: true }),
  ]);
  if (productsRes.error) throw productsRes.error;
  const rows = (productsRes.data ?? []) as ProductRow[];
  if (rows.length === 0) return [];
  if (activePromotions.length === 0) {
    return rows.map((row) => rowToProduct(row));
  }
  const promoIds = activePromotions.map((p) => p.id);
  let ppRows: { promotion_id: string; product_id: string }[] | null = null;
  try {
    const res = await supabase
      .from("promotion_products")
      .select("promotion_id, product_id")
      .in("promotion_id", promoIds);
    if (res.error) throw res.error;
    ppRows = res.data;
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "PGRST205" || (typeof err?.code === "string" && String(err.code).includes("42P01"))) {
      return rows.map((row) => rowToProduct(row));
    }
    throw e;
  }
  const promoMap = new Map(activePromotions.map((p) => [p.id, p]));
  const productToPromos = new Map<string, ProductActivePromotion[]>();
  for (const pp of ppRows ?? []) {
    const p = promoMap.get((pp as { promotion_id: string }).promotion_id);
    if (!p) continue;
    const pid = (pp as { product_id: string }).product_id;
    const arr = productToPromos.get(pid) ?? [];
    arr.push({
      id: p.id,
      name: p.name,
      endDate: p.endDate,
      discountType: p.discountType,
      discountValue: p.discountValue,
    });
    productToPromos.set(pid, arr);
  }
  const products = rows.map((row) =>
    rowToProduct(row, productToPromos.get(row.id))
  );
  products.sort((a, b) => {
    const aHas = (a.activePromotions?.length ?? 0) > 0 ? 0 : 1;
    const bHas = (b.activePromotions?.length ?? 0) > 0 ? 0 : 1;
    if (aHas !== bHas) return aHas - bHas;
    return a.name.localeCompare(b.name);
  });
  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .eq("is_active", true)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToProduct(data as ProductRow) : null;
}

/** Get product by id with active promotions and promo-based prices (for catalog detail) */
export async function getProductByIdWithActivePromotions(id: string): Promise<Product | null> {
  const supabase = getSupabaseServer();
  const { data: row, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .eq("is_active", true)
    .single();
  if (error || !row) {
    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return null;
  }
  const activePromotions = await listPromotions({ activeOnly: true });
  let promos: ProductActivePromotion[] = [];
  if (activePromotions.length > 0) {
    try {
      const { data: ppRows, error: ppError } = await supabase
        .from("promotion_products")
        .select("promotion_id")
        .eq("product_id", id)
        .in("promotion_id", activePromotions.map((p) => p.id));
      if (!ppError && ppRows?.length) {
        const linked = (ppRows as { promotion_id: string }[]).map((r) => r.promotion_id);
        promos = activePromotions
          .filter((p) => linked.includes(p.id))
          .map((p) => ({
            id: p.id,
            name: p.name,
            endDate: p.endDate,
            discountType: p.discountType,
            discountValue: p.discountValue,
          }));
      }
    } catch (_e) {
      const err = _e as { code?: string };
      if (err?.code !== "PGRST205" && !String(err?.code ?? "").includes("42P01")) throw _e;
    }
  }
  return rowToProduct(row as ProductRow, promos.length ? promos : undefined);
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  if (!query.trim()) return getAllProducts();
  const supabase = getSupabaseServer();
  const q = query.trim().toLowerCase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null)
    .eq("is_active", true)
    .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
    .order("name")
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => rowToProduct(row as ProductRow));
}

/** Admin: list all products, optionally including soft-deleted */
export async function listProductsForAdmin(options?: { includeDeleted?: boolean }) {
  const supabase = getSupabaseServer();
  let q = supabase.from("products").select("*").order("name", { nullsFirst: false });
  if (!options?.includeDeleted) {
    q = q.is("deleted_at", null);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

/** Admin: get one product by id (including soft-deleted) */
export async function getProductByIdForAdmin(id: string): Promise<ProductRow | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as ProductRow;
}

/** คอลัมน์ products ที่ยังมีใน DB (หลัง migration 010, 011 เอา discount/promotion ออก) */
const PRODUCT_WRITABLE_KEYS = [
  "name",
  "brand",
  "size_3_5_msrp",
  "size_5_msrp",
  "size_6_msrp",
  "image_url",
  "is_active",
] as const;

/** Admin: create product — ต้องรัน migrations 002 (deleted_at), 004 (image_url), 009 (is_active) */
export async function createProduct(
  input: Omit<ProductRow, "id" | "created_at" | "updated_at" | "deleted_at"> & { deleted_at?: null }
) {
  const supabase = getSupabaseServer();
  const row: Record<string, unknown> = {
    name: input.name,
    brand: input.brand,
    size_3_5_msrp: input.size_3_5_msrp ?? null,
    size_5_msrp: input.size_5_msrp ?? null,
    size_6_msrp: input.size_6_msrp ?? null,
    image_url: input.image_url ?? null,
    is_active: input.is_active ?? true,
    deleted_at: null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("products")
    .insert(row as never)
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

/** Admin: update product — ส่งเฉพาะคอลัมน์ที่ยังมีในตาราง (ไม่รวม discount_percent, promotion_end_date, free_gifts, credit_promo_text) */
export async function updateProduct(
  id: string,
  input: Partial<Omit<ProductRow, "id" | "created_at" | "deleted_at">>
) {
  const supabase = getSupabaseServer();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of PRODUCT_WRITABLE_KEYS) {
    if (key in input && input[key as keyof typeof input] !== undefined) {
      payload[key] = input[key as keyof typeof input];
    }
  }
  const { error } = await supabase.from("products").update(payload as never).eq("id", id);
  if (error) throw error;
}

/** Admin: soft delete */
export async function softDeleteProduct(id: string) {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("products")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
  if (error) throw error;
}

/** Admin: restore soft-deleted product */
export async function restoreProduct(id: string) {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("products")
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
  if (error) throw error;
}

/** Payload สำหรับอัปโหลดจาก xlsx/csv — key เป็นชื่อคอลัมน์ (ไทย/อังกฤษ) ได้ */
export type ProductUploadRow = Record<string, unknown>;

const HEADER_MAP: Record<string, keyof Pick<ProductRow, "name" | "brand" | "size_3_5_msrp" | "size_5_msrp" | "size_6_msrp" | "image_url">> = {
  name: "name",
  ชื่อ: "name",
  brand: "brand",
  แบรนด์: "brand",
  size_3_5_msrp: "size_3_5_msrp",
  "size_3.5": "size_3_5_msrp",
  "ราคา 3.5 ฟุต": "size_3_5_msrp",
  "ราคา 3.5": "size_3_5_msrp",
  size_5_msrp: "size_5_msrp",
  "size_5": "size_5_msrp",
  "ราคา 5 ฟุต": "size_5_msrp",
  "ราคา 5": "size_5_msrp",
  size_6_msrp: "size_6_msrp",
  "size_6": "size_6_msrp",
  "ราคา 6 ฟุต": "size_6_msrp",
  "ราคา 6": "size_6_msrp",
  image_url: "image_url",
  รูป: "image_url",
  image: "image_url",
};

type ProductUploadField = keyof Pick<ProductRow, "name" | "brand" | "size_3_5_msrp" | "size_5_msrp" | "size_6_msrp" | "image_url">;

/** ดึงค่าจาก raw row ตาม field — หา key ใน raw ที่แมปไป field นั้น */
function getField(raw: ProductUploadRow, field: ProductUploadField): unknown {
  for (const [header, mapped] of Object.entries(HEADER_MAP)) {
    if (mapped !== field) continue;
    const v = raw[header];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return raw[field];
}

function normalizeUploadRow(raw: ProductUploadRow): Omit<ProductRow, "id" | "created_at" | "updated_at" | "deleted_at"> | null {
  const name = String(getField(raw, "name") ?? "").trim();
  const brand = String(getField(raw, "brand") ?? "").trim();
  if (!name || !brand) return null;

  const num = (v: unknown): number | null => {
    if (v == null || v === "") return null;
    const n = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  };
  const dateStr = (v: unknown): string | null => {
    if (v == null || v === "") return null;
    const s = String(v).trim();
    if (!s) return null;
    const d = new Date(s);
    return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : null;
  };
  const str = (v: unknown): string | null => {
    if (v == null || v === "") return null;
    return String(v).trim() || null;
  };

  return {
    name,
    brand,
    size_3_5_msrp: num(getField(raw, "size_3_5_msrp")) ?? null,
    size_5_msrp: num(getField(raw, "size_5_msrp")) ?? null,
    size_6_msrp: num(getField(raw, "size_6_msrp")) ?? null,
    discount_percent: num(getField(raw, "discount_percent")) ?? 0,
    promotion_end_date: dateStr(getField(raw, "promotion_end_date")) ?? null,
    free_gifts: str(getField(raw, "free_gifts")) ?? null,
    credit_promo_text: str(getField(raw, "credit_promo_text")) ?? null,
    image_url: str(getField(raw, "image_url")) ?? null,
    is_active: true,
  };
}

/** Admin: สร้างสินค้าหลายรายการจากแถวที่ parse จาก xlsx/csv */
export async function createProductsBulk(rows: ProductUploadRow[]): Promise<{ created: number; skipped: number; errors: string[] }> {
  const supabase = getSupabaseServer();
  const result = { created: 0, skipped: 0, errors: [] as string[] };
  const toInsert: Record<string, unknown>[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < rows.length; i++) {
    const normalized = normalizeUploadRow(rows[i]);
    if (!normalized) {
      result.skipped++;
      result.errors.push(`แถว ${i + 2}: ข้าม (ไม่มีชื่อหรือแบรนด์)`);
      continue;
    }
    toInsert.push({
      ...normalized,
      deleted_at: null,
      updated_at: now,
    });
  }

  if (toInsert.length === 0) return result;

  const { data, error } = await supabase
    .from("products")
    .insert(toInsert as never)
    .select("id");
  if (error) {
    result.errors.push(error.message);
    return result;
  }
  result.created = (data ?? []).length;
  return result;
}
